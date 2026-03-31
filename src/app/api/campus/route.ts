import { NextRequest, NextResponse } from "next/server";

async function getClientCredentialsToken(): Promise<string> {
  const base = process.env.INTRA_TOKEN;
  const clientId = process.env.INTRA_UID;
  const clientSecret = process.env.INTRA_SECRET_KEY;

  if (!base || !clientId || !clientSecret) {
    throw new Error("Missing INTRA_TOKEN, INTRA_UID, or INTRA_SECRET_KEY");
  }

  const params = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
  });

  const res = await fetch(`${base}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OAuth token failed: ${res.status} ${text}`);
  }

  const data = (await res.json()) as { access_token?: string };
  if (!data.access_token) {
    throw new Error("OAuth response missing access_token");
  }
  return data.access_token;
}

/**
 * GET /api/campus
 * Proxies to 42 API GET /v2/campus using app credentials (client_credentials).
 * Optional query params are forwarded (e.g. page[number], page[size], filter, sort).
 */
export async function GET(request: NextRequest) {
  try {
    const token = await getClientCredentialsToken();

    const base = process.env.INTRA_TOKEN as string;
    const target = new URL(`${base}/v2/campus`);
    request.nextUrl.searchParams.forEach((value, key) => {
      target.searchParams.append(key, value);
    });

    const res = await fetch(target.toString(), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(60000),
      cache: "no-store",
    });

    const bodyText = await res.text();
    let json: unknown;
    try {
      json = JSON.parse(bodyText) as unknown;
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON from 42 API", status: res.status, body: bodyText.slice(0, 500) },
        { status: 502 }
      );
    }

    return NextResponse.json(json, { status: res.status });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
