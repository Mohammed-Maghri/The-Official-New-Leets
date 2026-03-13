import { NextRequest, NextResponse } from "next/server";
import * as jose from "jose";
import { Pool } from "pg";
import { DecryptionFunction } from "../auth/type.auth";
import { rateLimit, RateLimitPresets } from "@/utils/rateLimit";

const pool = new Pool({ connectionString: process.env.DATABASE_KEY });

async function getUserLogin(request: NextRequest): Promise<string | null> {
  const cookie = request.cookies.get("auth_code");
  if (!cookie?.value) return null;

  try {
    const secret = new TextEncoder().encode(process.env.SECRET_KEY as string);
    await jose.jwtVerify(cookie.value, secret);
    const decoded = jose.decodeJwt(cookie.value);
    const token = decoded.token as string;
    if (!token) return null;
    const accessToken = DecryptionFunction(token);
    const res = await fetch(`${process.env.INTRA_TOKEN}/v2/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) return null;
    const user = await res.json();
    return user.login ?? null;
  } catch {
    return null;
  }
}

// GET: List projects for the current user
export async function GET(request: NextRequest) {
  const rateLimitResult = await rateLimit(request, RateLimitPresets.RELAXED);
  if (rateLimitResult) return rateLimitResult;

  const userLogin = await getUserLogin(request);
  if (!userLogin) {
    return NextResponse.json(
      { error: "Authentication required to load projects" },
      { status: 401 }
    );
  }

  try {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT id, name, created_at, updated_at
         FROM leets.schema_projects
         WHERE user_login = $1
         ORDER BY updated_at DESC`,
        [userLogin]
      );
      return NextResponse.json({ projects: result.rows });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Schema projects GET error:", error);
    return NextResponse.json(
      { error: "Failed to load projects" },
      { status: 500 }
    );
  }
}

// POST: Create a new project
export async function POST(request: NextRequest) {
  const rateLimitResult = await rateLimit(request, RateLimitPresets.RELAXED);
  if (rateLimitResult) return rateLimitResult;

  const userLogin = await getUserLogin(request);
  if (!userLogin) {
    return NextResponse.json(
      { error: "Authentication required to create projects" },
      { status: 401 }
    );
  }

  let body: { name?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const name = (body.name ?? "Untitled Project").trim().slice(0, 255) || "Untitled Project";

  try {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `INSERT INTO leets.schema_projects (name, user_login, nodes, edges)
         VALUES ($1, $2, '[]', '[]')
         RETURNING id, name, created_at, updated_at`,
        [name, userLogin]
      );
      const row = result.rows[0];
      return NextResponse.json({
        id: row.id,
        name: row.name,
        created_at: row.created_at,
        updated_at: row.updated_at,
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Schema projects POST error:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}
