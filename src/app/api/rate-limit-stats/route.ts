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

    // Check if user is admin
    const adminCheck = await pool.query(
      "SELECT * FROM leets.vip WHERE login = $1 AND (token = 'owner' OR token = 'creator')",
      [userLogin]
    );

    if (adminCheck.rows.length === 0) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    // Get all rate limit entries
    const result = await pool.query(
      `SELECT 
        identifier, 
        count, 
        reset_time, 
        block_count, 
        last_block_time,
        updated_at
      FROM rate_limits 
      ORDER BY count DESC, updated_at DESC`
    );

    const users = result.rows.map(row => ({
      identifier: row.identifier,
      count: row.count,
      blockCount: row.block_count,
      resetTime: parseInt(row.reset_time),
      lastBlockTime: parseInt(row.last_block_time),
      updatedAt: row.updated_at,
    }));

    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    console.error("Error fetching rate limit stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch rate limit stats" },
      { status: 500 }
    );
  }
}
