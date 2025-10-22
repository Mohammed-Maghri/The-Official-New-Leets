#!/bin/bash

echo "🔍 Socket.IO Diagnostic Test"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if server is running
echo "1️⃣ Checking if Next.js server is running..."
if pgrep -f "next dev" > /dev/null; then
    echo "   ✅ Server is running (PID: $(pgrep -f "next dev" | head -1))"
else
    echo "   ❌ Server is NOT running!"
    echo "   Run: npm run dev"
    exit 1
fi
echo ""

# Check if Socket.IO endpoint responds
echo "2️⃣ Testing Socket.IO endpoint..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/socket)
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "400" ]; then
    echo "   ✅ Socket.IO endpoint responding (HTTP $HTTP_CODE)"
else
    echo "   ❌ Socket.IO endpoint not responding (HTTP $HTTP_CODE)"
fi
echo ""

# Check if auth endpoint works
echo "3️⃣ Testing auth verification endpoint..."
AUTH_CODE=$(curl -s -w "%{http_code}" http://localhost:3000/api/auth/verify)
if echo "$AUTH_CODE" | grep -q "200"; then
    echo "   ✅ Auth endpoint working"
elif echo "$AUTH_CODE" | grep -q "401"; then
    echo "   ⚠️  Auth endpoint working but not logged in (expected)"
else
    echo "   ❌ Auth endpoint error"
fi
echo ""

# Check for next.config.ts
echo "4️⃣ Checking next.config.ts..."
if grep -q "webpack" next.config.ts; then
    echo "   ✅ Webpack config found in next.config.ts"
else
    echo "   ❌ Webpack config missing in next.config.ts"
    echo "   This might cause Socket.IO issues!"
fi
echo ""

# Check for socket.io packages
echo "5️⃣ Checking Socket.IO packages..."
if npm list socket.io > /dev/null 2>&1; then
    echo "   ✅ socket.io installed"
else
    echo "   ❌ socket.io NOT installed!"
fi

if npm list socket.io-client > /dev/null 2>&1; then
    echo "   ✅ socket.io-client installed"
else
    echo "   ❌ socket.io-client NOT installed!"
fi
echo ""

# Check if .next directory exists (build)
echo "6️⃣ Checking build status..."
if [ -d ".next" ]; then
    echo "   ✅ .next directory exists"
    BUILD_TIME=$(stat -c %y .next 2>/dev/null || stat -f "%Sm" .next 2>/dev/null)
    echo "   Last built: $BUILD_TIME"
else
    echo "   ❌ .next directory missing (not built)"
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Recommendations:"
echo ""

if ! grep -q "webpack" next.config.ts; then
    echo "⚠️  CRITICAL: Webpack config missing!"
    echo "   → This will cause Socket.IO event handling to fail"
    echo ""
fi

echo "🔄 To fix Socket.IO issues, restart the server:"
echo "   1. Press Ctrl+C in the terminal running npm run dev"
echo "   2. Run: npm run dev"
echo "   3. Or use: ./restart-server.sh"
echo ""
echo "After restart:"
echo "   • Go to http://localhost:3000/chat"
echo "   • Send a message"
echo "   • Check server terminal for: 📩 Received sendMessage event"
