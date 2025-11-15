import { NextRequest, NextResponse } from "next/server";
import { UserProgress } from "./progress.types";
import { decodeJwt, jwtVerify } from "jose";
import { DecryptionFunction } from "../auth/type.auth";
import { Pool } from "pg";
import { rateLimit, RateLimitPresets } from "@/utils/rateLimit";
import { progressCache } from "@/utils/profileCache";

export const POST = async (request: NextRequest) => {
  // Rate limiting: 20 requests per minute
  const rateLimitResult = await rateLimit(request, RateLimitPresets.STRICT);
  if (rateLimitResult) return rateLimitResult;

  let client;
  
  try {
    const Body = await request.json();
    await jwtVerify(
      request.cookies.get("auth_code")?.value as string,
      new TextEncoder().encode(process.env.SECRET_KEY as string)
    );

    const Decode = (await decodeJwt(
      request.cookies.get("auth_code")?.value as string
    ).token) as string;

    // Create cache key from request parameters
    const cacheKey = `progress_${Body.cursus.id}_${Body.campus.id}_${Body.year}_${Body.month}_${Body.page}`;
    
    // Check cache first
    const cachedData = progressCache.get(cacheKey);
    if (cachedData) {
      const cacheAge = progressCache.getAge(cacheKey);
      console.log(`Progress cache HIT for ${cacheKey} (age: ${cacheAge} minutes)`);
      return NextResponse.json(cachedData, { 
        status: 200,
        headers: { 'X-Cache': 'HIT' }
      });
    }
    
    console.log(`Progress cache MISS for ${cacheKey}`);

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

    // Build URL parameters
    const urlParams: Record<string, string> = {
      cursus_id: Body.cursus.id,
      "page[size]": "100",
      "page[number]": Body.page,
      sort: "-level",
    };

    // Only add filters if campus_id is not 0 (All Campuses)
    if (Body.campus.id !== 0) {
      urlParams["range[begin_at]"] = Body.cursus.id == 9 ? MonthRange : YearRange;
      urlParams["filter[campus_id]"] = Body.campus.id;
    }

    const url: URLSearchParams = new URLSearchParams(urlParams);

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
            users.login,
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
          FROM (
            SELECT DISTINCT login FROM leets.vip WHERE login = ANY($1)
            UNION
            SELECT DISTINCT user_login FROM leets.feedback WHERE user_login = ANY($1) AND badge_awarded = TRUE
          ) users(login)
          LEFT JOIN leets.vip v ON v.login = users.login
          LEFT JOIN leets.feedback f ON f.user_login = users.login AND f.badge_awarded = TRUE
          GROUP BY users.login, v.token
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
      
      if (badgeData.vipStatus === 'vip' || badgeData.vipStatus === 'owner') {
        return { type: 'vip', name: badgeData.vipStatus === 'owner' ? 'Owner' : 'VIP' };
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
    }).filter((user: { level: number }) => user.level <= 26); // Filter out test accounts (level > 26)
    
    // Cache the result for 20 minutes
    progressCache.set(cacheKey, NewRespons);
    console.log(`Progress data cached for ${cacheKey}`);
    
    return NextResponse.json(NewRespons, { 
      status: 200,
      headers: { 'X-Cache': 'MISS' }
    });
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
