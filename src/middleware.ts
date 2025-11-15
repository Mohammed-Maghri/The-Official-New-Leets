import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";

export async function middleware(request: NextRequest) {
  const paths: string[] = [
    "/dashboard",
    "/progress",
    "/calculator",
    "/peerfinder",
    "/vip",
  ];
  const cookie = (await cookies()).get("auth_code");
  if (request.nextUrl.pathname === "/") {
    if (cookie?.value) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  } else if (paths.includes(request.nextUrl.pathname)) {
    if (!cookie?.value) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"],
};
