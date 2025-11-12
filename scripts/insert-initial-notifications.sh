#!/bin/bash

# Script to insert initial notifications
# Run this after setting up the database

echo "📢 Inserting notifications..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL environment variable is not set"
    exit 1
fi

# Run the SQL script
psql "$DATABASE_URL" -f scripts/insert-notifications.sql

if [ $? -eq 0 ]; then
    echo "✅ Notifications inserted successfully!"
    echo ""
    echo "Notifications added:"
    echo "1. 🎉 New Features announcement (all users)"
    echo "2. 🏆 Feedback badges (specific users who submitted feedback)"
else
    echo "❌ Failed to insert notifications"
    exit 1
fi
