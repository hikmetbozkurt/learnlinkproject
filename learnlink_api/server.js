import app from './app.js';
import { createServer } from 'http';
import { Server } from 'socket.io';
import config from './config/env.js';
import ChatRoom from './models/chatroomModel.js';
import pool from './config/database.js';
import jwt from 'jsonwebtoken';

const httpServer = createServer(app);

// Create Socket.IO instance
export const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket'],
  upgrade: false
});

// Store connected users
const connectedUsers = new Map();

// Socket.IO middleware for authentication
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    next();
  } catch (error) {
    return next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('user_connected', (userId) => {
    if (socket.user && (socket.user.user_id === parseInt(userId) || socket.user.id === parseInt(userId))) {
      connectedUsers.set(userId, socket.id);
      console.log('User registered:', userId);
    }
  });

  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    console.log('User joined room:', roomId);
  });

  socket.on('leave_room', (roomId) => {
    socket.leave(roomId);
    console.log('User left room:', roomId);
  });

  socket.on('send_message', async (data) => {
    const { roomId, message } = data;
    const userId = socket.user.user_id || socket.user.id;

    try {
      console.log('Received message:', { roomId, message, userId });
      
      // Save message to database
      const messageQuery = `
        INSERT INTO messages (chatroom_id, sender_id, content, created_at, updated_at)
        VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING id, content, sender_id, chatroom_id, created_at, updated_at
      `;
      const messageResult = await pool.query(messageQuery, [roomId, userId, message]);
      const savedMessage = messageResult.rows[0];

      // Get sender's name
      const userQuery = 'SELECT name FROM users WHERE user_id = $1';
      const userResult = await pool.query(userQuery, [userId]);
      const senderName = userResult.rows[0].name;

      // Prepare complete message object
      const completeMessage = {
        ...savedMessage,
        sender_name: senderName
      };
      
      console.log('Broadcasting message to room:', roomId);
      console.log('Message data:', completeMessage);
      
      // Broadcast message to room
      io.to(roomId.toString()).emit('receive_message', completeMessage);

      // Get chatroom members for notifications
      const membersQuery = `
        SELECT user_id 
        FROM chatroom_members 
        WHERE chatroom_id = $1 AND user_id != $2
      `;
      const membersResult = await pool.query(membersQuery, [roomId, userId]);
      
      // Get chatroom name
      const chatroomQuery = 'SELECT name FROM chatrooms WHERE id = $1';
      const chatroomResult = await pool.query(chatroomQuery, [roomId]);
      const chatroomName = chatroomResult.rows[0].name;

      // Create notifications for all members except sender
      for (const member of membersResult.rows) {
        const notificationQuery = `
          INSERT INTO notifications (
            sender_id,
            recipient_id,
            content,
            type,
            reference_id,
            read,
            created_at,
            updated_at
          )
          VALUES ($1, $2, $3, $4, $5, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          RETURNING *
        `;
        
        const notificationValues = [
          userId,
          member.user_id,
          message,
          'chat_message',
          savedMessage.id
        ];
        
        await pool.query(notificationQuery, notificationValues);
        
        // Send real-time notification if recipient is online
        const recipientSocketId = connectedUsers.get(member.user_id.toString());
        if (recipientSocketId) {
          io.to(recipientSocketId).emit('new_notification', {
            sender_name: senderName,
            chatroom_name: chatroomName,
            content: message,
            chatroom_id: roomId
          });
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  socket.on('disconnect', () => {
    // Remove user from connected users
    for (const [userId, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        connectedUsers.delete(userId);
        break;
      }
    }
    console.log('User disconnected:', socket.id);
  });
});

const PORT = config.PORT || 5001;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default httpServer;