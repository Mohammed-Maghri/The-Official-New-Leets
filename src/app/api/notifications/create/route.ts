import { NextRequest, NextResponse } from "next/server";
import { DecryptionFunction } from "../../auth/type.auth";
import * as jose from "jose";
import pg from "pg";
import { rateLimit } from "@/utils/rateLimit";

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_KEY,
});

export async function POST(request: NextRequest) {
  // Rate limiting: 10 requests per minute (strict - prevents notification spam)
  const rateLimitResult = await rateLimit(request, { maxRequests: 10, windowMs: 60000 });
  if (rateLimitResult) return rateLimitResult;

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
    try {
      await jose.jwtVerify(userToken, secret);
    } catch (jwtError) {
      console.error("JWT verification failed:", jwtError);
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }
    
    // Decode and decrypt token
    const decodedToken = jose.decodeJwt(userToken);
    if (!decodedToken.token) {
      return NextResponse.json(
        { error: "Invalid token structure" },
        { status: 401 }
      );
    }
    
    const accessToken = DecryptionFunction(decodedToken.token as string);

    // Fetch user data from 42 API to check if admin
    const userResponse = await fetch((process.env.INTRA_TOKEN as string) + "/v2/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: "include",
    });

    if (!userResponse.ok) {
      return NextResponse.json(
        { error: "Failed to fetch user data" },
        { status: 401 }
      );
    }

    const userData = await userResponse.json();
    const userId = userData.id;

    // Check if user is admin
    const adminCheck = await pool.query(
      "SELECT * FROM users WHERE id = $1 AND is_admin = true",
      [userId]
    );

    if (adminCheck.rows.length === 0) {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    // Get notification data from request body
    const body = await request.json();
    const { 
      title, 
      message, 
      type = 'info', 
      target_type, 
      target_user_id = null,
      expires_at = null,
      link = null,
      sender_username = 'mmaghri',
      sender_image = 'https://cdn.intra.42.fr/users/83b4706433bb90d165a91eafb7c9bb86/large_mmaghri.jpg'
    } = body;

    // Validate required fields
    if (!title || !message || !target_type) {
      return NextResponse.json(
        { error: "Missing required fields: title, message, target_type" },
        { status: 400 }
      );
    }

    // Validate target_type
    if (target_type !== 'all' && target_type !== 'specific') {
      return NextResponse.json(
        { error: "target_type must be 'all' or 'specific'" },
        { status: 400 }
      );
    }

    // If specific, target_user_id is required
    if (target_type === 'specific' && !target_user_id) {
      return NextResponse.json(
        { error: "target_user_id is required when target_type is 'specific'" },
        { status: 400 }
      );
    }

    // Insert notification
    const insertQuery = `
      INSERT INTO notifications (
        title, message, type, target_type, target_user_id, expires_at, link, sender_username, sender_image
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const result = await pool.query(insertQuery, [
      title,
      message,
      type,
      target_type,
      target_user_id,
      expires_at,
      link,
      sender_username,
      sender_image
    ]);

    return NextResponse.json({
      success: true,
      notification: result.rows[0],
      message: "Notification created successfully"
    });
  } catch (error) {
    console.error("Error creating notification:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
