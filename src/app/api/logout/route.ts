import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const GET = async () => {
  try {
    const response = NextResponse.json({ message: "Logged out successfully" });
    (await cookies()).set("auth_code", "" as string, {
      httpOnly: true,
      path: "/",
      maxAge: -1,
    });
    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ error: "Failed to log out" }, { status: 500 });
  }
};
