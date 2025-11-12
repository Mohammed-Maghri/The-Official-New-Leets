import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

// Use the same SECRET_KEY as auth/route.ts
const JWT_SECRET = new TextEncoder().encode(
  process.env.SECRET_KEY as string
);

export async function GET(request: NextRequest) {
  try {
    // Get auth_code from httpOnly cookie (server can read this)
    const authToken = request.cookies.get("auth_code")?.value;

    if (authToken) {
    }

    if (!authToken) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Verify JWT token
    const { payload } = await jwtVerify(authToken, JWT_SECRET);

    // Return token and user data
    return NextResponse.json({
      token: authToken,
      userData: payload.userData,
    });
  } catch (error) {
    console.error("❌ Auth verification failed:");
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("  - Error type:", error instanceof Error ? error.constructor.name : typeof error);
    console.error("  - Error message:", errorMessage);
    console.error("  - Full error:", error);
    return NextResponse.json(
      { error: "Invalid authentication", details: errorMessage },
      { status: 401 }
    );
  }
}
