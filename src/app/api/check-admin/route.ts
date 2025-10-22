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
        { isAdmin: false },
        { status: 200 }
      );
    }

    await jose.jwtVerify(
      authCookie,
      new TextEncoder().encode(process.env.SECRET_KEY as string)
    );
    
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
        { isAdmin: false },
        { status: 200 }
      );
    }

    const currentUser = await fetchme.json();
    
    client = new Pool({ connectionString: process.env.DATABASE_KEY });

    // Check if user is an admin (owner) in the database
    const adminCheckQuery = `SELECT * FROM leets.vip WHERE login = $1 AND token = 'owner'`;
    const adminCheckResult = await client.query(adminCheckQuery, [currentUser.login]);
    
    const isAdmin = adminCheckResult.rows.length > 0;

    return NextResponse.json(
      { isAdmin, login: currentUser.login },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error checking admin status:", error);
    return NextResponse.json(
      { isAdmin: false },
      { status: 200 }
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
