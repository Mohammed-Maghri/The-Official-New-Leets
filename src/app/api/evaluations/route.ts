import { NextResponse, NextRequest } from "next/server";
import * as jose from "jose";
import { DecryptionFunction } from "../auth/type.auth";
import { profileCache, progressCache } from "@/utils/profileCache";

interface ScaleTeam {
  id: number;
  scale_id: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
  feedback: string | null;
  final_mark: number | null;
  flag: {
    id: number;
    name: string;
    positive: boolean;
    icon: string;
    created_at: string;
    updated_at: string;
  } | null;
  begin_at: string;
  correcteds: Array<{
    id: number;
    login: string;
    url: string;
  }>;
  corrector: {
    id: number;
    login: string;
    url: string;
  };
  truant: object;
  filled_at: string | null;
  questions_with_answers: Array<unknown>;
  scale: {
    id: number;
    evaluation_id: number;
    name: string;
    is_primary: boolean;
    comment: string | null;
    introduction_md: string;
    disclaimer_md: string | null;
    guidelines_md: string;
    created_at: string;
    correction_number: number;
    duration: number;
  };
  team: {
    id: number;
    name: string;
    url: string;
    final_mark: number | null;
    project_id: number;
    created_at: string;
    updated_at: string;
    status: string;
    terminating_at: string | null;
    users: Array<{
      id: number;
      login: string;
      url: string;
      leader: boolean;
      occurrence: number;
      validated: boolean;
      projects_user_id: number;
    }>;
    locked: boolean;
    validated: boolean | null;
    closed: boolean;
    repo_url: string;
    repo_uuid: string;
    locked_at: string | null;
    closed_at: string | null;
    project_session_id: number;
    project_gitlab_path: string | null;
  };
}

interface UserProfile {
  id: number;
  login: string;
  usual_full_name: string | null;
  image: {
    link: string;
    versions: {
      large: string;
      medium: string;
      small: string;
      micro: string;
    };
  };
}

export const GET = async (request: NextRequest) => {
  try {
    const requestUrl = new URL(request.url);
    const campusParam = requestUrl.searchParams.get("campus") || "16";
    const dateParam = requestUrl.searchParams.get("date") || new Date().toISOString().split('T')[0];
    const pageParam = requestUrl.searchParams.get("page") || "1";
    
    // Create cache key
    const cacheKey = `evaluations_${campusParam}_${dateParam}_${pageParam}`;
    
    // Check cache first (20 min TTL)
    const cachedData = progressCache.get(cacheKey);
    if (cachedData) {
      const cacheAge = progressCache.getAge(cacheKey);
      console.log(`Evaluations cache HIT for ${cacheKey} (age: ${cacheAge} minutes)`);
      return NextResponse.json(cachedData, { 
        status: 200,
        headers: { 'X-Cache': 'HIT' }
      });
    }
    
    console.log(`Evaluations cache MISS for ${cacheKey}`);
    
    
    // Calculate next day for date range
    const currentDate = new Date(dateParam);
    const nextDate = new Date(currentDate);
    nextDate.setDate(nextDate.getDate() + 1);
    const nextDateStr = nextDate.toISOString().split('T')[0];
    
    // Verify JWT token
    await jose.jwtVerify(
      request.cookies.get("auth_code")?.value as string,
      new TextEncoder().encode(process.env.SECRET_KEY as string)
    );
    
    // Fetch user data to validate token and potentially refresh it
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
    
    const authCookie = request.cookies.get("auth_code")?.value;
    if (!authCookie) {
      throw new Error("No auth_code cookie found");
    }
    
    const decodedJwt = jose.decodeJwt(authCookie);
    const decryptedToken = DecryptionFunction(decodedJwt.token as string);
    
    if (!decryptedToken || decryptedToken.trim() === "") {
      throw new Error("Decrypted token is empty or invalid");
    }
    
    if (!process.env.INTRA_TOKEN) {
      throw new Error("INTRA_TOKEN environment variable is not set");
    }
    
    // Build API parameters for scale_teams endpoint
    const apiParams: Record<string, string> = {
      "range[filled_at]": `${dateParam},${nextDateStr}`,
      "page[size]": "100",
      "page[number]": pageParam,
      "sort": "-filled_at",
    };
    
    // Only add campus filter if not "All Campuses" (id = 0)
    if (campusParam !== "0") {
      apiParams["filter[campus_id]"] = campusParam;
    }
    
    const apiParamsUrl = new URLSearchParams(apiParams);
    
    console.log("Fetching evaluations with params:", apiParamsUrl.toString());
    
    // Fetch scale_teams data
    const scaleTeamsResponse = await fetch(
      `${process.env.INTRA_TOKEN}/v2/scale_teams?${apiParamsUrl.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${decryptedToken}`,
        },
      }
    );
    
    if (!scaleTeamsResponse.ok) {
      const errorBody = await scaleTeamsResponse.text();
      console.error("42 API Error:", errorBody);
      throw new Error(`Failed to fetch scale_teams: HTTP ${scaleTeamsResponse.status} - ${errorBody}`);
    }
    
    const scaleTeamsData: ScaleTeam[] = await scaleTeamsResponse.json();
    
    // Fetch user profiles to get real profile pictures with caching
    const userLogins = new Set<string>();
    scaleTeamsData.forEach(evaluation => {
      userLogins.add(evaluation.corrector.login);
      evaluation.correcteds.forEach(corrected => userLogins.add(corrected.login));
    });
    
    const loginArray = Array.from(userLogins);
    
    // Check cache first
    const userProfiles = profileCache.getMany(loginArray);
    const missingLogins = profileCache.getMissingLogins(loginArray);
    
    console.log(`Profile cache: ${userProfiles.size} hits, ${missingLogins.length} misses out of ${loginArray.length} total`);
    
    // Only fetch profiles that are not in cache
    if (missingLogins.length > 0) {
      const batchSize = 50;
      for (let i = 0; i < missingLogins.length; i += batchSize) {
        const batch = missingLogins.slice(i, i + batchSize);
        const userParams = new URLSearchParams({
          "filter[login]": batch.join(","),
          "page[size]": batchSize.toString(),
        });
        
        try {
          const usersResponse = await fetch(
            `${process.env.INTRA_TOKEN}/v2/users?${userParams.toString()}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${decryptedToken}`,
              },
            }
          );
          
          if (usersResponse.ok) {
            const users: UserProfile[] = await usersResponse.json();
            users.forEach(user => {
              const profilePicture = user.image?.link || user.image?.versions?.small || "";
              userProfiles.set(user.login, profilePicture);
              profileCache.set(user.login, profilePicture);
            });
          }
        } catch (error) {
          console.error("Error fetching user profiles batch:", error);
          // Continue even if batch fails
        }
      }
    }
    
    // Transform data with real profile pictures
    const transformedEvaluations = scaleTeamsData.map(evaluation => {
      return {
        id: evaluation.id,
        created_at: evaluation.created_at,
        begin_at: evaluation.begin_at,
        filled_at: evaluation.filled_at,
        final_mark: evaluation.final_mark,
        comment: evaluation.comment,
        feedback: evaluation.feedback,
        flag: evaluation.flag,
        corrector: {
          id: evaluation.corrector.id,
          login: evaluation.corrector.login,
          full_name: evaluation.corrector.login,
          profile_picture: userProfiles.get(evaluation.corrector.login) || null,
        },
        correcteds: evaluation.correcteds.map((corrected) => {
          return {
            id: corrected.id,
            login: corrected.login,
            full_name: corrected.login,
            profile_picture: userProfiles.get(corrected.login) || null,
          };
        }),
        project: {
          id: evaluation.team.project_id,
          name: evaluation.scale.name,
          final_mark: evaluation.team.final_mark,
        },
        team: {
          id: evaluation.team.id,
          name: evaluation.team.name,
          status: evaluation.team.status,
          validated: evaluation.team.validated,
          closed: evaluation.team.closed,
        },
        passed: evaluation.final_mark !== null && evaluation.final_mark >= 50,
      };
    });
    
    // Cache the result for 20 minutes
    progressCache.set(cacheKey, transformedEvaluations);
    console.log(`Evaluations data cached for ${cacheKey}`);
    
    return NextResponse.json(transformedEvaluations, {
      status: 200,
      headers: { 'X-Cache': 'MISS' }
    });
  } catch (error) {
    console.error("Error in evaluations route:", error);
    return NextResponse.json(
      { error: "Internal Server Error: " + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
};
