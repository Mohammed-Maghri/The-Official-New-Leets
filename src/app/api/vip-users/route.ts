import { NextResponse } from "next/server";
import { Pool } from "pg";

export const GET = async () => {
  let client: Pool | null = null;
  
  try {
    client = new Pool({ connectionString: process.env.DATABASE_KEY });

    const query = `SELECT login FROM leets.vip`;
    const result = await client.query(query);

    const vipLogins = result.rows.map(row => row.login);

    return NextResponse.json(
      { vipUsers: vipLogins },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error fetching VIP users:", error);
    return NextResponse.json(
      { error: "Internal Server Error: " + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  } finally {
    if (client) {
      try {
        await client.end();
      } catch (endError) {
        console.error("Error closing pool:", endError);
      }
    }
  }
};
