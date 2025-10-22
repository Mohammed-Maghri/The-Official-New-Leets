#!/bin/bash

echo "🔄 Restarting Next.js dev server..."
echo ""

# Kill any existing Next.js processes
echo "🛑 Stopping existing server..."
pkill -f "next dev" 2>/dev/null || echo "   No running server found"

# Wait a moment
sleep 2

# Clear terminal
clear

echo "✅ Server stopped"
echo ""
echo "🚀 Starting fresh server..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Start dev server
npm run dev
