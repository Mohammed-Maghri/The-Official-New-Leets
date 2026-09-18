import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { z } from "zod";
import { DecryptionFunction } from "../auth/type.auth";
import { signaturePool, signatureSchema } from "@/utils/signatureProfiles";

const inputSchema = z.object({ login: z.string().trim().toLowerCase().min(1).max(64).regex(/^[a-z0-9][a-z0-9_-]*$/) });

async function handle(request: NextRequest) {
  try {
    const cookie = request.cookies.get("auth_code")?.value;
    if (!cookie) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    let accessToken: string;
    try {
      const { payload } = await jwtVerify(cookie, new TextEncoder().encode(process.env.SECRET_KEY));
      if (typeof payload.token !== "string") throw new Error("Invalid token");
      accessToken = DecryptionFunction(payload.token);
    } catch {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }
    const me = await fetch(`${process.env.INTRA_TOKEN}/v2/me`, { headers: { Authorization: `Bearer ${accessToken}` }, cache: "no-store" });
    if (!me.ok) return NextResponse.json({ error: "Authentication failed" }, { status: 401 });
    const actor = await me.json();
    const permission = await signaturePool.query("SELECT login FROM leets.vip WHERE login = $1 AND token IN ('owner', 'creator')", [actor.login]);
    if (!permission.rowCount) return NextResponse.json({ error: "Only owners and creators can manage signature profiles" }, { status: 403 });

    let login: string | undefined;
    if (request.method !== "GET") {
      const parsed = inputSchema.safeParse(await request.json().catch(() => null));
      if (!parsed.success) return NextResponse.json({ error: "Enter a valid username" }, { status: 400 });
      login = parsed.data.login;
      if (request.method === "POST") {
        const target = await fetch(`${process.env.INTRA_TOKEN}/v2/users/${encodeURIComponent(login)}`, { headers: { Authorization: `Bearer ${accessToken}` }, cache: "no-store" });
        if (target.status === 404) return NextResponse.json({ error: "Username not found" }, { status: 404 });
        if (!target.ok) return NextResponse.json({ error: "Could not verify username. Please try again." }, { status: target.status === 429 ? 429 : 502 });
        const user = await target.json();
        if (user.login !== login) return NextResponse.json({ error: "Username could not be verified" }, { status: 400 });
      }
    }
    await signaturePool.query(signatureSchema);
    if (request.method === "POST") {
      await signaturePool.query("INSERT INTO leets.signature_profiles (login, granted_by) VALUES ($1, $2) ON CONFLICT (login) DO NOTHING", [login, actor.login]);
    } else if (request.method === "DELETE") {
      await signaturePool.query("DELETE FROM leets.signature_profiles WHERE login = $1", [login]);
    }
    const result = await signaturePool.query("SELECT login, granted_by, granted_at FROM leets.signature_profiles ORDER BY granted_at DESC, login");
    return NextResponse.json({ recipients: result.rows }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Signature profile operation failed", error);
    return NextResponse.json({ error: "Could not update signature profiles" }, { status: 500 });
  }
}

export const GET = handle;
export const POST = handle;
export const DELETE = handle;
