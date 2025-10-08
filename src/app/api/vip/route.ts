import { NextResponse, NextRequest } from "next/server";
import { Pool } from "pg";
import * as jose from "jose";

export const POST = async (request: NextRequest) => {
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
    
    const fetchme = await fetch(
      process.env.NODE_ENV === "production"
        ? `${process.env.productionUrl}/api/who`
        : "http://localhost:3000/api/who",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Cookie: `auth_code=${request.cookies.get("auth_code")?.value};`,
        },
        credentials: "include",
      }
    );

    if (!fetchme.ok) {
      return NextResponse.json(
        { error: "Authentication failed" },
        { status: 401 }
      );
    }

    const currentUser = await fetchme.json();
    
    if (currentUser.login !== "mmaghri") {
      return NextResponse.json(
        { error: "Ur not a Auth Admin" },
        { status: 403 }
      );
    }

    client = new Pool({ connectionString: process.env.DATABASE_KEY });

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
    
    const fetchme = await fetch(
      process.env.NODE_ENV === "production"
        ? `${process.env.productionUrl}/api/who`
        : "http://localhost:3000/api/who",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Cookie: `auth_code=${request.cookies.get("auth_code")?.value};`,
        },
        credentials: "include",
      }
    );

    if (!fetchme.ok) {
      return NextResponse.json(
        { error: "Authentication failed" },
        { status: 401 }
      );
    }

    const currentUser = await fetchme.json();
    
    if (currentUser.login !== "mmaghri") {
      return NextResponse.json(
        { error: "Ur not a Auth Admin" },
        { status: 403 }
      );
    }

    client = new Pool({ connectionString: process.env.DATABASE_KEY });

    const query = `SELECT id, category, login, created_at, updated_at FROM leets.vip ORDER BY created_at DESC`;
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
    
    const fetchme = await fetch(
      process.env.NODE_ENV === "production"
        ? `${process.env.productionUrl}/api/who`
        : "http://localhost:3000/api/who",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Cookie: `auth_code=${request.cookies.get("auth_code")?.value};`,
        },
        credentials: "include",
      }
    );

    if (!fetchme.ok) {
      return NextResponse.json(
        { error: "Authentication failed" },
        { status: 401 }
      );
    }

    const currentUser = await fetchme.json();
    
    if (currentUser.login !== "mmaghri") {
      return NextResponse.json(
        { error: "Ur not a Auth Admin" },
        { status: 403 }
      );
    }

    if (login === "mmaghri") {
      return NextResponse.json(
        { error: "Cannot remove admin user" },
        { status: 403 }
      );
    }

    client = new Pool({ connectionString: process.env.DATABASE_KEY });

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
