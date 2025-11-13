import { NextRequest, NextResponse } from "next/server";
import * as jose from "jose";
import { DecryptionFunction } from "../auth/type.auth";
import { rateLimit, RateLimitPresets } from "@/utils/rateLimit";

export const GET = async (request: NextRequest) => {
  // Rate limiting: 20 requests per minute (makes 42 API calls)
  const rateLimitResult = await rateLimit(request, RateLimitPresets.STRICT);
  if (rateLimitResult) return rateLimitResult;

  try {
    const Cookie = request.cookies.get("auth_code")?.value;
    const data = DecryptionFunction(
      jose.decodeJwt(Cookie as string).token as string
    );

    const projects = await fetch(
      `${process.env.INTRA_TOKEN as string}/v2/me/projects?page[size]=100&page[number]=2`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${data}`,
        },
      }
    );
    if (!projects.ok) {
      return NextResponse.json(
        { error: "Failed to fetch projects" },
        { status: 500 }
      );
    }
    const projectsData = await projects.json();
    return NextResponse.json(projectsData, {
      status: 200,
    });
  } catch (error) {
    console.error("Error in GET request:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};
