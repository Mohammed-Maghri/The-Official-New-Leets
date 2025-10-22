#!/bin/bash

# Chat Database Setup Script
# This script creates the chat_messages table in your PostgreSQL database

echo "🚀 Setting up Chat Messages Database..."

# Load DATABASE_KEY from .env file
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
else
    echo "❌ Error: .env file not found"
    exit 1
fi

if [ -z "$DATABASE_KEY" ]; then
    echo "❌ Error: DATABASE_KEY not found in .env"
    exit 1
fi

echo "📦 DATABASE_KEY found"
echo "🔧 Executing SQL script..."

# Execute the SQL script
psql "$DATABASE_KEY" -f src/app/api/database/chat.sql

if [ $? -eq 0 ]; then
    echo "✅ Chat messages table created successfully!"
    echo ""
    echo "📊 Verifying table creation..."
    psql "$DATABASE_KEY" -c "SELECT COUNT(*) as message_count FROM leets.chat_messages;"
    echo ""
    echo "🎉 Setup complete! Your chat database is ready."
else
    echo "❌ Error: Failed to execute SQL script"
    exit 1
fi
