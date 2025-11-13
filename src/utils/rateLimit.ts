import { NextRequest, NextResponse } from "next/server";

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// Store rate limit data in memory (per user/IP)
const rateLimitMap = new Map<string, RateLimitEntry>();

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now > entry.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  maxRequests: number; // Maximum requests allowed
  windowMs: number; // Time window in milliseconds
}

/**
 * Rate limiter middleware
 * @param request - Next.js request object
 * @param config - Rate limit configuration
 * @returns null if allowed, NextResponse with error if rate limited
 */
export function rateLimit(
  request: NextRequest,
  config: RateLimitConfig = { maxRequests: 30, windowMs: 60000 } // Default: 30 requests per minute
): NextResponse | null {
  // Get user identifier (cookie or IP)
  const authCookie = request.cookies.get("auth_code")?.value;
  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
  const identifier = authCookie || ip;

  const now = Date.now();
  const entry = rateLimitMap.get(identifier);

  if (!entry || now > entry.resetTime) {
    // First request or window expired, create new entry
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    return null; // Allow request
  }

  if (entry.count >= config.maxRequests) {
    // Rate limit exceeded
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
    return NextResponse.json(
      {
        error: "Too many requests. Please try again later.",
        retryAfter: retryAfter,
      },
      {
        status: 429,
        headers: {
          "Retry-After": retryAfter.toString(),
          "X-RateLimit-Limit": config.maxRequests.toString(),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": new Date(entry.resetTime).toISOString(),
        },
      }
    );
  }

  // Increment counter
  entry.count++;
  return null; // Allow request
}

/**
 * Predefined rate limit configurations for different endpoint types
 */
export const RateLimitPresets = {
  // Strict: For expensive operations (42 API calls)
  STRICT: { maxRequests: 20, windowMs: 60000 }, // 20 per minute
  
  // Standard: For normal API endpoints
  STANDARD: { maxRequests: 30, windowMs: 60000 }, // 30 per minute
  
  // Relaxed: For lightweight operations
  RELAXED: { maxRequests: 60, windowMs: 60000 }, // 60 per minute
  
  // Auth: For authentication endpoints
  AUTH: { maxRequests: 5, windowMs: 60000 }, // 5 per minute
  
  // Write: For write operations (POST, PUT, DELETE)
  WRITE: { maxRequests: 15, windowMs: 60000 }, // 15 per minute
};
