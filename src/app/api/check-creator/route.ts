import { NextResponse, NextRequest } from "next/server";
import { Pool } from "pg";
import * as jose from "jose";
import { DecryptionFunction } from "../auth/type.auth";

export const GET = async (request: NextRequest) => {
  let client: Pool | null = null;
  
  try {
    // Verify JWT first
    const authCookie = request.cookies.get("auth_code");
    
    if (!authCookie || !authCookie.value) {
      return NextResponse.json(
        { isCreator: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    await jose.jwtVerify(
      authCookie.value,
      new TextEncoder().encode(process.env.SECRET_KEY as string)
    );
    
    // Decode and decrypt token
    const decodedToken = jose.decodeJwt(authCookie.value);
    if (!decodedToken.token) {
      return NextResponse.json(
        { isCreator: false, error: "Invalid token structure" },
        { status: 401 }
      );
    }
    
    const accessToken = DecryptionFunction(decodedToken.token as string);
    
    // Fetch user data from 42 API
    const userData = await fetch((process.env.INTRA_TOKEN as string) + "/v2/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    
    if (!userData.ok) {
      return NextResponse.json(
        { isCreator: false, error: "Failed to fetch user data" },
        { status: userData.status }
      );
    }
    
    const userInfo = await userData.json();
    
    client = new Pool({ connectionString: process.env.DATABASE_KEY });

    // Check if user is owner or creator (can review dashboard)
    const creatorCheckQuery = `SELECT * FROM leets.vip WHERE login = $1 AND token IN ('owner', 'creator')`;
    const creatorCheckResult = await client.query(creatorCheckQuery, [userInfo.login]);
    
    return NextResponse.json(
      { 
        isCreator: creatorCheckResult.rows.length > 0,
        login: userInfo.login
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error checking creator status:", error);
    return NextResponse.json(
      { isCreator: false, error: "Internal Server Error" },
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
