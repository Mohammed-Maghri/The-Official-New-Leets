# Rate Limiting System

## Overview
The application uses a custom in-memory rate limiting system to prevent API abuse and protect against 42 API quota exhaustion.

## Implementation


### Backend (`/src/utils/rateLimit.ts`)
- **Storage**: In-memory Map tracking requests per user/IP
- **Cleanup**: Automatic cleanup every 5 minutes
- **Tracking**: Uses auth cookie when available, falls back to IP address
- **Response**: Returns 429 status with friendly message and retry-after time

### Rate Limit Presets
- **STRICT** (20 requests/minute): `/api/who`, `/api/progress`, `/api/peerfinder`, `/api/projects`
- **STANDARD** (30 requests/minute): `/api/notifications/mark-seen`
- **RELAXED** (60 requests/minute): `/api/chat` (GET), `/api/notifications` (GET), `/api/feedback` (GET)
- **AUTH** (5 requests/minute): `/api/auth`
- **WRITE** (15 requests/minute): `/api/chat` (POST), `/api/vip` (POST)
- **CUSTOM** (10 requests/minute): `/api/notifications/create`

## Frontend Integration

### Hook: `useRateLimitHandler`
```typescript
const { rateLimitState, handleRateLimitResponse, closeRateLimitPopup } = useRateLimitHandler();
```

### Usage in API Calls
```typescript
const response = await fetch('/api/endpoint');

// Check for rate limiting
const isRateLimited = await handleRateLimitResponse(response);
if (isRateLimited) {
  setLoading(false);
  return;
}

// Continue with normal flow
if (!response.ok) {
  // Handle other errors
}
```

### Popup Component
```typescript
<RateLimitPopup
  show={rateLimitState.isRateLimited}
  onClose={closeRateLimitPopup}
  retryAfter={rateLimitState.retryAfter}
/>
```

## Protected Pages
- ✅ `/progress` - Progress/leaderboard page
- ✅ `/vip` - VIP admin panel
- ✅ `/peerfinder` - Peer finder page

## Spam Logging
The VIP endpoint includes special spam attempt logging:
- Logs IP address, user agent, timestamp
- Format: `⚠️ [VIP SPAM ATTEMPT]`
- Includes authentication status
- Uses console.warn for visibility

## User Experience
When rate limited, users see:
- Friendly popup message: "Take it easy bro! 😎"
- Countdown timer showing seconds until they can retry
- Backdrop with blur effect
- Auto-closes when countdown reaches zero
- Manual close button available

## Response Format
```json
{
  "error": "Take it easy bro! 😎",
  "message": "You're making too many requests. Please slow down and try again in a moment.",
  "retryAfter": 45,
  "showPopup": true
}
```

## Headers
Rate limit responses include:
- `Retry-After`: Seconds until next allowed request
- Status: `429 Too Many Requests`
