import { NextResponse, NextRequest } from "next/server";
import { Pool } from "pg";
import * as jose from "jose";
import { rateLimit, RateLimitPresets } from "@/utils/rateLimit";

export const POST = async (request: NextRequest) => {
  // Rate limiting: 15 requests per minute (write operations)
  const rateLimitResult = rateLimit(request, RateLimitPresets.WRITE);
  if (rateLimitResult) {
    // Log spam attempt for VIP endpoint
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";
    const authCookie = request.cookies.get("auth_code");
    
    console.warn("⚠️ [VIP SPAM ATTEMPT]", {
      timestamp: new Date().toISOString(),
      ip: ip,
      userAgent: userAgent,
      hasAuth: !!authCookie,
      endpoint: "/api/vip",
      method: "POST"
    });
    
    return rateLimitResult;
  }

  let client: Pool | null = null;
  
  try {
    const body = await request.json();
    const { login, category = "student" } = body;

    if (!login) {
      return NextResponse.json(
        { error: "Login is required" },
        { status: 400 }
      );
    }

    // Verify JWT first
    await jose.jwtVerify(
      request.cookies.get("auth_code")?.value as string,
      new TextEncoder().encode(process.env.SECRET_KEY as string)
    );
    
    const whoUrl = new URL("/api/who", request.url);
    const fetchme = await fetch(whoUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: `auth_code=${request.cookies.get("auth_code")?.value};`,
      },
      credentials: "include",
    });

    if (!fetchme.ok) {
      return NextResponse.json(
        { error: "Authentication failed" },
        { status: 401 }
      );
    }

    const currentUser = await fetchme.json();
    
    client = new Pool({ connectionString: process.env.DATABASE_KEY });

    // Check if user is a creator in the database
    const adminCheckQuery = `SELECT * FROM leets.vip WHERE login = $1 AND token = 'creator'`;
    const adminCheckResult = await client.query(adminCheckQuery, [currentUser.login]);
    
    if (adminCheckResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Unauthorized. Only creators can manage VIP access." },
        { status: 403 }
      );
    }

    const checkExistingQuery = `SELECT * FROM leets.vip WHERE login = $1`;
    const existingUser = await client.query(checkExistingQuery, [login]);

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { error: "User already has VIP access" },
        { status: 409 }
      );
    }

    const insertQuery = `
      INSERT INTO leets.vip (category, login, profile, token)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    
    const result = await client.query(insertQuery, [
      category,
      login,
      "",
      "member"
    ]);

    return NextResponse.json(
      { 
        message: "User added to VIP successfully",
        user: result.rows[0]
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Error in VIP POST request:", error);
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

export const GET = async (request: NextRequest) => {
  let client: Pool | null = null;
  
  try {
    // Verify JWT first
    await jose.jwtVerify(
      request.cookies.get("auth_code")?.value as string,
      new TextEncoder().encode(process.env.SECRET_KEY as string)
    );
    
    const whoUrl = new URL("/api/who", request.url);
    const fetchme = await fetch(whoUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: `auth_code=${request.cookies.get("auth_code")?.value};`,
      },
      credentials: "include",
    });

    if (!fetchme.ok) {
      return NextResponse.json(
        { error: "Authentication failed" },
        { status: 401 }
      );
    }

    const currentUser = await fetchme.json();
    
    client = new Pool({ connectionString: process.env.DATABASE_KEY });

    // Check if user is a creator in the database
    const adminCheckQuery = `SELECT * FROM leets.vip WHERE login = $1 AND token = 'creator'`;
    const adminCheckResult = await client.query(adminCheckQuery, [currentUser.login]);
    
    if (adminCheckResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Unauthorized. Only creators can view VIP users." },
        { status: 403 }
      );
    }

    // Updated query to include token (vip status) and feedback badges
    const query = `
      SELECT 
        v.id, 
        v.category, 
        v.login, 
        v.token as vip_status,
        v.created_at, 
        v.updated_at,
        COALESCE(
          array_agg(f.badge_type) FILTER (WHERE f.badge_awarded = TRUE),
          ARRAY[]::text[]
        ) as badges
      FROM leets.vip v
      LEFT JOIN leets.feedback f ON v.login = f.user_login AND f.badge_awarded = TRUE
      GROUP BY v.id, v.category, v.login, v.token, v.created_at, v.updated_at
      ORDER BY v.created_at DESC
    `;
    const result = await client.query(query);

    return NextResponse.json(
      { users: result.rows },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error in VIP GET request:", error);
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

export const DELETE = async (request: NextRequest) => {
  let client: Pool | null = null;
  
  try {
    const url = new URL(request.url);
    const login = url.searchParams.get("login");

    if (!login) {
      return NextResponse.json(
        { error: "Login parameter is required" },
        { status: 400 }
      );
    }

    // Verify JWT first
    await jose.jwtVerify(
      request.cookies.get("auth_code")?.value as string,
      new TextEncoder().encode(process.env.SECRET_KEY as string)
    );
    
    const whoUrl = new URL("/api/who", request.url);
    const fetchme = await fetch(whoUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: `auth_code=${request.cookies.get("auth_code")?.value};`,
      },
      credentials: "include",
    });

    if (!fetchme.ok) {
      return NextResponse.json(
        { error: "Authentication failed" },
        { status: 401 }
      );
    }

    const currentUser = await fetchme.json();
    
    client = new Pool({ connectionString: process.env.DATABASE_KEY });

    // Check if user is a creator in the database
    const adminCheckQuery = `SELECT * FROM leets.vip WHERE login = $1 AND token = 'creator'`;
    const adminCheckResult = await client.query(adminCheckQuery, [currentUser.login]);
    
    if (adminCheckResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Unauthorized. Only creators can remove VIP users." },
        { status: 403 }
      );
    }

    // Check if user being deleted is a creator (cannot delete creators)
    if (login) {
      const userToDeleteQuery = `SELECT * FROM leets.vip WHERE login = $1 AND token = 'creator'`;
      const userToDeleteResult = await client.query(userToDeleteQuery, [login]);
      if (userToDeleteResult.rows.length > 0) {
        return NextResponse.json(
          { error: "Cannot remove creator user" },
          { status: 403 }
        );
      }
    }

    const deleteQuery = `DELETE FROM leets.vip WHERE login = $1 RETURNING *`;
    const result = await client.query(deleteQuery, [login]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { 
        message: "User removed from VIP successfully",
        user: result.rows[0]
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error in VIP DELETE request:", error);
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
