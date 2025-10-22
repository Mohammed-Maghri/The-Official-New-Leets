-- Run this SQL to set up the reactions system

-- Step 1: Create the reactions table
CREATE TABLE IF NOT EXISTS leets.chat_reactions (
    id SERIAL PRIMARY KEY,
    message_id TEXT NOT NULL,
    username TEXT NOT NULL,
    emoji TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(message_id, username, emoji),
    FOREIGN KEY (message_id) REFERENCES leets.chat_messages(message_id) ON DELETE CASCADE
);

-- Step 2: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chat_reactions_message_id ON leets.chat_reactions(message_id);
CREATE INDEX IF NOT EXISTS idx_chat_reactions_username ON leets.chat_reactions(username);

-- Step 3: Verify the table was created
SELECT 'Reactions table created successfully!' as status;
