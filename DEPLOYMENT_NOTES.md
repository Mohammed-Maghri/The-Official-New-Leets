# Deployment Notes - Database Leak Fix

## Issues Fixed
✅ Database connection pool exhaustion in `/api/slots` endpoint
✅ Database connection pool exhaustion in `/api/vip` endpoint (POST, GET, DELETE)
✅ Improved error handling in `/api/who` endpoint

## Files Modified
1. `src/app/api/slots/route.ts` - Fixed pool leak, added proper cleanup
2. `src/app/api/vip/route.ts` - Fixed pool leaks in all three HTTP methods
3. `src/app/api/who/route.ts` - Enhanced error handling and validation

## What Was Wrong

Your endpoints were creating new PostgreSQL connection pools on every request but never closing them. This is like opening doors and never closing them - eventually you run out of doors!

**Before:**
```typescript
const client = new Pool({ ... });
const connection = await client.connect();
// ... do stuff ...
connection.release(); // ❌ Only releases connection, pool still open!
// Pool never closed → LEAK!
```

**After:**
```typescript
let client: Pool | null = null;
try {
  client = new Pool({ ... });
  // ... do stuff ...
} finally {
  if (client) {
    await client.end(); // ✅ Properly closes the pool!
  }
}
```

## Before Deploying

The code is fixed and ready to deploy. After deployment:

1. **Monitor database connections:**
   ```sql
   SELECT count(*) FROM pg_stat_activity WHERE datname = 'your_db_name';
   ```
   This should stay stable (around 1-5 connections) instead of growing.

2. **Check server logs** for any errors during the first few hours

3. **Test the endpoints:**
   - `GET /api/who` - Should return user data
   - `GET /api/slots?campus=16&page=1` - Should return team slots
   - Both should work without 500 errors now

## Why It Was Causing 500 Errors

PostgreSQL has a maximum connection limit (usually 100 connections). Once all connections were exhausted:
- New requests couldn't connect to the database
- Server returned 500 Internal Server Error
- App became unusable until connections timed out or server restarted

## Long-term Recommendation

Consider creating a shared pool instance instead of creating new pools per request:

```typescript
// lib/db.ts
import { Pool } from 'pg';

let pool: Pool | null = null;

export function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_KEY,
      max: 20, // Maximum connections in pool
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }
  return pool;
}
```

Then in your routes:
```typescript
const pool = getPool();
const connection = await pool.connect();
try {
  // ... use connection ...
} finally {
  connection.release(); // Just release, pool stays alive
}
```

This is more efficient and prevents leaks by design.

## Questions?

If you see any issues after deployment, check:
1. Database connection count
2. Server error logs
3. Environment variables are set correctly

All fixed code is backward compatible and ready to deploy! 🚀
