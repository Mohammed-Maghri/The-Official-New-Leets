import { NextResponse, NextRequest } from "next/server";
import {
  today,
  tomorow,
  RawTeamData,
  TransformedTeamData,
} from "./slots.types";
import { Pool } from "pg";
import { DecryptionFunction } from "../auth/type.auth";
import * as jose from "jose";

export const GET = async (request: NextRequest) => {
  let client: Pool | null = null;
  let connection = null;
  
  try {
    const requestUrl = new URL(request.url);
    const campusParam = requestUrl.searchParams.get("campus") || "16";
    const pageParam = requestUrl.searchParams.get("page") || "1";
    
    //console.log("Campus:", campusParam, "Page:", pageParam);
    
    // Verify JWT token first
    await jose.jwtVerify(
      request.cookies.get("auth_code")?.value as string,
      new TextEncoder().encode(process.env.SECRET_KEY as string)
    );
    
    // Fetch user data
    const fetchme = await fetch(
      process.env.NODE_ENV == "production"
        ? `${process.env.productionUrl}/api/who`
        : "http://localhost:3000/api/who",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Cookie: `auth_code=${request.cookies.get("auth_code")?.value};`,
        },
        credentials: "include",
      }
    );

    if (!fetchme.ok) {
      throw new Error("Failed to fetch user data");
    }
    
    const userData = await fetchme.json();
    
    // Create pool and connection
    client = new Pool({ connectionString: process.env.DATABASE_KEY });
    connection = await client.connect();
    
    // Check VIP status
    const query = `SELECT * FROM leets.vip where login=$1`;
    const result = await connection.query(query, [userData.login]);
    const respond = result.rows[0]?.login;

    if (!respond) {
      return NextResponse.json(
        { error: "User not found or not a VIP" },
        { status: 404 }
      );
    }

    const apiParams = new URLSearchParams({
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
      "filter[campus]": campusParam,
      "page[size]": "100",
      "page[number]": pageParam,
      sort: "-locked_at",
    });

    const authCookie = request.cookies.get("auth_code")?.value;
    if (!authCookie) {
      throw new Error("No auth_code cookie found");
    }
    
    const decodedJwt = jose.decodeJwt(authCookie);
    const decryptedToken = DecryptionFunction(decodedJwt.token as string);
    
    // Validate token
    if (!decryptedToken || decryptedToken.trim() === "") {
      throw new Error("Decrypted token is empty or invalid");
    }
    
    // Validate environment variables
    if (!process.env.INTRA_TOKEN) {
      throw new Error("INTRA_TOKEN environment variable is not set");
    }
    
    // Log the API request details for debugging
    //console.log("Fetching teams from:", `${process.env.INTRA_TOKEN}/v2/teams?${apiParams.toString()}`);
    //console.log("API params:", apiParams.toString());
    //console.log("Token is valid, length:", decryptedToken.length);
    
    const dataFetched = await fetch(
      `${process.env.INTRA_TOKEN as string}/v2/teams?${apiParams.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${decryptedToken}`,
        },
      }
    );
    
    if (!dataFetched.ok) {
      let errorBody = "";
      let errorJson: any = null;
      try {
        errorBody = await dataFetched.text();
        try {
          errorJson = JSON.parse(errorBody);
        } catch (parseError) {
          // Response is not JSON, errorBody is the raw text
        }
        console.error(`Intra API Error: Status ${dataFetched.status}`);
        console.error(`Response body:`, errorBody);
        if (errorJson) {
          console.error(`Parsed error:`, errorJson);
        }
      } catch (e) {
        console.error(`Failed to read error response: ${e}`);
      }
      
      // Log more debugging info
      console.error(`Authorization header length: ${decryptedToken.length}`);
      console.error(`Token preview: ${decryptedToken.substring(0, 50)}...`);
      console.error(`INTRA_TOKEN URL: ${process.env.INTRA_TOKEN}`);
      
      throw new Error(`Failed to fetch teams data: HTTP ${dataFetched.status} - ${errorJson?.error || errorBody.substring(0, 500) || "No response body"}`);
    }
    
    const data: RawTeamData[] = await dataFetched.json();
    const otherThings: TransformedTeamData[] = data.map((item: RawTeamData) => {
      return {
        locked_at: item.locked_at,
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
    console.error("Error in GET request:", error);
    return NextResponse.json(
      { error: "Internal Server Error: " + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  } finally {
    // Always cleanup resources
    if (connection) {
      try {
        connection.release();
      } catch (releaseError) {
        console.error("Error releasing connection:", releaseError);
      }
    }
    if (client) {
      try {
        await client.end();
      } catch (endError) {
        console.error("Error closing pool:", endError);
      }
    }
  }
};
