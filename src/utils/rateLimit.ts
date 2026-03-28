import { NextRequest, NextResponse } from "next/server";

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

/**
 * Rate limiting is disabled — always allows the request through.
 * (Kept for API compatibility with routes that still call rateLimit().)
 */
export async function rateLimit(
  _request: NextRequest,
  _config: RateLimitConfig = { maxRequests: 30, windowMs: 60000 }
): Promise<NextResponse | null> {
  return null;
}

export const RateLimitPresets = {
  STRICT: { maxRequests: 30, windowMs: 60000 },
  STANDARD: { maxRequests: 40, windowMs: 60000 },
  RELAXED: { maxRequests: 60, windowMs: 60000 },
  AUTH: { maxRequests: 5, windowMs: 60000 },
  WRITE: { maxRequests: 15, windowMs: 60000 },
};
