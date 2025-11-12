-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info', -- info, success, warning, error
    target_type VARCHAR(20) NOT NULL, -- 'all' or 'specific'
    target_user_id INTEGER, -- NULL if target_type is 'all', otherwise specific user ID (42 user ID)
    sender_username VARCHAR(100) DEFAULT 'mmaghri', -- Username of sender
    sender_image VARCHAR(500) DEFAULT 'https://cdn.intra.42.fr/users/83b4706433bb90d165a91eafb7c9bb86/large_mmaghri.jpg', -- Profile picture URL
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP, -- Optional expiration date for the notification
    link VARCHAR(500) -- Optional link to redirect when notification is clicked
);

-- User Notifications Read Status Table
CREATE TABLE IF NOT EXISTS user_notification_reads (
    id SERIAL PRIMARY KEY,
    notification_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL, -- 42 user ID
    seen_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_notification FOREIGN KEY (notification_id) 
        REFERENCES notifications(id) ON DELETE CASCADE,
    CONSTRAINT unique_user_notification UNIQUE(notification_id, user_id)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_target_user ON notifications(target_user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_target_type ON notifications(target_type);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_notification_reads_user ON user_notification_reads(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notification_reads_notification ON user_notification_reads(notification_id);

-- Example data
-- INSERT INTO notifications (title, message, type, target_type) 
-- VALUES ('Welcome!', 'Welcome to 1337leets platform', 'success', 'all');
