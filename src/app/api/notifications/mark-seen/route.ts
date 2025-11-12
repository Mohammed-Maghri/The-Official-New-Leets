import { NextRequest, NextResponse } from "next/server";
import { DecryptionFunction } from "../../auth/type.auth";
import * as jose from "jose";
import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_KEY,
});

export async function POST(request: NextRequest) {
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

    // Fetch user data from 42 API to get user ID
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

    // Get notification_id from request body
    const body = await request.json();
    const { notification_id, mark_all } = body;

    if (mark_all) {
      // Mark all notifications as seen for this user
      const allNotificationsQuery = `
        SELECT id FROM notifications 
        WHERE (target_type = 'all' OR target_user_id = $1)
        AND (expires_at IS NULL OR expires_at > NOW())
      `;
      const allNotifications = await pool.query(allNotificationsQuery, [userId]);

      for (const notif of allNotifications.rows) {
        await pool.query(
          `INSERT INTO user_notification_reads (notification_id, user_id) 
           VALUES ($1, $2) 
           ON CONFLICT (notification_id, user_id) DO NOTHING`,
          [notif.id, userId]
        );
      }

      return NextResponse.json({ 
        success: true, 
        message: "All notifications marked as seen" 
      });
    } else if (notification_id) {
      // Mark specific notification as seen
      await pool.query(
        `INSERT INTO user_notification_reads (notification_id, user_id) 
         VALUES ($1, $2) 
         ON CONFLICT (notification_id, user_id) DO NOTHING`,
        [notification_id, userId]
      );

      return NextResponse.json({ 
        success: true, 
        message: "Notification marked as seen" 
      });
    } else {
      return NextResponse.json(
        { error: "Missing notification_id or mark_all parameter" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error marking notification as seen:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
