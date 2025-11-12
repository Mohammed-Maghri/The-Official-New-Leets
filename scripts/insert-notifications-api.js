/**
 * Script to insert initial notifications via API
 * Run with: node scripts/insert-notifications-api.js
 * 
 * Make sure you're logged in as admin and the server is running
 */

const notifications = [
  {
    title: "New Features Added! 🎉",
    message: "We've added Peer Finder to connect with your classmates, XP Calculator for level tracking, and a search bar on the Progress page - all based on your suggestions!",
    type: "success",
    target_type: "all",
    link: "/peerfinder"
  },
  // For feedback badge notifications, you'll need to run this with specific user IDs
  // Example for specific user:
  // {
  //   title: "Feedback Badge Awarded! 🏆",
  //   message: "Thank you for your valuable feedback! Check your inbox - you've earned a special badge for your contribution to improving the platform.",
  //   type: "success",
  //   target_type: "specific",
  //   target_user_id: 12345, // Replace with actual user ID
  //   link: "/dashboard"
  // }
];

async function insertNotifications() {
  const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
  
  console.log('📢 Inserting notifications...\n');

  for (const notification of notifications) {
    try {
      const response = await fetch(`${BASE_URL}/api/notifications/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(notification)
      });

      const data = await response.json();

      if (response.ok) {
        console.log(`✅ Created: "${notification.title}"`);
      } else {
        console.error(`❌ Failed: "${notification.title}"`, data.error);
      }
    } catch (error) {
      console.error(`❌ Error creating "${notification.title}":`, error.message);
    }
  }

  console.log('\n✨ Done!');
}

insertNotifications();
