import { NextRequest, NextResponse } from "next/server";
import * as jose from "jose";
import { Pool } from "pg";
import { DecryptionFunction } from "../../auth/type.auth";
import { rateLimit, RateLimitPresets } from "@/utils/rateLimit";
import { schemaProjectPutBodySchema } from "../schema-projects.types";

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

// GET: Load a single project with nodes and edges
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateLimitResult = await rateLimit(request, RateLimitPresets.RELAXED);
  if (rateLimitResult) return rateLimitResult;

  const userLogin = await getUserLogin(request);
  if (!userLogin) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  const id = parseInt((await params).id, 10);
  if (isNaN(id) || id < 1) {
    return NextResponse.json({ error: "Invalid project id" }, { status: 400 });
  }

  try {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT id, name, nodes, edges, created_at, updated_at
         FROM leets.schema_projects
         WHERE id = $1 AND user_login = $2`,
        [id, userLogin]
      );
      if (result.rows.length === 0) {
        return NextResponse.json({ error: "Project not found" }, { status: 404 });
      }
      const row = result.rows[0];
      return NextResponse.json({
        id: row.id,
        name: row.name,
        nodes: row.nodes ?? [],
        edges: row.edges ?? [],
        created_at: row.created_at,
        updated_at: row.updated_at,
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Schema project GET error:", error);
    return NextResponse.json(
      { error: "Failed to load project" },
      { status: 500 }
    );
  }
}

// PUT: Update project (name, nodes, edges)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateLimitResult = await rateLimit(request, RateLimitPresets.RELAXED);
  if (rateLimitResult) return rateLimitResult;

  const userLogin = await getUserLogin(request);
  if (!userLogin) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  const id = parseInt((await params).id, 10);
  if (isNaN(id) || id < 1) {
    return NextResponse.json({ error: "Invalid project id" }, { status: 400 });
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parseResult = schemaProjectPutBodySchema.safeParse(rawBody);
  if (!parseResult.success) {
    const firstError = parseResult.error.issues[0];
    const message = firstError?.message ?? "Invalid request body";
    return NextResponse.json(
      { error: message },
      { status: 400 }
    );
  }

  const { name, nodes, edges } = parseResult.data;

  try {
    const client = await pool.connect();
    try {
      if (name !== undefined && nodes === undefined && edges === undefined) {
        await client.query(
          `UPDATE leets.schema_projects
           SET name = $1, updated_at = CURRENT_TIMESTAMP
           WHERE id = $2 AND user_login = $3`,
          [name || "Untitled Project", id, userLogin]
        );
      } else {
        const parts: string[] = ["updated_at = CURRENT_TIMESTAMP"];
        const values: unknown[] = [];
        let p = 1;
        if (name !== undefined) {
          parts.push(`name = $${p++}`);
          values.push(name || "Untitled Project");
        }
        if (nodes !== undefined) {
          parts.push(`nodes = $${p++}`);
          values.push(JSON.stringify(nodes));
        }
        if (edges !== undefined) {
          parts.push(`edges = $${p++}`);
          values.push(JSON.stringify(edges));
        }
        values.push(id, userLogin);
        await client.query(
          `UPDATE leets.schema_projects
           SET ${parts.join(", ")}
           WHERE id = $${p} AND user_login = $${p + 1}`,
          values
        );
      }

      const check = await client.query(
        `SELECT id FROM leets.schema_projects WHERE id = $1 AND user_login = $2`,
        [id, userLogin]
      );
      if (check.rows.length === 0) {
        return NextResponse.json({ error: "Project not found" }, { status: 404 });
      }

      return NextResponse.json({ ok: true });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Schema project PUT error:", error);
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 }
    );
  }
}

// DELETE: Remove project
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateLimitResult = await rateLimit(request, RateLimitPresets.RELAXED);
  if (rateLimitResult) return rateLimitResult;

  const userLogin = await getUserLogin(request);
  if (!userLogin) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  const id = parseInt((await params).id, 10);
  if (isNaN(id) || id < 1) {
    return NextResponse.json({ error: "Invalid project id" }, { status: 400 });
  }

  try {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `DELETE FROM leets.schema_projects
         WHERE id = $1 AND user_login = $2
         RETURNING id`,
        [id, userLogin]
      );
      if (result.rows.length === 0) {
        return NextResponse.json({ error: "Project not found" }, { status: 404 });
      }
      return NextResponse.json({ ok: true });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Schema project DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    );
  }
}
