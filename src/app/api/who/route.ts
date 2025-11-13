import { NextResponse, NextRequest } from "next/server";
import { DecryptionFunction } from "../auth/type.auth";
import * as jose from "jose";
import { Pool } from "pg";
import { rateLimit, RateLimitPresets } from "@/utils/rateLimit";

export async function GET(request: NextRequest) {
  // Rate limiting: 20 requests per minute
  const rateLimitResult = await rateLimit(request, RateLimitPresets.STRICT);
  if (rateLimitResult) return rateLimitResult;

  try {
    const user = request.cookies.get("auth_code");
    
    if (!user || !user.value) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    const secret = new TextEncoder().encode(process.env.SECRET_KEY as string);
    const userToken = user.value;
    
    try {
      await jose.jwtVerify(userToken, secret);
    } catch {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }
    
    const decodedToken = jose.decodeJwt(userToken);
    if (!decodedToken.token) {
      return NextResponse.json(
        { error: "Invalid token structure" },
        { status: 401 }
      );
    }
    
    // Force re-login for old JWT tokens without userId
    if (!decodedToken.userId || !decodedToken.campusId) {
      return NextResponse.json(
        { error: "Token outdated. Please log in again." },
        { status: 401 }
      );
    }
    
    const accessToken = DecryptionFunction(decodedToken.token as string);
    
    // Retry logic for 42 API fetch
    let data;
    let lastError;
    const maxRetries = 3;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        data = await fetch((process.env.INTRA_TOKEN as string) + "/v2/me", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          credentials: "include",
          signal: AbortSignal.timeout(10000), // 10 second timeout
        });
        
        if (data.ok) {
          break; // Success, exit retry loop
        }
        
        lastError = `API returned status ${data.status}`;
        
        // If it's a 401, don't retry
        if (data.status === 401) {
          return NextResponse.json(
            { error: "Invalid or expired access token" },
            { status: 401 }
          );
        }
        
        // Wait before retrying (exponential backoff)
        if (attempt < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        }
      } catch (fetchError) {
        lastError = fetchError instanceof Error ? fetchError.message : String(fetchError);
        console.error(`Attempt ${attempt + 1} failed:`, lastError);
        
        // Wait before retrying
        if (attempt < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        }
      }
    }
    
    if (!data || !data.ok) {
      return NextResponse.json(
        { error: "Failed to fetch user data from 42 API", details: lastError },
        { status: 503 }
      );
    }
    
    const userResponse = await data.json();
    
    if (!userResponse.email || !userResponse.login) {
      return NextResponse.json(
        { error: "Invalid user data received" },
        { status: 500 }
      );
    }
    
    let badge: { type: 'creator' | 'vip' | 'feedback'; name: string } | null = null;
    try {
      const pool = new Pool({ connectionString: process.env.DATABASE_KEY });
      
      const feedbackQuery = `
        SELECT badge_type 
        FROM leets.feedback 
        WHERE user_login = $1 
        AND badge_awarded = TRUE 
        ORDER BY created_at DESC 
        LIMIT 1
      `;
      const feedbackResult = await pool.query(feedbackQuery, [userResponse.login]);
      
      if (feedbackResult.rows.length > 0 && feedbackResult.rows[0].badge_type) {
        badge = { type: 'feedback', name: feedbackResult.rows[0].badge_type };
      } else {
        const vipQuery = `SELECT token FROM leets.vip WHERE login = $1`;
        const vipResult = await pool.query(vipQuery, [userResponse.login]);
        
        if (vipResult.rows.length > 0) {
          const token = vipResult.rows[0].token;
          if (token === 'creator') {
            badge = { type: 'creator', name: 'creator' };
          } else if (token === 'vip' || token === 'owner') {
            badge = { type: 'vip', name: token };
          }
        }
      }
      
      pool.end().catch((err: unknown) => {
        console.error("Error closing pool:", err);
      });
    } catch (err) {
      console.error("Error fetching badge:", err);
    }
    
    return NextResponse.json(
      {
        email: userResponse.email,
        login: userResponse.login,
        kind: userResponse.cursus_users?.length > 1 ? "student" : "pooler",
        image: userResponse.image?.versions?.large || "/nopic.jpg",
        staff: userResponse.staff !== undefined && userResponse.staff !== false,
        correction_point: userResponse.correction_point || 0,
        pool_month: userResponse.pool_month || null,
        pool_year: userResponse.pool_year || null,
        location: userResponse.location || null,
        wallet: userResponse.wallet || 0,
        campus_id: userResponse.campus?.[0]?.id || 0,
        campus_name: userResponse.campus?.[0]?.name || "Unknown",
        level: userResponse?.cursus_users?.[1]?.level || 0,
        fullname: userResponse.usual_full_name || userResponse.displayname || userResponse.login,
        badge: badge,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { 
        error: "Internal server error",
        message: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
