import { NextRequest, NextResponse } from "next/server";
import { UserProgress } from "./progress.types";
import { decodeJwt, jwtVerify } from "jose";
import { DecryptionFunction } from "../auth/type.auth";
import { Pool, PoolClient } from "pg";
import { rateLimit, RateLimitPresets } from "@/utils/rateLimit";
import { progressCache } from "@/utils/profileCache";

// 42 API group IDs for test and staff accounts
const TEST_ACCOUNT_GROUP = 119;
const STAFF_GROUP = 1;
const CACHE_VALIDITY_DAYS = 30; // Refresh from 42 API once per month

async function fetchGroupLogins(groupId: number, token: string): Promise<string[]> {
  const logins: string[] = [];
  let page = 1;
  while (true) {
    const res = await fetch(
      `${process.env.INTRA_TOKEN}/v2/groups/${groupId}/users?page[size]=100&page[number]=${page}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!res.ok) break;
    const users = await res.json();
    if (!users.length) break;
    logins.push(...users.map((u: { login: string }) => u.login));
    if (users.length < 100) break;
    page++;
  }
  return logins;
}

async function getBlockedLoginsFromDb(client: PoolClient): Promise<{ logins: Set<string>; lastRefreshed: Date | null }> {
  const metaResult = await client.query(
    "SELECT last_refreshed_at FROM leets.blocked_logins_meta WHERE id = 1"
  );
  const lastRefreshed = metaResult.rows[0]?.last_refreshed_at
    ? new Date(metaResult.rows[0].last_refreshed_at)
    : null;

  const loginsResult = await client.query("SELECT login FROM leets.blocked_logins");
  const logins = new Set(loginsResult.rows.map((r: { login: string }) => r.login));

  return { logins, lastRefreshed };
}

async function refreshBlockedLoginsInDb(client: PoolClient, token: string): Promise<Set<string>> {
  const [testLogins, staffLogins] = await Promise.all([
    fetchGroupLogins(TEST_ACCOUNT_GROUP, token),
    fetchGroupLogins(STAFF_GROUP, token),
  ]);

  const blocked = new Set([...testLogins, ...staffLogins]);

  await client.query("TRUNCATE leets.blocked_logins");
  const entries = [...blocked].map((login) => ({
    login,
    source: testLogins.includes(login) ? "test" : "staff",
  }));
  for (const { login, source } of entries) {
    await client.query(
      "INSERT INTO leets.blocked_logins (login, source) VALUES ($1, $2) ON CONFLICT (login) DO UPDATE SET source = EXCLUDED.source",
      [login, source]
    );
  }

  await client.query(
    "UPDATE leets.blocked_logins_meta SET last_refreshed_at = CURRENT_TIMESTAMP WHERE id = 1"
  );
  console.log(`Blocked logins refreshed in DB: ${blocked.size} test/staff accounts`);
  return blocked;
}

async function getBlockedLogins(client: PoolClient, token: string): Promise<Set<string>> {
  const { logins, lastRefreshed } = await getBlockedLoginsFromDb(client);

  const now = new Date();
  const cacheValid =
    lastRefreshed &&
    logins.size > 0 &&
    (now.getTime() - lastRefreshed.getTime()) / (1000 * 60 * 60 * 24) < CACHE_VALIDITY_DAYS;

  if (cacheValid) {
    console.log(`Blocked logins from DB: ${logins.size} (last refreshed: ${lastRefreshed?.toISOString()})`);
    return logins;
  }

  return refreshBlockedLoginsInDb(client, token);
}

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
      console.log(`✅ Progress cache HIT for ${cacheKey} (age: ${cacheAge}min, size: ${progressCache.size()} entries)`);
      return NextResponse.json(cachedData, { 
        status: 200,
        headers: { 'X-Cache': 'HIT' }
      });
    }
    
    console.log(`❌ Progress cache MISS for ${cacheKey} (cache size: ${progressCache.size()} entries)`);

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
      console.error(`⚠️ 42 API Error (HTTP ${data.status})`);
      
      // If API is down (502, 503, 504), return empty array instead of error
      if (data.status >= 502 && data.status <= 504) {
        console.log("🔄 42 API temporarily unavailable, returning empty result");
        return NextResponse.json([], {
          status: 200,
          headers: { 
            'X-Cache': 'MISS',
            'X-API-Status': 'unavailable'
          }
        });
      }
      
      return NextResponse.json(
        { error: "Failed to fetch progress data" },
        { status: 500 }
      );
    }

    const response = await data.json();

    // Get all user logins from the response
    const allUserLogins = response.map((item: UserProgress) => item.user.login);

    // Create DB client for blocked logins and VIP lookup
    client = new Pool({ connectionString: process.env.DATABASE_KEY });
    const dbClient = await client.connect();

    let blockedLogins: Set<string>;
    const vipTokenMap = new Map<string, string>();
    try {
      // Fetch blocked logins from DB (refreshes from 42 API monthly)
      blockedLogins = await getBlockedLogins(dbClient, DecryptionFunction(Decode));

      if (allUserLogins.length > 0) {
        try {
          const vipResult = await dbClient.query(
            `SELECT login, token FROM leets.vip WHERE login = ANY($1)`,
            [allUserLogins]
          );
          vipResult.rows.forEach((row: { login: string; token: string }) => {
            vipTokenMap.set(row.login, row.token);
          });
        } catch (err) {
          console.error("Error fetching VIP tokens:", err);
        }
      }
    } finally {
      dbClient.release();
    }
    
    const getBadge = (login: string) => {
      const token = vipTokenMap.get(login)?.toLowerCase();
      if (!token) return null;
      if (token === 'owner') return { type: 'owner', name: 'owner' };
      if (token === 'creator') return { type: 'creator', name: 'Creator' };
      if (token === 'staff') return { type: 'staff', name: 'staff' };
      if (token === 'vip') return { type: 'vip', name: 'VIP' };
      return null;
    };
    
    const NewRespons = response.map((item: UserProgress) => {
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
        badge: getBadge(item.user.login),
      };
    }).filter((user: { login: string; staff: boolean; kind: string }) =>
      !user.staff && user.kind === "student" && !blockedLogins.has(user.login)
    ); // Filter out test/staff accounts
    
    // Cache the result for 20 minutes
    progressCache.set(cacheKey, NewRespons);
    console.log(`💾 Progress data cached for ${cacheKey} (cache size: ${progressCache.size()} entries)`);
    
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
