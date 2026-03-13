/**
 * Seed the database with schema and initial data.
 * Run: npx tsx scripts/seed-database.ts
 * Or: npm run seed
 */
import { Pool } from "pg";
import { readFileSync } from "fs";
import { join } from "path";

// Load .env
try {
  const envPath = join(process.cwd(), ".env");
  const env = readFileSync(envPath, "utf-8");
  for (const line of env.split("\n")) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, "");
      process.env[key] = value;
    }
  }
} catch {
  /* .env may not exist */
}

async function seed() {
  const connectionString =
    process.env.DATABASE_KEY || process.env.DATABASE_URL;

  if (!connectionString) {
    console.error("DATABASE_KEY or DATABASE_URL must be set in .env");
    process.exit(1);
  }

  const pool = new Pool({ connectionString });

  try {
    console.log("Connecting to database...");
    const client = await pool.connect();
    console.log("Connected. Running seed...");

    const sqlPath = join(__dirname, "seed-database.sql");
    const sql = readFileSync(sqlPath, "utf-8");

    await client.query(sql);
    console.log("Seed completed successfully!");

    client.release();
  } catch (err) {
    console.error("Seed failed:", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seed();
