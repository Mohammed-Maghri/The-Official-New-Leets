import { NextResponse } from "next/server";
import { Pool } from "pg";
import * as jose from "jose";
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

    const secret = new TextEncoder().encode(process.env.SECRET_KEY);
    
    // Verify JWT token
    try {
      await jose.jwtVerify(token, secret);
    } catch (jwtError) {
      console.error("JWT verification failed:", jwtError);
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }
    
    // Decode and decrypt token
    const payload = jose.decodeJwt(token);

    if (!payload?.token) {
      return NextResponse.json(
        { error: "Invalid token structure" },
        { status: 401 }
      );
    }

    const decryptedAccessToken = DecryptionFunction(payload.token as string);

    const fetchme = await fetch((process.env.INTRA_TOKEN as string) + "/v2/me", {
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

    const { feedbackId, badgeType, customMessage } = validation.data;

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

    const feedback = updateResult.rows[0];
    
    // Create notification for the user who received the badge
    try {
      // First, fetch the user's 42 intra ID from their login
      const userLookupResponse = await fetch(
        `https://api.intra.42.fr/v2/users/${feedback.user_login}`,
        {
          headers: {
            Authorization: `Bearer ${decryptedAccessToken}`,
          },
        }
      );

      if (userLookupResponse.ok) {
        const userLookupData = await userLookupResponse.json();
        const targetUserId = userLookupData.id;

        const notificationQuery = `
          INSERT INTO notifications (
            title, 
            message, 
            type, 
            target_type, 
            target_user_id,
            sender_username,
            sender_image,
            link
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `;
        
        const notificationMessage = customMessage 
          ? `🏆 Badge Awarded!\n\n${customMessage}`
          : `Congratulations! You've been awarded the "${badgeType}" badge for your exceptional feedback.`;
        
        await client.query(notificationQuery, [
          '🏆 Badge Awarded!',
          notificationMessage,
          'success',
          'specific',
          targetUserId,
          'mmaghri',
          'https://cdn.intra.42.fr/users/83b4706433bb90d165a91eafb7c9bb86/large_mmaghri.jpg',
          null
        ]);
      } else {
        console.error("Failed to lookup user from 42 API:", feedback.user_login);
      }
    } catch (notifError) {
      console.error("Error creating notification:", notifError);
      // Don't fail the badge award if notification fails
    }

    return NextResponse.json(
      {
        success: true,
        message: `Badge "${badgeType}" awarded successfully`,
        feedback: feedback,
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

    const secret = new TextEncoder().encode(process.env.SECRET_KEY);
    
    // Verify JWT token
    try {
      await jose.jwtVerify(token, secret);
    } catch (jwtError) {
      console.error("JWT verification failed:", jwtError);
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }
    
    // Decode and decrypt token
    const payload = jose.decodeJwt(token);

    if (!payload?.token) {
      return NextResponse.json(
        { error: "Invalid token structure" },
        { status: 401 }
      );
    }

    const decryptedAccessToken = DecryptionFunction(payload.token as string);

    const fetchme = await fetch((process.env.INTRA_TOKEN as string) + "/v2/me", {
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
