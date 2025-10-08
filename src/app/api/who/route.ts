import { NextResponse, NextRequest } from "next/server";
import { DecryptionFunction } from "../auth/type.auth";
import * as jose from "jose";

export async function GET(request: NextRequest) {
  try {
    const user = request.cookies.get("auth_code");
    
    if (!user || !user.value) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    const secret = new TextEncoder().encode(process.env.SECRET_KEY as string);
    const userToken = user.value;
    
    // Verify JWT token
    try {
      await jose.jwtVerify(userToken, secret);
    } catch (jwtError) {
      console.error("JWT verification failed:", jwtError);
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }
    
    // Decode and decrypt token
    const decodedToken = jose.decodeJwt(userToken);
    if (!decodedToken.token) {
      return NextResponse.json(
        { error: "Invalid token structure" },
        { status: 401 }
      );
    }
    
    const accessToken = DecryptionFunction(decodedToken.token as string);
    
    // Fetch user data from 42 API
    const data = await fetch((process.env.INTRA_TOKEN as string) + "/v2/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: "include",
    });
    
    if (!data.ok) {
      const errorText = await data.text();
      console.error("42 API error:", data.status, errorText);
      return NextResponse.json(
        { error: "Failed to fetch user data from 42 API" },
        { status: data.status }
      );
    }
    
    const userResponse = await data.json();
    
    // Validate response structure
    if (!userResponse.email || !userResponse.login) {
      console.error("Invalid user response structure:", userResponse);
      return NextResponse.json(
        { error: "Invalid user data received" },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      {
        email: userResponse.email,
        login: userResponse.login,
        kind: userResponse.cursus_users?.length > 1 ? "student" : "pooler",
        image: userResponse.image?.versions?.large || "/nopic.jpg",
        staff: userResponse.staff !== undefined && userResponse.staff !== false,
        correction_point: userResponse.correction_point || 0,
        pool_month: userResponse.pool_month || null,
        pool_year: userResponse.pool_year || null,
        location: userResponse.location || null,
        wallet: userResponse.wallet || 0,
        campus_id: userResponse.campus?.[0]?.id || 0,
        campus_name: userResponse.campus?.[0]?.name || "Unknown",
        level: userResponse?.cursus_users?.[1]?.level || 0,
        fullname: userResponse.usual_full_name || userResponse.displayname || userResponse.login,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Unexpected error in /api/who:", error);
    return NextResponse.json(
      { 
        error: "Internal server error",
        message: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
