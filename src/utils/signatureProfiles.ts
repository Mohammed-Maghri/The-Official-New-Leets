import { Pool } from "pg";

const globalForSignature = globalThis as typeof globalThis & { signaturePool?: Pool };
export const signaturePool = globalForSignature.signaturePool ?? new Pool({ connectionString: process.env.DATABASE_KEY, max: 3 });
if (process.env.NODE_ENV !== "production") globalForSignature.signaturePool = signaturePool;

export const signatureSchema = `CREATE TABLE IF NOT EXISTS leets.signature_profiles (
  login TEXT PRIMARY KEY,
  granted_by TEXT NOT NULL,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
)`;

// Read separately from cached ranking data so grants and revocations are immediate.
export async function withSignatureProfiles<T extends { login: string }>(users: T[]): Promise<(T & { signatureProfile: boolean })[]> {
  if (!users.length) return [];
  let logins = new Set<string>();
  try {
    const result = await signaturePool.query("SELECT login FROM leets.signature_profiles WHERE login = ANY($1::text[])", [users.map(user => user.login)]);
    logins = new Set(result.rows.map(row => row.login));
  } catch (error) {
    // Existing installations can read profiles before the first admin setup.
    if ((error as { code?: string }).code !== "42P01") throw error;
  }
  return users.map(user => ({ ...user, signatureProfile: logins.has(user.login) }));
}
