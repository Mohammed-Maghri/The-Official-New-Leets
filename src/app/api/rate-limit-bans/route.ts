import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
import * as jose from "jose";

const pool = new Pool({
  connectionString: process.env.DATABASE_KEY || process.env.DATABASE_URL,
});

export async function GET(request: NextRequest) {
  try {
    // Check if user is admin
    const authCookie = request.cookies.get("auth_code")?.value;
    if (!authCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const secret = new TextEncoder().encode(process.env.SECRET_KEY as string);
    
    try {
      await jose.jwtVerify(authCookie, secret);
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const decodedToken = jose.decodeJwt(authCookie);
    const userLogin = decodedToken.login as string;

    // Check if user is admin (you can add your admin check here)
    // For now, checking if they're in VIP table as staff
    const adminCheck = await pool.query(
      "SELECT * FROM vip WHERE login = $1 AND category = 'staff'",
      [userLogin]
    );

    if (adminCheck.rows.length === 0) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    // Get all currently banned users
    const now = Date.now();
    const result = await pool.query(
      `SELECT 
        identifier, 
        block_count, 
        reset_time, 
        last_block_time,
        updated_at
      FROM rate_limits 
      WHERE block_count > 0 AND reset_time > $1
      ORDER BY last_block_time DESC`,
      [now]
    );

    const bannedUsers = result.rows.map(row => {
      const resetTime = parseInt(row.reset_time);
      const remainingSeconds = Math.ceil((resetTime - now) / 1000);
      
      let banDuration: string;
      if (row.block_count === 1) {
        banDuration = "2 minutes";
      } else if (row.block_count === 2) {
        banDuration = "5 minutes";
      } else {
        banDuration = "10 minutes";
      }

      return {
        identifier: row.identifier,
        blockCount: row.block_count,
        banDuration,
        remainingSeconds,
        lastBlockTime: new Date(parseInt(row.last_block_time)).toISOString(),
        updatedAt: row.updated_at,
      };
    });

    return NextResponse.json({ bannedUsers }, { status: 200 });
  } catch (error) {
    console.error("Error fetching banned users:", error);
    return NextResponse.json(
      { error: "Failed to fetch banned users" },
      { status: 500 }
    );
  }
}
