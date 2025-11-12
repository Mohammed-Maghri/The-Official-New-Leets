import { NextResponse, NextRequest } from "next/server";
import * as jose from "jose";
import { Pool } from "pg";

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_KEY as string,
});

// Cleanup messages older than 24 hours (runs every hour)
setInterval(async () => {
  const client = await pool.connect();
  try {
    await client.query(
      `DELETE FROM leets.chat_messages WHERE created_at < NOW() - INTERVAL '24 hours'`
    );
  } catch (error) {
    console.error("Error cleaning up old messages:", error);
  } finally {
    client.release();
  }
}, 60 * 60 * 1000); // Run every hour

// GET: Fetch all messages
export async function GET(request: NextRequest) {
  const client = await pool.connect();
  try {
    const user = request.cookies.get("auth_code");
    
    if (!user || !user.value) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    const secret = new TextEncoder().encode(process.env.SECRET_KEY as string);
    
    // Verify JWT token
    try {
      await jose.jwtVerify(user.value, secret);
    } catch (jwtError) {
      console.error("JWT verification failed:", jwtError);
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }
    
    // Fetch messages from database (last 100 messages)
    const result = await client.query(
      `SELECT 
        message_id as id,
        message,
        username,
        avatar,
        level,
        campus,
        EXTRACT(EPOCH FROM created_at) * 1000 as timestamp
      FROM leets.chat_messages 
      ORDER BY created_at DESC 
      LIMIT 100`
    );
    
    return NextResponse.json({ messages: result.rows }, { status: 200 });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

// POST: Send a new message
export async function POST(request: NextRequest) {
  const client = await pool.connect();
  try {
    const user = request.cookies.get("auth_code");
    
    if (!user || !user.value) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    const secret = new TextEncoder().encode(process.env.SECRET_KEY as string);
    const userToken = user.value;
    
    // Verify JWT token
    let userData;
    try {
      const { payload } = await jose.jwtVerify(userToken, secret);
      userData = payload.userData as {
        login: string;
        avatar: string;
        level: number;
        campus: string;
      };
      
      if (!userData) {
        throw new Error("No user data in token");
      }
    } catch (jwtError) {
      console.error("JWT verification failed:", jwtError);
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    const { message } = body;
    
    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }
    
    // Sanitize message
    const sanitizedMessage = message.trim().slice(0, 1000);
    
    if (sanitizedMessage.length === 0) {
      return NextResponse.json(
        { error: "Message cannot be empty" },
        { status: 400 }
      );
    }
    
    // Create new message ID
    const messageId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Insert message into database
    const result = await client.query(
      `INSERT INTO leets.chat_messages (message_id, message, username, avatar, level, campus)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING 
         message_id as id,
         message,
         username,
         avatar,
         level,
         campus,
         EXTRACT(EPOCH FROM created_at) * 1000 as timestamp`,
      [messageId, sanitizedMessage, userData.login, userData.avatar, userData.level, userData.campus]
    );
    
    const newMessage = result.rows[0];
    
    
    return NextResponse.json({ message: newMessage }, { status: 201 });
  } catch (error) {
    console.error("Error posting message:", error);
    return NextResponse.json(
      { error: "Failed to post message" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
