import { NextRequest, NextResponse } from "next/server";
import { DecryptionFunction } from "../auth/type.auth";
import * as jose from "jose";
import pg from "pg";
import { rateLimit, RateLimitPresets } from "@/utils/rateLimit";

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_KEY,
});

export async function GET(request: NextRequest) {
  // Rate limiting: 60 requests per minute
  const rateLimitResult = await rateLimit(request, RateLimitPresets.RELAXED);
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
    
    // Get user ID from JWT token (no 42 API call needed!)
    const userId = decodedToken.userId;
    
    if (!userId) {
      // Old JWT without userId - force re-login
      return NextResponse.json(
        { error: "Token outdated. Please log in again." },
        { status: 401 }
      );
    }

    // Check if notifications table exists, if not return empty
    const tableCheckQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'notifications'
      );
    `;
    
    const tableExists = await pool.query(tableCheckQuery);
    
    if (!tableExists.rows[0].exists) {
      return NextResponse.json({
        notifications: [],
        unread_count: 0,
      });
    }

    // Get notifications for this user (both 'all' and specific to user)
    const notificationsQuery = `
      SELECT 
        n.*,
        CASE 
          WHEN unr.user_id IS NOT NULL THEN true 
          ELSE false 
        END as is_seen
      FROM notifications n
      LEFT JOIN user_notification_reads unr 
        ON n.id = unr.notification_id AND unr.user_id = $1
      WHERE 
        (n.target_type = 'all' OR n.target_user_id = $1)
        AND (n.expires_at IS NULL OR n.expires_at > NOW())
      ORDER BY n.created_at DESC
      LIMIT 50
    `;

    const notificationsResult = await pool.query(notificationsQuery, [userId]);

    // Count unread notifications
    const unreadCountQuery = `
      SELECT COUNT(*) as count
      FROM notifications n
      LEFT JOIN user_notification_reads unr 
        ON n.id = unr.notification_id AND unr.user_id = $1
      WHERE 
        (n.target_type = 'all' OR n.target_user_id = $1)
        AND (n.expires_at IS NULL OR n.expires_at > NOW())
        AND unr.user_id IS NULL
    `;

    const unreadCountResult = await pool.query(unreadCountQuery, [userId]);
    const unreadCount = parseInt(unreadCountResult.rows[0].count);

    return NextResponse.json({
      notifications: notificationsResult.rows,
      unread_count: unreadCount,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    console.error("Error details:", error instanceof Error ? error.message : error);
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
        notifications: [],
        unread_count: 0
      },
      { status: 500 }
    );
  }
}
