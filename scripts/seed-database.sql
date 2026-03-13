-- Full database seed for Leets platform
-- Run with: psql $DATABASE_KEY -f scripts/seed-database.sql
-- Or: npx ts-node scripts/seed-database.ts

-- 1. Schema and core tables
CREATE SCHEMA IF NOT EXISTS leets;

CREATE TABLE IF NOT EXISTS leets.vip (
    id SERIAL PRIMARY KEY,
    category TEXT DEFAULT NULL,
    login TEXT DEFAULT NULL UNIQUE,
    profile TEXT DEFAULT NULL,
    token TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS leets.feedback (
    id SERIAL PRIMARY KEY,
    user_login TEXT NOT NULL,
    user_email TEXT NOT NULL,
    user_image TEXT DEFAULT '/nopic.jpg',
    campus_id INTEGER DEFAULT 0,
    campus_name TEXT DEFAULT 'Unknown',
    feedback TEXT DEFAULT NULL,
    dislikes TEXT DEFAULT NULL,
    improvements TEXT DEFAULT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    wants_to_contribute BOOLEAN DEFAULT FALSE,
    skills TEXT,
    contribution_area TEXT[],
    badge_awarded BOOLEAN DEFAULT FALSE,
    badge_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    deleted_by TEXT
);

CREATE INDEX IF NOT EXISTS idx_feedback_user_login ON leets.feedback(user_login);
CREATE INDEX IF NOT EXISTS idx_feedback_campus_id ON leets.feedback(campus_id);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON leets.feedback(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_badge_awarded ON leets.feedback(badge_awarded);
CREATE INDEX IF NOT EXISTS idx_feedback_badge_type ON leets.feedback(badge_type);

CREATE TABLE IF NOT EXISTS leets.blocked_logins (
    login TEXT PRIMARY KEY,
    source TEXT NOT NULL CHECK (source IN ('test', 'staff')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS leets.blocked_logins_meta (
    id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    last_refreshed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO leets.blocked_logins_meta (id, last_refreshed_at)
VALUES (1, '1970-01-01'::timestamp)
ON CONFLICT (id) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_blocked_logins_source ON leets.blocked_logins(source);

-- 2. Notifications (public schema)
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info',
    target_type VARCHAR(20) NOT NULL,
    target_user_id INTEGER,
    sender_username VARCHAR(100) DEFAULT 'mmaghri',
    sender_image VARCHAR(500) DEFAULT 'https://cdn.intra.42.fr/users/83b4706433bb90d165a91eafb7c9bb86/large_mmaghri.jpg',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    link VARCHAR(500)
);

CREATE TABLE IF NOT EXISTS user_notification_reads (
    id SERIAL PRIMARY KEY,
    notification_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    seen_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notification FOREIGN KEY (notification_id) REFERENCES notifications(id) ON DELETE CASCADE,
    CONSTRAINT unique_user_notification UNIQUE(notification_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_notifications_target_user ON notifications(target_user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_target_type ON notifications(target_type);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_notification_reads_user ON user_notification_reads(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notification_reads_notification ON user_notification_reads(notification_id);

-- 3. Rate limits (used by rateLimit.ts)
CREATE TABLE IF NOT EXISTS rate_limits (
    identifier VARCHAR(255) PRIMARY KEY,
    count INTEGER NOT NULL,
    reset_time BIGINT NOT NULL,
    block_count INTEGER NOT NULL DEFAULT 0,
    last_block_time BIGINT NOT NULL DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_reset_time ON rate_limits(reset_time);

-- 4. Chat
CREATE TABLE IF NOT EXISTS leets.chat_messages (
    id SERIAL PRIMARY KEY,
    message_id TEXT NOT NULL UNIQUE,
    message TEXT NOT NULL,
    username TEXT NOT NULL,
    avatar TEXT NOT NULL,
    level NUMERIC DEFAULT 0,
    campus TEXT DEFAULT 'Unknown',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON leets.chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_username ON leets.chat_messages(username);

CREATE TABLE IF NOT EXISTS leets.chat_reactions (
    id SERIAL PRIMARY KEY,
    message_id TEXT NOT NULL,
    username TEXT NOT NULL,
    emoji TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(message_id, username, emoji),
    FOREIGN KEY (message_id) REFERENCES leets.chat_messages(message_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_chat_reactions_message_id ON leets.chat_reactions(message_id);
CREATE INDEX IF NOT EXISTS idx_chat_reactions_username ON leets.chat_reactions(username);

CREATE TABLE IF NOT EXISTS leets.chat_flagged_messages (
    id SERIAL PRIMARY KEY,
    message_id TEXT NOT NULL UNIQUE,
    message TEXT NOT NULL,
    username TEXT NOT NULL,
    avatar TEXT,
    level NUMERIC,
    campus TEXT,
    blocked BOOLEAN DEFAULT false,
    categories TEXT[],
    matched_terms TEXT[],
    severity TEXT CHECK (severity IN ('low', 'medium', 'high')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed BOOLEAN DEFAULT false,
    reviewed_at TIMESTAMP,
    reviewed_by TEXT,
    action_taken TEXT,
    FOREIGN KEY (message_id) REFERENCES leets.chat_messages(message_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_flagged_messages_username ON leets.chat_flagged_messages(username);
CREATE INDEX IF NOT EXISTS idx_flagged_messages_severity ON leets.chat_flagged_messages(severity);
CREATE INDEX IF NOT EXISTS idx_flagged_messages_reviewed ON leets.chat_flagged_messages(reviewed);
CREATE INDEX IF NOT EXISTS idx_flagged_messages_created_at ON leets.chat_flagged_messages(created_at DESC);

-- 5. Seed VIP data
INSERT INTO leets.vip (category, login, profile, token)
VALUES ('student', 'mmaghri', '', 'owner')
ON CONFLICT (login) DO UPDATE SET token = 'owner';

INSERT INTO leets.vip (category, login, profile, token)
VALUES ('student', 'asnaji', '', 'owner')
ON CONFLICT (login) DO UPDATE SET token = 'owner';

-- 6. Seed sample notification
INSERT INTO notifications (title, message, type, target_type, sender_username, sender_image, link)
VALUES (
    'Welcome to Leets! 🎉',
    'Welcome to the 1337leets platform. Explore rankings, peer finder, calculator, and more!',
    'success',
    'all',
    'mmaghri',
    'https://cdn.intra.42.fr/users/83b4706433bb90d165a91eafb7c9bb86/large_mmaghri.jpg',
    '/dashboard'
)
ON CONFLICT DO NOTHING;
