import { NextResponse } from "next/server";
import { today, tomorow } from "./slots.types";
import { Pool } from "pg";

const client = new Pool({ connectionString: process.env.DATABASE_KEY });

export const GET = async () => {
  try {
    await client.connect();
    const query = `SELECT * FROM leets.vip;`;
    client.query(query);
     await fetch(process.env.INTRA_TOKEN as string, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.INTRA_UID}`,
      },
    });
    return NextResponse.json(
      {
        today: today,
        tomorow: tomorow,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in GET request:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};
