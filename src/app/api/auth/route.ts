import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AuthResponse } from "./type.auth";
import * as jose from "jose";

import { EncryptionFunction } from "./type.auth";

export const GET = async (request: NextRequest) => {
  try {
    const code: string = request.nextUrl.searchParams.get("code") as string;
    if (!code) {
      return NextResponse.json(
        { error: "Authorization code is missing." },
        { status: 400 }
      );
    }

    const ClientQuery: URLSearchParams = new URLSearchParams({
      grant_type: "authorization_code",
      client_id: process.env.INTRA_UID as string,
      client_secret: process.env.INTRA_SECRET_KEY as string,
      code: code,
      redirect_uri: process.env.INTRA_REDIRECT_URI as string,
    });

    const tokenUrl = (process.env.INTRA_TOKEN as string) + "/oauth/token";
    
    const fetchToken = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: ClientQuery.toString(),
      signal: AbortSignal.timeout(10000),
    });
    
    if (!fetchToken.ok) {
      throw new Error("Failed to fetch token");
    }
    
    const Tok: AuthResponse = await fetchToken.json();
    const token = new TextEncoder().encode(process.env.SECRET_KEY as string);
    const Signature = new jose.SignJWT({
      token: EncryptionFunction(Tok.access_token),
    })
      .setProtectedHeader({ alg: "HS256" })
      .sign(token);
    const signedToken = await Signature;

    const isProduction = process.env.NODE_ENV === "production";
    
    (await cookies()).set("auth_code", signedToken as string, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days for better persistence
    });

    const redirectUrl = new URL("/dashboard", request.url);
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error("Authentication error:", error);
    return NextResponse.json(
      {
        error: "An error occurred while processing your request.",
      },
      { status: 500 }
    );
  }
};
