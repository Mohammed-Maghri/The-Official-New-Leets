-- Add sender columns to existing notifications table if not already present
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS sender_username VARCHAR(100) DEFAULT 'mmaghri',
ADD COLUMN IF NOT EXISTS sender_image VARCHAR(500) DEFAULT 'https://cdn.intra.42.fr/users/83b4706433bb90d165a91eafb7c9bb86/large_mmaghri.jpg';

-- Insert notification about new features (Peer Finder, Calculator, Search)
INSERT INTO notifications (
    title, 
    message, 
    type, 
    target_type,
    sender_username,
    sender_image,
    link
) VALUES (
    'New Features Added! 🎉',
    'We''ve added Peer Finder to connect with your classmates, XP Calculator for level tracking, and a search bar on the Progress page - all based on your suggestions!',
    'success',
    'all',
    'mmaghri',
    'https://cdn.intra.42.fr/users/83b4706433bb90d165a91eafb7c9bb86/large_mmaghri.jpg',
    '/peerfinder'
);

-- Note: The following query will insert notifications for users who have submitted feedback
-- It targets users from the feedback table who have submissions
-- This assumes you have a feedback table with user_id column
-- Uncomment and run this when the feedback table exists:

/*
INSERT INTO notifications (
    title, 
    message, 
    type, 
    target_type,
    target_user_id,
    sender_username,
    sender_image,
    link
)
SELECT DISTINCT
    'Feedback Badge Awarded! 🏆',
    'Thank you for your valuable feedback! Check your inbox - you''ve earned a special badge for your contribution to improving the platform.',
    'success',
    'specific',
    user_id,
    'mmaghri',
    'https://cdn.intra.42.fr/users/83b4706433bb90d165a91eafb7c9bb86/large_mmaghri.jpg',
    '/dashboard'
FROM feedback
WHERE created_at >= NOW() - INTERVAL '30 days'
AND user_id IS NOT NULL;
*/

-- Verify inserted notifications
SELECT 
    id,
    title,
    message,
    type,
    target_type,
    sender_username,
    created_at
FROM notifications
ORDER BY created_at DESC
LIMIT 10;
