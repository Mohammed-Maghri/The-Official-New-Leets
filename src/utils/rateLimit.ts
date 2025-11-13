import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

interface RateLimitEntry {
  count: number;
  resetTime: number;
  blockCount: number; // Track how many times user has been blocked
  lastBlockTime: number; // When they were last blocked
}

// PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_KEY || process.env.DATABASE_URL,
});

// Initialize rate limit table
const initTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS rate_limits (
        identifier VARCHAR(255) PRIMARY KEY,
        count INTEGER NOT NULL,
        reset_time BIGINT NOT NULL,
        block_count INTEGER NOT NULL DEFAULT 0,
        last_block_time BIGINT NOT NULL DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create index for faster cleanup
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_rate_limits_reset_time 
      ON rate_limits(reset_time)
    `);
  } catch (error) {
    console.error("Failed to initialize rate_limits table:", error);
  }
};

initTable();

// Clean up old entries every 5 minutes
setInterval(async () => {
  const now = Date.now();
  try {
    await pool.query('DELETE FROM rate_limits WHERE reset_time < $1', [now]);
  } catch (error) {
    console.error("Rate limit cleanup error:", error);
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
export async function rateLimit(
  request: NextRequest,
  config: RateLimitConfig = { maxRequests: 30, windowMs: 60000 } // Default: 30 requests per minute
): Promise<NextResponse | null> {
  // Get user identifier - use username from JWT token to prevent bypass by logout
  let identifier: string;
  
  try {
    const authCookie = request.cookies.get("auth_code")?.value;
    if (authCookie) {
      const jose = await import("jose");
      const decodedToken = jose.decodeJwt(authCookie);
      // Use username from token if available
      identifier = (decodedToken.login as string) || (decodedToken.sub as string) || "unknown";
    } else {
      // Fall back to IP if not logged in
      const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
      identifier = `ip:${ip}`;
    }
  } catch {
    // If token decode fails, use IP
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    identifier = `ip:${ip}`;
  }

  const now = Date.now();
  
  // Get entry from database
  let entry: RateLimitEntry | null = null;
  try {
    const result = await pool.query(
      'SELECT count, reset_time, block_count, last_block_time FROM rate_limits WHERE identifier = $1',
      [identifier]
    );
    
    if (result.rows.length > 0) {
      entry = {
        count: result.rows[0].count,
        resetTime: parseInt(result.rows[0].reset_time),
        blockCount: result.rows[0].block_count,
        lastBlockTime: parseInt(result.rows[0].last_block_time),
      };
    }
  } catch (error) {
    console.error("Rate limit DB read error:", error);
    // Allow request if DB fails (fail open for availability)
    return null;
  }

  // Check if user is currently blocked (has been rate limited before)
  if (entry && entry.blockCount > 0 && now < entry.resetTime) {
    // User is still in blocked state - reject immediately
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
    let blockMessage: string;
    
    if (entry.blockCount === 1) {
      blockMessage = "First warning! Please wait 2 minutes.";
    } else if (entry.blockCount === 2) {
      blockMessage = "Second warning! Please wait 5 minutes.";
    } else {
      blockMessage = "Final warning! Please wait 10 minutes.";
    }
    
    return NextResponse.json(
      {
        error: "Take it easy bro! 😎",
        message: blockMessage,
        retryAfter: retryAfter,
        showPopup: true,
        blockCount: entry.blockCount,
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

  if (!entry || now > entry.resetTime) {
    // First request or window expired, create new entry
    // Reset block count if enough time has passed (1 hour)
    const existingBlockCount = entry && (now - entry.lastBlockTime) < 3600000 ? entry.blockCount : 0;
    
    try {
      await pool.query(
        `INSERT INTO rate_limits (identifier, count, reset_time, block_count, last_block_time)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (identifier) 
         DO UPDATE SET count = $2, reset_time = $3, block_count = $4, last_block_time = $5, updated_at = CURRENT_TIMESTAMP`,
        [identifier, 1, now + config.windowMs, existingBlockCount, entry?.lastBlockTime || 0]
      );
    } catch (error) {
      console.error("Rate limit DB write error:", error);
    }
    
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
    
    // Update entry with new block count in database
    const newResetTime = now + (blockDuration * 1000);
    try {
      await pool.query(
        `INSERT INTO rate_limits (identifier, count, reset_time, block_count, last_block_time)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (identifier) 
         DO UPDATE SET count = $2, reset_time = $3, block_count = $4, last_block_time = $5, updated_at = CURRENT_TIMESTAMP`,
        [identifier, entry.count, newResetTime, newBlockCount, now]
      );
    } catch (error) {
      console.error("Rate limit DB update error:", error);
    }
    
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
          "X-RateLimit-Reset": new Date(newResetTime).toISOString(),
        },
      }
    );
  }

  // Increment counter in database
  try {
    await pool.query(
      'UPDATE rate_limits SET count = count + 1, updated_at = CURRENT_TIMESTAMP WHERE identifier = $1',
      [identifier]
    );
  } catch (error) {
    console.error("Rate limit DB increment error:", error);
  }
  
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
