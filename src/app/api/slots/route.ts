import { NextResponse, NextRequest } from "next/server";
import { today, tomorow, RawTeamData, TransformedTeamData } from "./slots.types";
import { Pool } from "pg";
import { DecryptionFunction } from "../auth/type.auth";
import * as jose from "jose";
// import }

export const GET = async (request: NextRequest) => {
  try {
    const campus = new URLSearchParams(request.url);
    console.log(" ----> ", campus.get("campus"));
    const client = new Pool({ connectionString: process.env.DATABASE_KEY });
    const connection = await client.connect();
    const fetchme = await fetch("http://localhost:3000/api/who", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: `auth_code=${request.cookies.get("auth_code")?.value};`,
      },
      credentials: "include",
    });

    if (!fetchme.ok) {
      throw new Error("Failed to fetch user data");
    }
    const query = `SELECT * FROM leets.vip where login=$1`;
    const respond = (await client.query(query, [(await fetchme.json()).login]))
      .rows[0]?.login;

    if (!respond) {
      return NextResponse.json(
        { error: "User not found or not a VIP" },
        { status: 404 }
      );
    }
    await jose.jwtVerify(
      request.cookies.get("auth_code")?.value as string,
      new TextEncoder().encode(process.env.SECRET_KEY as string)
    );

    const url = new URLSearchParams({
      "range[closed_at]":
        today.year +
        "-" +
        today.month +
        "-" +
        today.day +
        "," +
        tomorow.year +
        "-" +
        tomorow.month +
        "-" +
        tomorow.day,
      "filter[campus]": "16",
      "page[size]": "100",
      sort: "-locked_at",
    });

    const dataFetched = await fetch(
      `${process.env.INTRA_TOKEN as string}/v2/teams?${url.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${DecryptionFunction(
            jose.decodeJwt(request.cookies.get("auth_code")?.value as string)
              .token as string
          )}`,
          body: url.toString(),
        },
      }
    );
    if (!dataFetched.ok) {
      throw new Error("Failed to fetch teams data");
    }
    connection.release();
    const data: RawTeamData[] = await dataFetched.json();
    const otherThings: TransformedTeamData[] = data.map((item: RawTeamData) => {
      return {
        name: item.name,
        project_id: item.project_id,
        status: item.status,
        users: item.users,
        locked: item.locked,
        validated: item.validated == true ? "yes" : "no",
        closed_at: item.closed_at,
        final_mark: item.final_mark,
      };
    });
    return NextResponse.json(otherThings, {
      status: 200,
    });
  } catch (error) {
    console.log("Error in GET request:", error);
    return NextResponse.json(
      { error: "Internal Server Error" + error },
      { status: 500 }
    );
  }
};
