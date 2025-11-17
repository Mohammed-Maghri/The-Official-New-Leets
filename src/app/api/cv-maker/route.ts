import { NextResponse, NextRequest } from "next/server";
import * as jose from "jose";
import { DecryptionFunction } from "../auth/type.auth";

export const GET = async (request: NextRequest) => {
  try {
    await jose.jwtVerify(
      request.cookies.get("auth_code")?.value as string,
      new TextEncoder().encode(process.env.SECRET_KEY as string)
    );

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

    const userData = await fetchme.json();

    const authCookie = request.cookies.get("auth_code")?.value;
    if (!authCookie) {
      throw new Error("No auth_code cookie found");
    }

    const decodedJwt = jose.decodeJwt(authCookie);
    const decryptedToken = DecryptionFunction(decodedJwt.token as string);

    if (!decryptedToken || decryptedToken.trim() === "") {
      throw new Error("Decrypted token is empty or invalid");
    }

    const userProjects = await fetch(
      `${process.env.INTRA_TOKEN}/v2/users/${userData.login}/projects_users?page[size]=100`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${decryptedToken}`,
        },
      }
    );

    if (!userProjects.ok) {
      throw new Error("Failed to fetch projects");
    }

    const projects = await userProjects.json();

    const validatedProjects = projects
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((p: any) => p.validated === true && p.final_mark >= 80)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((p: any) => ({
        name: p.project.name,
        description: p.project.slug || "",
        final_mark: p.final_mark,
        validated: p.validated,
      }))
      .slice(0, 10);

    const userSkills = await fetch(
      `${process.env.INTRA_TOKEN}/v2/users/${userData.login}/cursus_users`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${decryptedToken}`,
        },
      }
    );

    let skills: string[] = [];
    let level = 0;

    if (userSkills.ok) {
      const cursusData = await userSkills.json();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cursus21 = cursusData.find((c: any) => c.cursus_id === 21);
      
      if (cursus21) {
        level = cursus21.level || 0;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        skills = cursus21.skills?.slice(0, 10).map((s: any) => s.name) || [];
      }
    }

    const cvData = {
      name: userData.usual_full_name || userData.displayname,
      email: userData.email,
      location: userData.campus_name || "42 Network",
      image: userData.image?.link,
      title: `Level ${level.toFixed(2)} Software Developer`,
      level: level.toFixed(2),
      about: `Passionate software developer with expertise in modern technologies. Currently at level ${level.toFixed(2)} in the 42 curriculum, with a strong foundation in programming and problem-solving.`,
      projects: validatedProjects,
      skills: skills,
      languages: [
        { name: "English", level: "Professional" },
        { name: "French", level: "Native" },
      ],
    };

    return NextResponse.json(cvData, { status: 200 });
  } catch (error) {
    console.error("Error in CV maker route:", error);
    return NextResponse.json(
      { error: "Internal Server Error: " + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
};
