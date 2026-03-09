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

INSERT INTO
    leets.vip (
        category,
        login,
        profile,
        token
    )
VALUES (
        'student',
        'mmaghri',
        '',
        'owner'
    );

INSERT INTO
    leets.vip (
        category,
        login,
        profile,
        token
    )
VALUES (
        'student',
        'mmaghri',
        '',
        'creator'
    ) ON CONFLICT (login) DO UPDATE SET token = 'creator';

INSERT INTO
    leets.vip (
        category,
        login,
        profile,
        token
    )
VALUES (
        'student',
        'asnaji',
        '',
        'owner'
    );

-- Feedback Table
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
);

-- Index for faster queries by user and campus
CREATE INDEX IF NOT EXISTS idx_feedback_user_login ON leets.feedback(user_login);
CREATE INDEX IF NOT EXISTS idx_feedback_campus_id ON leets.feedback(campus_id);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON leets.feedback(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_badge_awarded ON leets.feedback(badge_awarded);
CREATE INDEX IF NOT EXISTS idx_feedback_badge_type ON leets.feedback(badge_type);

-- Blocked logins (test/staff accounts) - cached from 42 API, refreshed monthly
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