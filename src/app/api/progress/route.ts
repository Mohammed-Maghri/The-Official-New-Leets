import { NextRequest, NextResponse } from "next/server";
import { UserProgress } from "./progress.types";
import { decodeJwt, jwtVerify } from "jose";
// import { DecryptionFunction } from "../auth/type.auth";

export const POST = async (request: NextRequest) => {
  try {
    const Body = await request.json();
    console.log("Body: ---> ", Body);
    await jwtVerify(
      request.cookies.get("auth_code")?.value as string,
      new TextEncoder().encode(process.env.SECRET_KEY as string)
    );

    const Decode = (await decodeJwt(
      request.cookies.get("auth_code")?.value as string
    ).token) as string;

    console.log(" -----> ", Decode);

    const MonthRange: string = `${Body.year}-${
      Body.month.toString().length == 1 ? `0${Body.month}` : Body.month
    }-01,${Body.year}-${
      (parseInt(Body.month) + 1).toString().length == 1
        ? `0${parseInt(Body.month) + 1}`
        : parseInt(Body.month) + 1
    }-01`;

    const YearRange: string = `${Body.year}-${Body.month}-01,${
      parseInt(Body.year) + 1
    }-01-01`;

    console.log("!!!!! ---- > ", MonthRange, YearRange);

    const url: URLSearchParams = new URLSearchParams({
      cursus_id: Body.cursus.id,
      "range[begin_at]": Body.cursus.id == 9 ? MonthRange : YearRange,
      "page[size]": "100",
      "page[number]": Body.page,
      sort: "-level",
      "filter[campus_id]": Body.campus.id,
    });

    console.log("URL: ", url.toString());
    const data = await fetch(
      process.env.INTRA_TOKEN + "/v2/cursus_users?" + url.toString(),
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${Decode}`,
        },
      }
    );
    if (!data.ok) {
      console.error("Failed to fetch progress data");
      return NextResponse.json(
        { error: "Failed to fetch progress data" },
        { status: 500 }
      );
    }
    const response = await data.json();
    // Define a Interface to this new response
    const NewRespons = response.map((item: UserProgress) => ({
      email: item.user.email,
      login: item.user.login,
      kind: item.user.kind,
      image: item.user.image.versions.large,
      staff: item.user.staff === undefined ? false : true,
      correction_point: item.user.correction_point,
      pool_month: item.user.pool_month,
      pool_year: item.user.pool_year,
      location: item.user.location,
      wallet: item.user.wallet,
      campus_id: "",
      campus_name: "",
      level: item.level,
    }));
    return NextResponse.json(NewRespons, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
};
