import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { DecryptionFunction } from "../auth/type.auth";
import * as jose from "jose";

export async function GET(request: NextRequest) {
  
  try {
    const cookieStore = await cookies();
    const authCode = cookieStore.get("auth_code");


    if (!authCode || !authCode.value) {
      console.error("No auth_code found in cookies");
      return NextResponse.json(
        { error: "Unauthorized - No auth code found" },
        { status: 401 }
      );
    }

    const secret = new TextEncoder().encode(process.env.SECRET_KEY as string);
    const userToken = authCode.value;
    
    // Verify JWT token
    try {
      await jose.jwtVerify(userToken, secret);
    } catch (jwtError) {
      console.error("JWT verification failed:", jwtError);
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }
    
    // Decode and decrypt token
    const decodedToken = jose.decodeJwt(userToken);
    if (!decodedToken.token) {
      console.error("Invalid token structure - no token field");
      return NextResponse.json(
        { error: "Invalid token structure" },
        { status: 401 }
      );
    }
    
    
    const accessToken = DecryptionFunction(decodedToken.token as string);

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const campusId = searchParams.get("campusId");
    const projectId = searchParams.get("projectId");
    const fetchPromo = searchParams.get("fetchPromo") === "true";
    const autoMode = searchParams.get("auto") === "true"; // New: auto-detect campus and project


    // AUTO MODE: Get user's campus and first in-progress project, then fetch peers
    if (autoMode) {
      
      try {
        // Get user info
        const userResponse = await fetch("https://api.intra.42.fr/v2/me", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });

        if (!userResponse.ok) {
          return NextResponse.json({ error: "Failed to fetch user data" }, { status: userResponse.status });
        }

        const userData = await userResponse.json();
        const userCampusId = userData.campus_users?.[0]?.campus_id || 16;
        
        
        // Get user's in-progress projects
        const projectsResponse = await fetch("https://api.intra.42.fr/v2/me/projects_users?filter[status]=in_progress", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });

        if (!projectsResponse.ok) {
          console.error("Failed to fetch projects, status:", projectsResponse.status);
          // Treat as "no projects" scenario
          return NextResponse.json({ 
            campus: { id: userCampusId, name: "Your Campus" },
            project: null,
            peers: [],
            noProjects: true,
            message: "Oops! I guess you're not subscribed to any projects yet. Please search for a project to find peers!"
          });
        }

        const userProjects = await projectsResponse.json();
        
        if (userProjects.length === 0) {
          return NextResponse.json({ 
            campus: { id: userCampusId, name: "Your Campus" },
            project: null,
            peers: [],
            noProjects: true,
            message: "You are not currently subscribed to any projects. Please search for a project to find peers!"
          });
        }

        // Get first in-progress project
        const firstProject = userProjects[0];
        const detectedProjectId = firstProject.project.id;
        const detectedProjectName = firstProject.project.name;
        
        
        // Fetch peers for this project
        const peersUrl = `https://api.intra.42.fr/v2/projects/${detectedProjectId}/projects_users?filter[status]=in_progress&filter[cursus]=21&filter[campus]=${userCampusId}&page[number]=1&page[size]=100`;
        
        const peersResponse = await fetch(peersUrl, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });

        if (!peersResponse.ok) {
          return NextResponse.json({ error: "Failed to fetch peers" }, { status: peersResponse.status });
        }

        const peersData = await peersResponse.json();
        
        // Filter: not alumni, not finished
        const filteredPeers = peersData.filter((pu: unknown) => {
          const peerUser = pu as { user?: { "alumni?"?: boolean }; status?: string };
          const isNotAlumni = !peerUser.user?.["alumni?"];
          const isNotFinished = peerUser.status !== "finished";
          return isNotAlumni && isNotFinished;
        });
        
        return NextResponse.json({
          campus: { id: userCampusId, name: "Your Campus" },
          project: { id: detectedProjectId, name: detectedProjectName },
          peers: filteredPeers
        });
        
      } catch {
        return NextResponse.json({ error: "Failed to auto-detect project" }, { status: 500 });
      }
    }

    // If fetchPromo is true, get peers from projects at user's level range
    if (fetchPromo) {
      try {
        // Step 1: Get user info to determine level
        const userResponse = await fetch("https://api.intra.42.fr/v2/me", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });

        if (!userResponse.ok) {
          return NextResponse.json(
            { error: "Failed to fetch user data" },
            { status: userResponse.status }
          );
        }

        const userData = await userResponse.json();
        
        // Find the 42cursus
        const cursus42 = userData.cursus_users?.find(
          (cu: unknown) => {
            const cursusUser = cu as { cursus?: { slug?: string }; cursus_id?: number };
            return cursusUser.cursus?.slug === "42cursus" || cursusUser.cursus_id === 21;
          }
        );

        if (!cursus42) {
          return NextResponse.json(
            { error: "User not enrolled in 42 cursus" },
            { status: 404 }
          );
        }

        const cursus42Typed = cursus42 as { level?: number };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const userCampusId = (userData.campus_users as any)?.[0]?.campus_id || campusId || 16;
        const userLevel = cursus42Typed.level || 0;

        // Step 3: Load projects from JSON and filter by level
        const fs = await import("fs").then((m) => m.promises);
        const path = await import("path");
        const projectsPath = path.join(process.cwd(), "public", "Project_lvl.json");
        const projectsData = JSON.parse(await fs.readFile(projectsPath, "utf-8"));
        
        // Get projects around user's level - wider range for better results
        // For level 11, get projects between 0-7500 XP approximately
        const minXP = Math.max(0, (userLevel - 5) * 250);
        const maxXP = (userLevel + 5) * 550;
        
        const relevantProjects = projectsData
          .filter((project: unknown) => {
            const proj = project as { state?: string; difficulty?: number; project_id?: number };
            const isAvailable = proj.state === "Disponible" || proj.state === "Available";
            const inLevelRange = (proj.difficulty || 0) >= minXP && (proj.difficulty || 0) <= maxXP;
            const hasId = proj.project_id && proj.project_id > 0;
            return isAvailable && inLevelRange && hasId;
          })
          .sort((a: unknown, b: unknown) => {
            const projA = a as { difficulty?: number };
            const projB = b as { difficulty?: number };
            return (projA.difficulty || 0) - (projB.difficulty || 0);
          })
          .slice(0, 15); // Take top 15 most relevant projects

        if (relevantProjects.length === 0) {
          return NextResponse.json([]);
        }

        const projectIds = relevantProjects.map((p: unknown) => (p as { project_id?: number }).project_id);

        // Step 5: Fetch all users subscribed to these projects
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const allPeers: any[] = [];
        
        for (const projectId of projectIds) {
          // If campusId is 0, fetch all campuses (no filter), otherwise filter by specific campus
          const campusFilter = userCampusId && userCampusId !== 0 ? `&filter[campus]=${userCampusId}` : '';
          const projectUsersUrl = `https://api.intra.42.fr/v2/projects/${projectId}/projects_users?filter[status]=in_progress&filter[cursus]=21${campusFilter}&page[number]=1&page[size]=100`;
          
          try {
            const projectUsersResponse = await fetch(projectUsersUrl, {
              method: "GET",
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
              },
            });

            if (projectUsersResponse.ok) {
              const projectUsers = await projectUsersResponse.json();
              
              // Filter: exclude alumni and finished projects only
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const filteredUsers = projectUsers.filter((pu: any) => {
                const isNotAlumni = !pu.user?.["alumni?"];
                const isNotFinished = pu.status !== "finished";
                
                return isNotAlumni && isNotFinished;
              });
              
              allPeers.push(...filteredUsers);
            }
          } catch {
            // Error fetching project users, skip this project
          }
        }

        return NextResponse.json(allPeers);
      } catch (error) {
        console.error("=== ERROR IN PROMO PEERS FETCH ===");
        console.error("Error type:", error instanceof Error ? error.constructor.name : typeof error);
        console.error("Error message:", error instanceof Error ? error.message : String(error));
        console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
        
        return NextResponse.json(
          { 
            error: "Failed to fetch promo peers", 
            details: error instanceof Error ? error.message : "Unknown error",
            type: error instanceof Error ? error.constructor.name : typeof error
          },
          { status: 500 }
        );
      }
    }

    // Regular project-based peer finding
    if (!campusId || !projectId) {
      return NextResponse.json(
        { error: "Missing required parameters: campusId and projectId" },
        { status: 400 }
      );
    }

    // Fetch project users from 42 API using correct filters
    const apiUrl = `https://api.intra.42.fr/v2/projects/${projectId}/projects_users?filter[status]=in_progress&filter[cursus]=21&filter[campus]=${campusId}&page[number]=1&page[size]=100`;


    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error("42 API Error:", response.status, response.statusText);
      const errorText = await response.text();
      console.error("Error response:", errorText);
      return NextResponse.json(
        { error: "Failed to fetch data from 42 API" },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Get current user info for alumni filtering
    const userInfoResponse = await fetch("https://api.intra.42.fr/v2/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (userInfoResponse.ok) {
      // Filter: not alumni and not finished
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const filteredData = data.filter((pu: any) => {
        const isNotAlumni = !pu.user?.["alumni?"];
        const isNotFinished = pu.status !== "finished";
        
        return isNotAlumni && isNotFinished;
      });
      
      return NextResponse.json(filteredData);
    }

    // Fallback: return raw data if user info fetch fails
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in peerfinder API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}