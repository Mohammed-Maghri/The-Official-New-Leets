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
  
  try {
    const requestUrl = new URL(request.url);
    const campusParam = requestUrl.searchParams.get("campus") || "16";
    const pageParam = requestUrl.searchParams.get("page") || "1";
    const dateFilter = requestUrl.searchParams.get("date") || "today"; // "today", "yesterday", "2days"
    
    // Calculate date range based on filter
    let startDate: { year: string; month: string; day: string };
    let endDate: { year: string; month: string; day: string };
    
    const now = new Date();
    
    if (dateFilter === "yesterday") {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const dayAfterYesterday = new Date(yesterday);
      dayAfterYesterday.setDate(dayAfterYesterday.getDate() + 1);
      
      startDate = {
        year: yesterday.getFullYear().toString(),
        month: (yesterday.getMonth() + 1).toString().padStart(2, '0'),
        day: yesterday.getDate().toString().padStart(2, '0')
      };
      endDate = {
        year: dayAfterYesterday.getFullYear().toString(),
        month: (dayAfterYesterday.getMonth() + 1).toString().padStart(2, '0'),
        day: dayAfterYesterday.getDate().toString().padStart(2, '0')
      };
    } else if (dateFilter === "2days") {
      const twoDaysAgo = new Date(now);
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      const dayAfter = new Date(twoDaysAgo);
      dayAfter.setDate(dayAfter.getDate() + 1);
      
      startDate = {
        year: twoDaysAgo.getFullYear().toString(),
        month: (twoDaysAgo.getMonth() + 1).toString().padStart(2, '0'),
        day: twoDaysAgo.getDate().toString().padStart(2, '0')
      };
      endDate = {
        year: dayAfter.getFullYear().toString(),
        month: (dayAfter.getMonth() + 1).toString().padStart(2, '0'),
        day: dayAfter.getDate().toString().padStart(2, '0')
      };
    } else {
      // Default to today
      startDate = today;
      endDate = tomorow;
    }
    
    
    // Verify JWT token first
    await jose.jwtVerify(
      request.cookies.get("auth_code")?.value as string,
      new TextEncoder().encode(process.env.SECRET_KEY as string)
    );
    
    // Fetch user data
    const whoUrl = new URL("/api/who", request.url);
    const fetchme = await fetch(whoUrl, {
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
    
    await fetchme.json();
    
    // Create pool for badge queries (no VIP role checking required)
    client = new Pool({ connectionString: process.env.DATABASE_KEY });

    const apiParams = new URLSearchParams({
      "range[closed_at]":
        startDate.year +
        "-" +
        startDate.month +
        "-" +
        startDate.day +
        "," +
        endDate.year +
        "-" +
        endDate.month +
        "-" +
        endDate.day,
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
    
    // if (!dataFetched.ok) {
    //   // let errorBody = "";
    //   // let errorJson: any = null;
    //   // try {
    //   //   errorBody = await dataFetched.text();
    //   //   // console.error(`Intra API Error: Status ${dataFetched.status}`);
    //   //   // console.error(`Response body:`, errorBody);
    //   //   // if (errorJson) {
    //   //     // console.error(`Parsed error:`, errorJson);
    //   //   // }
    //   // } catch (e) {
    //   //   console.error(`Failed to read error response: ${e}`);
    //   // }
      
    //   // Log more debugging info
    //   // console.error(`Authorization header length: ${decryptedToken.length}`);
    //   // console.error(`Token preview: ${decryptedToken.substring(0, 50)}...`);
    //   // console.error(`INTRA_TOKEN URL: ${process.env.INTRA_TOKEN}`);
      
    //   // throw new Error(`Failed to fetch teams data: HTTP ${dataFetched.status} - ${errorJson?.error || errorBody.substring(0, 500) || "No response body"}`);
    // }
    
    const data: RawTeamData[] = await dataFetched.json();
    
    // Get all unique user logins from teams
    const allUserLogins = Array.from(
      new Set(
        data.flatMap(team => team.users.map(user => user.login))
      )
    );
    
    const userBadgeMap: Map<string, { vipStatus: string | null; badges: string[] }> = new Map();
    
    if (allUserLogins.length > 0 && client) {
      try {
        const badgeQuery = `
          SELECT 
            v.login,
            v.token as vip_status,
            COALESCE(
              array_agg(f.badge_type) FILTER (WHERE f.badge_awarded = TRUE),
              ARRAY[]::text[]
            ) as badges
          FROM leets.vip v
          LEFT JOIN leets.feedback f ON v.login = f.user_login AND f.badge_awarded = TRUE
          WHERE v.login = ANY($1)
          GROUP BY v.login, v.token
        `;
        const badgeResult = await client.query(badgeQuery, [allUserLogins]);
        
        badgeResult.rows.forEach(row => {
          userBadgeMap.set(row.login, {
            vipStatus: row.vip_status,
            badges: row.badges || []
          });
        });
      } catch (badgeError) {
        console.error("Error fetching badges:", badgeError);
        // Continue without badges if query fails
      }
    }
    
    const otherThings: TransformedTeamData[] = data.map((item: RawTeamData) => {
      return {
        locked_at: item.locked_at,
        name: item.name,
        project_id: item.project_id,
        status: item.status,
        users: item.users.map(user => {
          const badgeData = userBadgeMap.get(user.login);
          return {
            ...user,
            vip_status: badgeData?.vipStatus || null,
            badges: badgeData?.badges || []
          };
        }),
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
    if (client) {
      try {
        await client.end();
      } catch (endError) {
        console.error("Error closing pool:", endError);
      }
    }
  }
};
