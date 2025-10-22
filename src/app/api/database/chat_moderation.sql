-- Create table for storing flagged messages
CREATE TABLE IF NOT EXISTS leets.chat_flagged_messages (
    id SERIAL PRIMARY KEY,
    message_id TEXT NOT NULL UNIQUE,
    message TEXT NOT NULL,
    username TEXT NOT NULL,
    avatar TEXT,
    level NUMERIC,
    campus TEXT,
    blocked BOOLEAN DEFAULT false,
    categories TEXT[], -- Array of matched categories
    matched_terms TEXT[], -- Array of matched bad words/phrases
    severity TEXT CHECK (severity IN ('low', 'medium', 'high')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed BOOLEAN DEFAULT false,
    reviewed_at TIMESTAMP,
    reviewed_by TEXT,
    action_taken TEXT, -- 'none', 'warning', 'ban', 'delete'
    FOREIGN KEY (message_id) REFERENCES leets.chat_messages(message_id) ON DELETE CASCADE
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_flagged_messages_username ON leets.chat_flagged_messages(username);
CREATE INDEX IF NOT EXISTS idx_flagged_messages_severity ON leets.chat_flagged_messages(severity);
CREATE INDEX IF NOT EXISTS idx_flagged_messages_reviewed ON leets.chat_flagged_messages(reviewed);
CREATE INDEX IF NOT EXISTS idx_flagged_messages_created_at ON leets.chat_flagged_messages(created_at DESC);

-- Create function to get flagged message statistics
CREATE OR REPLACE FUNCTION leets.get_flagged_stats()
RETURNS TABLE(
    total_flagged BIGINT,
    high_severity BIGINT,
    medium_severity BIGINT,
    low_severity BIGINT,
    unreviewed BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_flagged,
        COUNT(*) FILTER (WHERE severity = 'high')::BIGINT as high_severity,
        COUNT(*) FILTER (WHERE severity = 'medium')::BIGINT as medium_severity,
        COUNT(*) FILTER (WHERE severity = 'low')::BIGINT as low_severity,
        COUNT(*) FILTER (WHERE reviewed = false)::BIGINT as unreviewed
    FROM leets.chat_flagged_messages;
END;
$$ LANGUAGE plpgsql;

-- Create function to get user offense history
CREATE OR REPLACE FUNCTION leets.get_user_offenses(p_username TEXT)
RETURNS TABLE(
    total_offenses BIGINT,
    high_severity_count BIGINT,
    medium_severity_count BIGINT,
    low_severity_count BIGINT,
    latest_offense TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_offenses,
        COUNT(*) FILTER (WHERE severity = 'high')::BIGINT as high_severity_count,
        COUNT(*) FILTER (WHERE severity = 'medium')::BIGINT as medium_severity_count,
        COUNT(*) FILTER (WHERE severity = 'low')::BIGINT as low_severity_count,
        MAX(created_at) as latest_offense
    FROM leets.chat_flagged_messages
    WHERE username = p_username;
END;
$$ LANGUAGE plpgsql;

-- Auto-cleanup function for old flagged messages (keep for 90 days)
CREATE OR REPLACE FUNCTION leets.cleanup_old_flagged_messages()
RETURNS void AS $$
BEGIN
    DELETE FROM leets.chat_flagged_messages
    WHERE created_at < NOW() - INTERVAL '90 days'
    AND reviewed = true;
END;
$$ LANGUAGE plpgsql;

-- Comment on table
COMMENT ON TABLE leets.chat_flagged_messages IS 'Stores flagged messages for moderation and audit purposes. Messages are kept for 90 days after review.';
