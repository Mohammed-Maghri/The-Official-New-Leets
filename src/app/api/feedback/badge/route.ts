import { NextResponse } from "next/server";
import { Pool } from "pg";
import { jwtVerify } from "jose";
import { awardBadgeSchema } from "../feedback.types";
import { DecryptionFunction } from "../../auth/type.auth";

export async function POST(req: Request) {
  let client;
  
  try {
    const cookies = req.headers.get("cookie");
    if (!cookies) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const authCodeCookie = cookies
      .split("; ")
      .find((c) => c.startsWith("auth_code="));
    
    if (!authCodeCookie) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const token = authCodeCookie.split("=")[1];

    const secret = new TextEncoder().encode(process.env.JWT_ENCRYPT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    if (!payload?.accessToken) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      );
    }

    const decryptedAccessToken = DecryptionFunction(payload.accessToken as string);

    const fetchme = await fetch("https://api.intra.42.fr/v2/me", {
      headers: {
        Authorization: `Bearer ${decryptedAccessToken}`,
      },
    });

    if (!fetchme.ok) {
      return NextResponse.json(
        { error: "Failed to authenticate with 42 API" },
        { status: 401 }
      );
    }

    const currentUser = await fetchme.json();

    client = new Pool({ connectionString: process.env.DATABASE_KEY });

    const creatorCheckQuery = `SELECT * FROM leets.vip WHERE login = $1 AND token = 'creator'`;
    const creatorCheckResult = await client.query(creatorCheckQuery, [currentUser.login]);

    if (creatorCheckResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Unauthorized. Only creators can award badges." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validation = awardBadgeSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { feedbackId, badgeType } = validation.data;

    const updateQuery = `
      UPDATE leets.feedback 
      SET badge_awarded = TRUE, 
          badge_type = $1,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;

    const updateResult = await client.query(updateQuery, [badgeType, feedbackId]);

    if (updateResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Feedback not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: `Badge "${badgeType}" awarded successfully`,
        feedback: updateResult.rows[0],
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error awarding badge:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    if (client) {
      await client.end();
    }
  }
}

export async function DELETE(req: Request) {
  let client;
  
  try {
    const cookies = req.headers.get("cookie");
    if (!cookies) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const authCodeCookie = cookies
      .split("; ")
      .find((c) => c.startsWith("auth_code="));
    
    if (!authCodeCookie) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const token = authCodeCookie.split("=")[1];

    const secret = new TextEncoder().encode(process.env.JWT_ENCRYPT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    if (!payload?.accessToken) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      );
    }

    const decryptedAccessToken = DecryptionFunction(payload.accessToken as string);

    const fetchme = await fetch("https://api.intra.42.fr/v2/me", {
      headers: {
        Authorization: `Bearer ${decryptedAccessToken}`,
      },
    });

    if (!fetchme.ok) {
      return NextResponse.json(
        { error: "Failed to authenticate with 42 API" },
        { status: 401 }
      );
    }

    const currentUser = await fetchme.json();

    client = new Pool({ connectionString: process.env.DATABASE_KEY });

    const creatorCheckQuery = `SELECT * FROM leets.vip WHERE login = $1 AND token = 'creator'`;
    const creatorCheckResult = await client.query(creatorCheckQuery, [currentUser.login]);

    if (creatorCheckResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Unauthorized. Only creators can remove badges." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const feedbackId = searchParams.get("feedbackId");

    if (!feedbackId) {
      return NextResponse.json(
        { error: "Feedback ID is required" },
        { status: 400 }
      );
    }

    const updateQuery = `
      UPDATE leets.feedback 
      SET badge_awarded = FALSE, 
          badge_type = NULL,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;

    const updateResult = await client.query(updateQuery, [parseInt(feedbackId)]);

    if (updateResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Feedback not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Badge removed successfully",
        feedback: updateResult.rows[0],
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error removing badge:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    if (client) {
      await client.end();
    }
  }
}
