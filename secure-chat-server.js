// secure-chat-server.js
require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const CryptoJS = require('crypto-js');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "https://www.1337leets.com"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Store messages (in production, use a database)
const messages = [];
const MESSAGE_RETENTION = 24 * 60 * 60 * 1000; // 24 hours

// Clean up old messages
setInterval(() => {
  const now = Date.now();
  const before = messages.length;
  messages.splice(0, messages.length, ...messages.filter(msg => {
    const messageTime = new Date(msg.timestamp).getTime();
    return (now - messageTime) < MESSAGE_RETENTION;
  }));
  const after = messages.length;
  if (before !== after) {
    console.log(`Cleaned ${before - after} old messages. ${after} messages remaining.`);
  }
}, 60 * 60 * 1000); // Run every hour

// Decrypt function (must match your auth system)
function decryptToken(encryptedToken) {
  try {
    return CryptoJS.AES.decrypt(encryptedToken, process.env.SECRET_KEY).toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
}

// Verify and fetch user data from token
async function verifyToken(token) {
  try {
    // Decode JWT (without verification since we're verifying the 42 API token)
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.token) {
      console.log('Invalid JWT structure');
      return null;
    }
    
    // Decrypt the 42 API access token
    const accessToken = decryptToken(decoded.token);
    if (!accessToken) {
      console.log('Failed to decrypt access token');
      return null;
    }
    
    // Fetch user data from 42 API
    const response = await fetch('https://api.intra.42.fr/v2/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (!response.ok) {
      console.log('42 API request failed:', response.status);
      return null;
    }
    
    const userData = await response.json();
    
    return {
      login: userData.login,
      avatar: userData.image?.versions?.large || '/nopic.jpg',
      level: userData.cursus_users?.[1]?.level || 0,
      campus: userData.campus?.[0]?.name || 'Unknown',
      email: userData.email
    };
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return null;
  }
}

// Middleware to authenticate socket connections
io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;
  
  if (!token) {
    console.log('Connection rejected: No token provided');
    return next(new Error('Authentication required'));
  }
  
  const userData = await verifyToken(token);
  
  if (!userData) {
    console.log('Connection rejected: Invalid token');
    return next(new Error('Invalid or expired token'));
  }
  
  // Attach verified user data to socket
  socket.userData = userData;
  next();
});

// Handle socket connections
io.on('connection', (socket) => {
  console.log(`✅ User connected: ${socket.userData.login} (${socket.id})`);

  // Send message history to new user
  socket.emit('messageHistory', messages);

  // Handle incoming messages
  socket.on('sendMessage', (messageData) => {
    try {
      // Validate message data
      if (!messageData || !messageData.text || typeof messageData.text !== 'string') {
        console.log('Invalid message data from', socket.userData.login);
        return;
      }
      
      const text = messageData.text.trim();
      
      // Validate message length
      if (text.length === 0) {
        console.log('Empty message from', socket.userData.login);
        return;
      }
      
      if (text.length > 1000) {
        console.log('Message too long from', socket.userData.login);
        socket.emit('error', { message: 'Message too long (max 1000 characters)' });
        return;
      }
      
      // Create message with verified user data from token (not from client!)
      const message = {
        id: Date.now() + Math.random(), // Use UUID in production
        text: text,
        sender: socket.userData.login,      // From verified token
        avatar: socket.userData.avatar,     // From verified token
        level: socket.userData.level,       // From verified token
        campus: socket.userData.campus,     // From verified token
        timestamp: new Date().toISOString(),
      };
      
      // Store message
      messages.push(message);
      
      // Broadcast to all connected clients
      io.emit('message', message);
      
      console.log(`📨 Message from ${socket.userData.login}: ${text.substring(0, 50)}${text.length > 50 ? '...' : ''}`);
    } catch (error) {
      console.error('Error handling message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  socket.on('disconnect', () => {
    console.log(`❌ User disconnected: ${socket.userData.login} (${socket.id})`);
  });

  socket.on('error', (error) => {
    console.error(`Socket error for ${socket.userData.login}:`, error);
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    connections: io.engine.clientsCount,
    messages: messages.length,
    uptime: process.uptime()
  });
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║  🚀 Socket.IO Chat Server Running     ║
║  📡 Port: ${PORT}                        ║
║  🔒 Secure: JWT Authentication         ║
║  ⏰ Message Retention: 24 hours        ║
╚════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, closing server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
