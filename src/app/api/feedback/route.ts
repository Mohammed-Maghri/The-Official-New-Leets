import { NextResponse, NextRequest } from "next/server";
import { DecryptionFunction } from "../auth/type.auth";
import * as jose from "jose";
import { Pool } from "pg";
import { feedbackSchema } from "./feedback.types";
import { z } from "zod";
import { feedbackRateLimiter } from "./rateLimit";
import { rateLimit, RateLimitPresets } from "@/utils/rateLimit";

export async function GET(request: NextRequest) {
  // Rate limiting: 60 requests per minute
  const rateLimitResult = await rateLimit(request, RateLimitPresets.RELAXED);
  if (rateLimitResult) return rateLimitResult;

  let client: Pool | null = null;
  
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
    } catch (jwtError) {
      console.error("JWT verification failed:", jwtError);
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
    
    const accessToken = DecryptionFunction(decodedToken.token as string);
    
    const userData = await fetch((process.env.INTRA_TOKEN as string) + "/v2/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    
    if (!userData.ok) {
      return NextResponse.json(
        { error: "Failed to fetch user data" },
        { status: userData.status }
      );
    }
    
    const userInfo = await userData.json();
    
    client = new Pool({ connectionString: process.env.DATABASE_KEY });
    
    const creatorCheckQuery = `SELECT * FROM leets.vip WHERE login = $1 AND token = 'creator'`;
    const creatorCheckResult = await client.query(creatorCheckQuery, [userInfo.login]);
    
    if (creatorCheckResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Unauthorized. Only creators can access feedback reviews." },
        { status: 403 }
      );
    }
    
    const feedbackQuery = `
      SELECT 
        id,
        user_login,
        user_email,
        user_image,
        campus_id,
        campus_name,
        feedback,
        dislikes,
        improvements,
        rating,
        wants_to_contribute,
        skills,
        contribution_area,
        badge_awarded,
        badge_type,
        created_at,
        updated_at
      FROM leets.feedback
      WHERE deleted_at IS NULL
      ORDER BY created_at DESC
    `;
    
    const result = await client.query(feedbackQuery);
    
    return NextResponse.json(
      {
        success: true,
        count: result.rows.length,
        feedback: result.rows,
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error("Error in GET /api/feedback:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : String(error),
      },
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
}

export async function POST(request: NextRequest) {
  let client: Pool | null = null;
  
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
    } catch (jwtError) {
      console.error("JWT verification failed:", jwtError);
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
    
    const accessToken = DecryptionFunction(decodedToken.token as string);
    
    const userData = await fetch((process.env.INTRA_TOKEN as string) + "/v2/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    
    if (!userData.ok) {
      return NextResponse.json(
        { error: "Failed to fetch user data" },
        { status: userData.status }
      );
    }
    
    const userInfo = await userData.json();
    
    const rateLimitCheck = feedbackRateLimiter.check(userInfo.login);
    
    if (!rateLimitCheck.allowed) {
      const retryMinutes = Math.ceil((rateLimitCheck.retryAfter || 600) / 60);
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          message: `You can only submit feedback once per 10 minutes. Please try again in ${retryMinutes} minute(s).`,
          retryAfter: rateLimitCheck.retryAfter,
        },
        { 
          status: 429,
          headers: {
            'Retry-After': rateLimitCheck.retryAfter?.toString() || '600',
          }
        }
      );
    }
    
    client = new Pool({ connectionString: process.env.DATABASE_KEY });
    
    const countQuery = `
      SELECT COUNT(*) as feedback_count 
      FROM leets.feedback 
      WHERE user_login = $1 AND deleted_at IS NULL
    `;
    
    const countResult = await client.query(countQuery, [userInfo.login]);
    const feedbackCount = parseInt(countResult.rows[0].feedback_count);
    
    if (feedbackCount >= 2) {
      return NextResponse.json(
        {
          error: "Feedback limit reached",
          message: "You have already submitted the maximum of 2 feedbacks. Thank you for your contributions!",
          currentCount: feedbackCount,
          maxAllowed: 2,
        },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    
    try {
      const validatedData = feedbackSchema.parse(body);
      
      const query = `
        INSERT INTO leets.feedback (
          user_login,
          user_email,
          user_image,
          campus_id,
          campus_name,
          feedback,
          dislikes,
          improvements,
          rating,
          wants_to_contribute,
          skills,
          contribution_area,
          created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
        RETURNING id, created_at
      `;
      
      const values = [
        userInfo.login,
        userInfo.email,
        userInfo.image?.versions?.medium || userInfo.image?.versions?.small || "/nopic.jpg",
        userInfo.campus?.[0]?.id || 0,
        userInfo.campus?.[0]?.name || "Unknown",
        validatedData.feedback || null,
        validatedData.dislikes || null,
        validatedData.improvements || null,
        validatedData.rating,
        validatedData.contributionArea && validatedData.contributionArea.length > 0,
        validatedData.skills || null,
        validatedData.contributionArea && validatedData.contributionArea.length > 0 
          ? validatedData.contributionArea 
          : null,
      ];
      
      const result = await client.query(query, values);
      
      return NextResponse.json(
        {
          success: true,
          message: "Feedback submitted successfully",
          feedbackId: result.rows[0].id,
          submittedAt: result.rows[0].created_at,
          remainingSubmissions: 2 - feedbackCount - 1,
        },
        { status: 201 }
      );
      
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        return NextResponse.json(
          {
            error: "Validation failed",
            issues: validationError.issues.map((issue) => ({
              field: issue.path.join("."),
              message: issue.message,
            })),
          },
          { status: 400 }
        );
      }
      throw validationError;
    }
    
  } catch (error) {
    console.error("Error in /api/feedback:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : String(error),
      },
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
}

export async function DELETE(request: NextRequest) {
  let client: Pool | null = null;
  
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
    } catch (jwtError) {
      console.error("JWT verification failed:", jwtError);
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
    
    const accessToken = DecryptionFunction(decodedToken.token as string);
    
    const userData = await fetch((process.env.INTRA_TOKEN as string) + "/v2/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    
    if (!userData.ok) {
      return NextResponse.json(
        { error: "Failed to fetch user data" },
        { status: userData.status }
      );
    }
    
    const userInfo = await userData.json();
    
    client = new Pool({ connectionString: process.env.DATABASE_KEY });
    
    const creatorCheckQuery = `SELECT * FROM leets.vip WHERE login = $1 AND token = 'creator'`;
    const creatorCheckResult = await client.query(creatorCheckQuery, [userInfo.login]);
    
    if (creatorCheckResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Unauthorized. Only creators can delete feedback." },
        { status: 403 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const feedbackId = searchParams.get("feedbackId");
    
    if (!feedbackId) {
      return NextResponse.json(
        { error: "Feedback ID is required" },
        { status: 400 }
      );
    }
    
    const deleteQuery = `
      UPDATE leets.feedback
      SET deleted_at = NOW(), deleted_by = $1
      WHERE id = $2 AND deleted_at IS NULL
      RETURNING id
    `;
    
    const result = await client.query(deleteQuery, [userInfo.login, feedbackId]);
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Feedback not found or already deleted" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      {
        success: true,
        message: "Feedback deleted successfully",
        feedbackId: result.rows[0].id,
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error("Error in DELETE /api/feedback:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : String(error),
      },
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
}
