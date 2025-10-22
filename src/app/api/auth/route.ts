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

    //console.log("Client Query: ", ClientQuery.toString());
    const tokenUrl = (process.env.INTRA_TOKEN as string) + "/oauth/token";
    //console.log("Token URL: ", tokenUrl);
    const fetchToken = await fetch(
      tokenUrl,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: ClientQuery.toString(),
      }
    );
    
    if (!fetchToken.ok) {
      console.error("Token fetch failed with status:", fetchToken.status);
      console.error("Response:", await fetchToken.text());
      throw new Error("Failed to fetch token");
    }
    const Tok: AuthResponse = await await fetchToken.json();
    const token = new TextEncoder().encode(process.env.SECRET_KEY as string);
    const Signature = new jose.SignJWT({
      token: EncryptionFunction(Tok.access_token),
    })
      .setProtectedHeader({ alg: "HS256" })
      .sign(token);
    const signedToken = await Signature;

    (await cookies()).set("auth_code", signedToken as string, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return NextResponse.redirect(
      process.env.NODE_ENV === "production"
        ? `${process.env.productionUrl}/dashboard`
        : "http://localhost:3000/dashboard"
    );
  } catch {
    //console.log(" --------> ", error);
    return NextResponse.json(
      {
        error: "An error occurred while processing your request.",
      },
      { status: 500 }
    );
  }
};
