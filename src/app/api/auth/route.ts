import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import * as jose from "jose";
import { rateLimit, RateLimitPresets } from "@/utils/rateLimit";
import { EncryptionFunction } from "./type.auth";

export const GET = async (request: NextRequest) => {
  const requestId = crypto.randomUUID();
  let stage = "configuration";
  const fail = (status: number, code: string, error: string, details: Record<string, unknown> = {}) => {
    // Never log the callback URL, authorization code, access token, or secrets.
    console.error("Authentication failed", { requestId, stage, code, ...details });
    return NextResponse.json({ error, code, requestId }, { status, headers: { "Cache-Control": "no-store" } });
  };
  try {
    const rateLimitResult = await rateLimit(request, RateLimitPresets.AUTH);
    if (rateLimitResult) return rateLimitResult;
    if (request.nextUrl.searchParams.has("error")) {
      return fail(400, "AUTHORIZATION_DENIED", "42 authorization was not completed. Please start login again.");
    }
    const code = request.nextUrl.searchParams.get("code");
    if (!code) return fail(400, "MISSING_CODE", "Authorization code is missing. Please start login again.");

    const required = ["INTRA_UID", "INTRA_SECRET_KEY", "INTRA_REDIRECT_URI", "INTRA_TOKEN", "SECRET_KEY"] as const;
    const missing = required.filter(name => !process.env[name]?.trim());
    if (missing.length) return fail(500, "AUTH_CONFIGURATION", "Login is not configured correctly on the server.", { missing });
    let base: URL;
    try {
      base = new URL(process.env.INTRA_TOKEN!);
      const redirect = new URL(process.env.INTRA_REDIRECT_URI!);
      if (!["https:", "http:"].includes(base.protocol) || !["https:", "http:"].includes(redirect.protocol)) throw new Error();
    } catch {
      return fail(500, "AUTH_CONFIGURATION", "Login URLs are not configured correctly on the server.");
    }
    stage = "token_exchange";
    const tokenResponse = await fetch(new URL("/oauth/token", base), {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: process.env.INTRA_UID!,
        client_secret: process.env.INTRA_SECRET_KEY!,
        code,
        redirect_uri: process.env.INTRA_REDIRECT_URI!,
      }).toString(),
      signal: AbortSignal.timeout(10000),
      cache: "no-store",
    });
    if (!tokenResponse.ok) {
      const body = await tokenResponse.json().catch(() => ({}));
      const known = ["invalid_grant", "invalid_client", "invalid_request", "unauthorized_client", "invalid_scope", "unsupported_grant_type"];
      const oauthError = known.includes(body?.error) ? body.error : "unknown";
      const details = { upstreamStatus: tokenResponse.status, oauthError };
      if (oauthError === "invalid_grant") return fail(400, "INVALID_AUTHORIZATION_CODE", "42 rejected the login code. Start a new login from the home page; do not refresh this callback. If it repeats, check the configured redirect URI.", details);
      if (["invalid_client", "unauthorized_client"].includes(oauthError)) return fail(500, "OAUTH_CLIENT_REJECTED", "42 rejected this application's credentials. The server's OAuth configuration needs checking.", details);
      return fail(tokenResponse.status === 429 ? 503 : 502, "TOKEN_EXCHANGE_FAILED", "Could not complete the token exchange with 42. Please try a fresh login shortly.", details);
    }
    const tokenData = await tokenResponse.json();
    if (typeof tokenData?.access_token !== "string" || !tokenData.access_token) return fail(502, "INVALID_TOKEN_RESPONSE", "42 returned an invalid login response.");

    stage = "user_profile";
    const profileResponse = await fetch(new URL("/v2/me", base), {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
      signal: AbortSignal.timeout(10000),
      cache: "no-store",
    });
    if (!profileResponse.ok) return fail(502, "PROFILE_FETCH_FAILED", "Signed in with 42, but could not load your profile. Please try logging in again.", { upstreamStatus: profileResponse.status });
    const user = await profileResponse.json();
    if (!user?.login || !user?.id) return fail(502, "INVALID_PROFILE_RESPONSE", "42 returned an incomplete profile. Please try logging in again.");
    const primary = user.campus_users?.find((campus: { is_primary?: boolean }) => campus.is_primary);
    const campusId = primary?.campus_id ?? user.campus_users?.[0]?.campus_id ?? null;

    stage = "session_creation";
    const signedToken = await new jose.SignJWT({ token: EncryptionFunction(tokenData.access_token), login: user.login, userId: user.id, campusId })
      .setProtectedHeader({ alg: "HS256" })
      .sign(new TextEncoder().encode(process.env.SECRET_KEY!));
    (await cookies()).set("auth_code", signedToken, {
      httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7,
    });
    return NextResponse.redirect(new URL("/dashboard", request.url));
  } catch (error) {
    const name = error instanceof Error ? error.name : "UnknownError";
    if (name === "TimeoutError" || name === "AbortError") return fail(504, "AUTH_UPSTREAM_TIMEOUT", "42 took too long to respond. Please start a new login shortly.");
    return fail(500, "AUTH_INTERNAL_ERROR", "Login could not be completed. Share this request ID with the administrator.", { errorType: name });
  }
};
