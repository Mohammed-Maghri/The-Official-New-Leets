/**
 * Migration: Add canvas_projects table for canvas/whiteboard
 * Run: node scripts/migrate-canvas-projects.js
 */
const { Pool } = require("pg");
const { readFileSync } = require("fs");
const { join } = require("path");

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

async function migrate() {
  const connectionString =
    process.env.DATABASE_KEY || process.env.DATABASE_URL;

  if (!connectionString) {
    console.error("DATABASE_KEY or DATABASE_URL must be set in .env");
    process.exit(1);
  }

  const pool = new Pool({ connectionString });

  try {
    console.log("Running canvas_projects migration...");
    const sqlPath = join(__dirname, "migrate-canvas-projects.sql");
    const sql = readFileSync(sqlPath, "utf-8");
    await pool.query(sql);
    console.log("Migration completed successfully!");
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
