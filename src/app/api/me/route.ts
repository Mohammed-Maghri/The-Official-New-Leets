import { NextResponse, NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const user = request.cookies.get("auth_code");
  console.log(" 000< ", user);
  const data = await fetch((process.env.INTRA_TOKEN as string) + "/v2/me", {
    method: "GET",
    headers: {
      Authorization: `Bearer 2452132b7c84c4d7f934c011ae316c1f769d66c45bf11202bd9cc949e91d0f24`,
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
  try {
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
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ error: "Invalid user data" }, { status: 400 });
  }
}
