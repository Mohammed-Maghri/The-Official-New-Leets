import { NextResponse, NextRequest } from "next/server";
// import { DecryptionFunction } from "../auth/type.auth";

import * as jose from "jose";

export async function GET(request: NextRequest) {
  try {
    const user = request.cookies.get("auth_code");
    const secret = new TextEncoder().encode(process.env.SECRET_KEY as string);
    await jose.jwtVerify(user?.value as string, secret);
    const data = await fetch((process.env.INTRA_TOKEN as string) + "/v2/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${
          jose.decodeJwt(user?.value as string).token as string
        }`,
      },
    });
    if (!data.ok) {
      return NextResponse.json(
        { error: "Failed to fetch user data" },
        { status: 500 }
      );
    }
    const userResponse = await data.json();
    console.log("User Response: ", userResponse.staff);
    return NextResponse.json(
      {
        email: userResponse.email,
        login: userResponse.login,
        kind: userResponse.kind,
        image: userResponse.image.versions.large,
        staff: userResponse.staff === undefined ? false : true,
        correction_point: userResponse.correction_point,
        pool_month: userResponse.pool_month,
        pool_year: userResponse.pool_year,
        location: userResponse.location,
        wallet: userResponse.wallet,
        campus_id: userResponse.campus[0].id,
        campus_name: userResponse.campus[0].name,
        level: userResponse.cursus_users[1].level,
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json({ error: "Invalid user data" }, { status: 400 });
  }
}
