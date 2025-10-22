-- Create chat_reactions table for Discord-style reactions
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

-- Function to get reaction counts for a message
CREATE OR REPLACE FUNCTION leets.get_message_reactions(msg_id TEXT)
RETURNS TABLE(emoji TEXT, count BIGINT, users TEXT[]) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.emoji,
        COUNT(*)::BIGINT as count,
        ARRAY_AGG(r.username) as users
    FROM leets.chat_reactions r
    WHERE r.message_id = msg_id
    GROUP BY r.emoji
    ORDER BY count DESC, emoji;
END;
$$ LANGUAGE plpgsql;
