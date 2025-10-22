-- Create chat_messages table
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

-- Create index on created_at for faster queries
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON leets.chat_messages(created_at DESC);

-- Create index on username for faster filtering
CREATE INDEX IF NOT EXISTS idx_chat_messages_username ON leets.chat_messages(username);

-- Optional: Add a function to auto-delete messages older than 24 hours
CREATE OR REPLACE FUNCTION leets.cleanup_old_messages()
RETURNS void AS $$
BEGIN
    DELETE FROM leets.chat_messages
    WHERE created_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- Optional: Create a scheduled job to run cleanup (requires pg_cron extension)
-- SELECT cron.schedule('cleanup-old-chat-messages', '0 * * * *', 'SELECT leets.cleanup_old_messages()');
