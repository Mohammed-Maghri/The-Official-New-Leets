import { NextResponse, NextRequest } from "next/server";
import { Pool } from "pg";
import * as jose from "jose";

export const GET = async (request: NextRequest) => {
  let client: Pool | null = null;
  
  try {
    // Verify JWT first
    const authCookie = request.cookies.get("auth_code")?.value;
    if (!authCookie) {
      return NextResponse.json(
        { error: "You are not an allowed user" },
        { status: 403 }
      );
    }

    // Verify the JWT token
    try {
      await jose.jwtVerify(
        authCookie,
        new TextEncoder().encode(process.env.SECRET_KEY as string)
      );
    } catch {
      return NextResponse.json(
        { error: "You are not an allowed user" },
        { status: 403 }
      );
    }
    
    // Get current user info
    const fetchme = await fetch(
      process.env.NODE_ENV === "production"
        ? `${process.env.productionUrl}/api/who`
        : "http://localhost:3000/api/who",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Cookie: `auth_code=${authCookie};`,
        },
        credentials: "include",
      }
    );

    if (!fetchme.ok) {
      return NextResponse.json(
        { error: "You are not an allowed user" },
        { status: 403 }
      );
    }

    const currentUser = await fetchme.json();
    
    client = new Pool({ connectionString: process.env.DATABASE_KEY });

    // Check if the requesting user is in the VIP table
    const vipCheckQuery = `SELECT * FROM leets.vip WHERE login = $1`;
    const vipCheckResult = await client.query(vipCheckQuery, [currentUser.login]);
    
    // If user is not in VIP table, deny access
    if (vipCheckResult.rows.length === 0) {
      return NextResponse.json(
        { error: "You are not an allowed user" },
        { status: 403 }
      );
    }

    // User is in VIP, return the list of VIP users
    const query = `SELECT login FROM leets.vip`;
    const result = await client.query(query);

    const vipLogins = result.rows.map(row => row.login);

    return NextResponse.json(
      { vipUsers: vipLogins },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error fetching VIP users:", error);
    return NextResponse.json(
      { error: "Internal Server Error: " + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  } finally {
    if (client) {
      try {
        await client.end();
      } catch (endError) {
        console.error("Error closing pool:", endError);
      }
    }
  }
};
