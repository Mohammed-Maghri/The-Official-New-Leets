#!/bin/bash

echo "🔍 Socket.IO Connection Diagnostic"
echo "=================================="
echo ""

# Check if socket files exist
echo "1️⃣ Checking Socket.IO files..."
if [ -f "pages/api/socket.ts" ]; then
    echo "   ✅ pages/api/socket.ts exists"
else
    echo "   ❌ pages/api/socket.ts MISSING!"
fi

if [ -f "pages/api/socket.types.ts" ]; then
    echo "   ✅ pages/api/socket.types.ts exists"
else
    echo "   ❌ pages/api/socket.types.ts MISSING!"
fi

echo ""

# Check if dev server is running
echo "2️⃣ Checking if dev server is running..."
if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "   ✅ Server running on port 3001"
elif lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "   ✅ Server running on port 3000"
else
    echo "   ❌ No server running on port 3000 or 3001"
    echo "   Run: npm run dev"
fi

echo ""

# Check database connection
echo "3️⃣ Checking database..."
if [ -f ".env" ]; then
    if grep -q "DATABASE_KEY" .env; then
        echo "   ✅ DATABASE_KEY found in .env"
    else
        echo "   ❌ DATABASE_KEY missing in .env"
    fi
else
    echo "   ❌ .env file not found"
fi

echo ""

# Check if chat table exists
echo "4️⃣ Checking chat_messages table..."
export $(grep -v '^#' .env | xargs)
RESULT=$(psql "$DATABASE_KEY" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'leets' AND table_name = 'chat_messages';" 2>/dev/null)

if [ "$RESULT" = " 1" ]; then
    echo "   ✅ chat_messages table exists"
    MSG_COUNT=$(psql "$DATABASE_KEY" -t -c "SELECT COUNT(*) FROM leets.chat_messages;" 2>/dev/null | xargs)
    echo "   📊 Messages in database: $MSG_COUNT"
else
    echo "   ❌ chat_messages table MISSING!"
    echo "   Run: ./setup-chat-db.sh"
fi

echo ""

# Check socket.io packages
echo "5️⃣ Checking npm packages..."
if [ -d "node_modules/socket.io" ]; then
    echo "   ✅ socket.io installed"
else
    echo "   ❌ socket.io NOT installed"
    echo "   Run: npm install socket.io"
fi

if [ -d "node_modules/socket.io-client" ]; then
    echo "   ✅ socket.io-client installed"
else
    echo "   ❌ socket.io-client NOT installed"
    echo "   Run: npm install socket.io-client"
fi

echo ""
echo "=================================="
echo "🎯 Quick Fixes:"
echo ""
echo "If server not running:"
echo "  npm run dev"
echo ""
echo "If table missing:"
echo "  ./setup-chat-db.sh"
echo ""
echo "If packages missing:"
echo "  npm install socket.io socket.io-client"
echo ""
echo "To test Socket.IO manually:"
echo "  curl http://localhost:3001/api/socket"
echo ""
echo "=================================="
