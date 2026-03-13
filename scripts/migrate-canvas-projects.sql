-- Migration: Add canvas_projects table for canvas/whiteboard
-- Run: psql $DATABASE_KEY -f scripts/migrate-canvas-projects.sql

CREATE TABLE IF NOT EXISTS leets.canvas_projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    user_login TEXT,
    image_data TEXT,
    board_mode VARCHAR(10) DEFAULT 'black',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_canvas_projects_user_login ON leets.canvas_projects(user_login);
CREATE INDEX IF NOT EXISTS idx_canvas_projects_updated_at ON leets.canvas_projects(updated_at DESC);
