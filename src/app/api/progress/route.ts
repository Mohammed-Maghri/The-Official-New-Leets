import { NextRequest, NextResponse } from "next/server";
import { UserProgress } from "./progress.types";
import { decodeJwt, jwtVerify } from "jose";
import { DecryptionFunction } from "../auth/type.auth";
import { Pool } from "pg";

export const POST = async (request: NextRequest) => {
  let client;
  
  try {
    const Body = await request.json();
    //console.log("Body: ---> ", Body);
    await jwtVerify(
      request.cookies.get("auth_code")?.value as string,
      new TextEncoder().encode(process.env.SECRET_KEY as string)
    );

    const Decode = (await decodeJwt(
      request.cookies.get("auth_code")?.value as string
    ).token) as string;

    //console.log(" -----> ", Decode);

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

    //console.log("!!!!! ---- > ", MonthRange, YearRange);

    const url: URLSearchParams = new URLSearchParams({
      cursus_id: Body.cursus.id,
      "range[begin_at]": Body.cursus.id == 9 ? MonthRange : YearRange,
      "page[size]": "100",
      "page[number]": Body.page,
      sort: "-level",
      "filter[campus_id]": Body.campus.id,
    });

    //console.log("URL: ", url.toString());
    const data = await fetch(
      process.env.INTRA_TOKEN + "/v2/cursus_users?" + url.toString(),
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${DecryptionFunction(Decode)}`,
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
    
    // Get all user logins from the response
    const allUserLogins = response.map((item: UserProgress) => item.user.login);
    
    const userBadgeMap: Map<string, { vipStatus: string | null; badges: string[] }> = new Map();
    
    if (allUserLogins.length > 0) {
      try {
        client = new Pool({ connectionString: process.env.DATABASE_KEY });
        
        const badgeQuery = `
          SELECT 
            v.login,
            v.token as vip_status,
            COALESCE(
              array_agg(f.badge_type ORDER BY 
                CASE f.badge_type
                  WHEN 'Top Feedback' THEN 1
                  WHEN 'Innovative' THEN 2
                  WHEN 'Critical Thinker' THEN 3
                  WHEN 'Helpful' THEN 4
                  WHEN 'Contributor' THEN 5
                  ELSE 6
                END
              ) FILTER (WHERE f.badge_awarded = TRUE),
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
    
    // Helper function to get the highest priority badge
    const getTopBadge = (login: string) => {
      const badgeData = userBadgeMap.get(login);
      
      if (!badgeData) {
        return null;
      }
      
      // Priority: Creator > VIP > Best Feedback Badge
      if (badgeData.vipStatus === 'creator') {
        return { type: 'creator', name: 'Creator' };
      }
      
      if (badgeData.vipStatus === 'vip') {
        return { type: 'vip', name: 'VIP' };
      }
      
      // Get the best feedback badge (already sorted by priority in SQL)
      if (badgeData.badges && badgeData.badges.length > 0) {
        return { type: 'feedback', name: badgeData.badges[0] };
      }
      
      return null;
    };
    
    const NewRespons = response.map((item: UserProgress) => {
      const topBadge = getTopBadge(item.user.login);
      
      return {
        fullname: item.user.usual_full_name,
        email: item.user.email,
        login: item.user.login,
        kind: item.user.kind,
        image: item.user.image.versions.medium,
        staff: item.user.staff === undefined ? false : true,
        correction_point: item.user.correction_point,
        pool_month: item.user.pool_month,
        pool_year: item.user.pool_year,
        location: item.user.location,
        wallet: item.user.wallet,
        campus_id: "",
        campus_name: "",
        level: item.level,
        badge: topBadge, // { type: 'creator'|'vip'|'feedback', name: 'Badge Name' } or null
      };
    });
    
    return NextResponse.json(NewRespons, { status: 200 });
  } catch (error) {
    console.error("Error in progress route:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
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
