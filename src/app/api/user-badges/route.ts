import { NextResponse } from "next/server";
import { Pool } from "pg";

export async function GET(req: Request) {
  let client;
  
  try {
    const { searchParams } = new URL(req.url);
    const login = searchParams.get("login");

    if (!login) {
      return NextResponse.json(
        { error: "Login parameter is required" },
        { status: 400 }
      );
    }

    client = new Pool({ connectionString: process.env.DATABASE_KEY });

    // Get VIP status and role (member, vip, creator)
    const vipQuery = `SELECT token FROM leets.vip WHERE login = $1`;
    const vipResult = await client.query(vipQuery, [login]);
    
    const vipStatus = vipResult.rows.length > 0 ? vipResult.rows[0].token : null;

    // Get feedback badges
    const badgeQuery = `
      SELECT badge_type 
      FROM leets.feedback 
      WHERE user_login = $1 AND badge_awarded = TRUE 
      ORDER BY created_at DESC
    `;
    const badgeResult = await client.query(badgeQuery, [login]);
    
    const badges = badgeResult.rows.map(row => row.badge_type);

    return NextResponse.json(
      {
        success: true,
        login,
        vipStatus, // 'creator', 'vip', or null
        badges, // Array of badge types
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error fetching user badges:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    if (client) {
      await client.end();
    }
  }
}
