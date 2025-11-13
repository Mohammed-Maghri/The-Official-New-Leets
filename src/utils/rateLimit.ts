import { NextRequest, NextResponse } from "next/server";

interface RateLimitEntry {
  count: number;
  resetTime: number;
  blockCount: number; // Track how many times user has been blocked
  lastBlockTime: number; // When they were last blocked
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
    // Reset block count if enough time has passed (1 hour)
    const existingBlockCount = entry && (now - entry.lastBlockTime) < 3600000 ? entry.blockCount : 0;
    
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + config.windowMs,
      blockCount: existingBlockCount,
      lastBlockTime: entry?.lastBlockTime || 0,
    });
    return null; // Allow request
  }

  if (entry.count >= config.maxRequests) {
    // Rate limit exceeded - apply escalating block times
    const newBlockCount = entry.blockCount + 1;
    
    // Progressive block durations: 2min -> 5min -> 10min
    let blockDuration: number;
    let blockMessage: string;
    
    if (newBlockCount === 1) {
      blockDuration = 2 * 60; // 2 minutes
      blockMessage = "First warning! Please wait 2 minutes.";
    } else if (newBlockCount === 2) {
      blockDuration = 5 * 60; // 5 minutes
      blockMessage = "Second warning! Please wait 5 minutes.";
    } else {
      blockDuration = 10 * 60; // 10 minutes
      blockMessage = "Final warning! Please wait 10 minutes.";
    }
    
    // Update entry with new block count
    entry.blockCount = newBlockCount;
    entry.lastBlockTime = now;
    entry.resetTime = now + (blockDuration * 1000);
    
    return NextResponse.json(
      {
        error: "Take it easy bro! 😎",
        message: blockMessage,
        retryAfter: blockDuration,
        showPopup: true,
        blockCount: newBlockCount,
      },
      {
        status: 429,
        headers: {
          "Retry-After": blockDuration.toString(),
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
  STRICT: { maxRequests: 10, windowMs: 60000 }, // 10 per minute
  
  // Standard: For normal API endpoints
  STANDARD: { maxRequests: 10, windowMs: 60000 }, // 10 per minute
  
  // Relaxed: For lightweight operations
  RELAXED: { maxRequests: 10, windowMs: 60000 }, // 10 per minute
  
  // Auth: For authentication endpoints
  AUTH: { maxRequests: 10, windowMs: 60000 }, // 10 per minute
  
  // Write: For write operations (POST, PUT, DELETE)
  WRITE: { maxRequests: 10, windowMs: 60000 }, // 10 per minute
};
