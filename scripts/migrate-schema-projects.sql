-- Migration: Add schema_projects table for database architect
-- Run: psql $DATABASE_KEY -f scripts/migrate-schema-projects.sql

CREATE TABLE IF NOT EXISTS leets.schema_projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    user_login TEXT,
    nodes JSONB NOT NULL DEFAULT '[]',
    edges JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_schema_projects_user_login ON leets.schema_projects(user_login);
CREATE INDEX IF NOT EXISTS idx_schema_projects_updated_at ON leets.schema_projects(updated_at DESC);
