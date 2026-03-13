import { NextRequest, NextResponse } from "next/server";
import * as jose from "jose";
import { Pool } from "pg";
import { DecryptionFunction } from "../../auth/type.auth";
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

// GET: Load a single canvas project
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
        `SELECT id, name, image_data, board_mode, created_at, updated_at
         FROM leets.canvas_projects
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
        image_data: row.image_data ?? null,
        board_mode: row.board_mode ?? "black",
        created_at: row.created_at,
        updated_at: row.updated_at,
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Canvas project GET error:", error);
    return NextResponse.json(
      { error: "Failed to load project" },
      { status: 500 }
    );
  }
}

// PUT: Update canvas project (name, image_data, board_mode)
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

  let body: { name?: string; image_data?: string; board_mode?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const name = body.name != null ? String(body.name).trim().slice(0, 255) : undefined;
  const image_data = body.image_data != null ? String(body.image_data) : undefined;
  const board_mode = body.board_mode === "white" ? "white" : body.board_mode === "black" ? "black" : undefined;

  if (name === undefined && image_data === undefined && board_mode === undefined) {
    return NextResponse.json(
      { error: "Provide at least one of: name, image_data, board_mode" },
      { status: 400 }
    );
  }

  try {
    const client = await pool.connect();
    try {
      const parts: string[] = ["updated_at = CURRENT_TIMESTAMP"];
      const values: unknown[] = [];
      let p = 1;
      if (name !== undefined) {
        parts.push(`name = $${p++}`);
        values.push(name || "tldrw");
      }
      if (image_data !== undefined) {
        parts.push(`image_data = $${p++}`);
        values.push(image_data);
      }
      if (board_mode !== undefined) {
        parts.push(`board_mode = $${p++}`);
        values.push(board_mode);
      }
      values.push(id, userLogin);
      await client.query(
        `UPDATE leets.canvas_projects
         SET ${parts.join(", ")}
         WHERE id = $${p} AND user_login = $${p + 1}`,
        values
      );

      const check = await client.query(
        `SELECT id FROM leets.canvas_projects WHERE id = $1 AND user_login = $2`,
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
    console.error("Canvas project PUT error:", error);
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 }
    );
  }
}

// DELETE: Remove canvas project
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
        `DELETE FROM leets.canvas_projects
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
    console.error("Canvas project DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    );
  }
}
