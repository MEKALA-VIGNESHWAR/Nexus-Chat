/**
 * Socket.IO Presence Event Handler
 * Manages user online/offline broadcasts and typing indicators.
 * Uses a memory cache to map active user connections.
 */
const User = require('../models/User');
const { SOCKET_EVENTS } = require('../utils/constants');
const logger = require('../utils/logger');

// Global in-memory map tracking connected users and their socket IDs
// Key: userId, Value: Set of socketIds (handles multiple active devices/tabs)
const activeConnections = new Map();

/**
 * Register presence socket event handlers.
 * @param {import('socket.io').Server} io
 * @param {import('socket.io').Socket} socket
 */
function registerPresenceHandlers(io, socket) {
  const userId = socket.userId;
  const username = socket.user.username;

  // Add current socket connection to tracker
  if (!activeConnections.has(userId)) {
    activeConnections.set(userId, new Set());
  }
  activeConnections.get(userId).add(socket.id);

  // Trigger online sync on connection if first socket for this user
  if (activeConnections.get(userId).size === 1) {
    handleUserOnline(io, userId, username);
  }

  // Send list of online users to the newly connected user
  socket.emit(SOCKET_EVENTS.USERS_STATUS, getOnlineUsersList());

  /**
   * Client sends typing indicator.
   */
  socket.on(SOCKET_EVENTS.TYPING, (data) => {
    const { roomId } = data;
    if (!roomId) return;
    
    // Broadcast typing signal to other users in room
    socket.to(roomId).emit(SOCKET_EVENTS.TYPING, {
      roomId,
      userId,
      username,
    });
  });

  /**
   * Client stops typing.
   */
  socket.on(SOCKET_EVENTS.STOP_TYPING, (data) => {
    const { roomId } = data;
    if (!roomId) return;

    socket.to(roomId).emit(SOCKET_EVENTS.STOP_TYPING, {
      roomId,
      userId,
    });
  });

  /**
   * Connection disconnect cleanup.
   */
  socket.on(SOCKET_EVENTS.DISCONNECT, () => {
    const userSockets = activeConnections.get(userId);
    
    if (userSockets) {
      userSockets.delete(socket.id);
      
      // If user has no active socket connections left, mark offline
      if (userSockets.size === 0) {
        activeConnections.delete(userId);
        handleUserOffline(io, userId, username);
      }
    }
  });
}

/**
 * Update user status to online in database and broadcast event.
 */
async function handleUserOnline(io, userId, username) {
  try {
    await User.findByIdAndUpdate(userId, {
      'status.online': true,
      'status.lastSeen': new Date(),
    });

    io.emit(SOCKET_EVENTS.USER_ONLINE, {
      userId,
      username,
      online: true,
    });
    
    logger.debug(`Presence: User ${username} is online`);
  } catch (error) {
    logger.error('Error handling user online status', { error: error.message, userId });
  }
}

/**
 * Update user status to offline in database and broadcast event.
 */
async function handleUserOffline(io, userId, username) {
  try {
    const lastSeen = new Date();
    await User.findByIdAndUpdate(userId, {
      'status.online': false,
      'status.lastSeen': lastSeen,
    });

    io.emit(SOCKET_EVENTS.USER_OFFLINE, {
      userId,
      username,
      online: false,
      lastSeen,
    });

    logger.debug(`Presence: User ${username} went offline`);
  } catch (error) {
    logger.error('Error handling user offline status', { error: error.message, userId });
  }
}

/**
 * Returns a list of all user IDs that are currently online.
 * @returns {string[]}
 */
function getOnlineUsersList() {
  return Array.from(activeConnections.keys());
}

module.exports = {
  registerPresenceHandlers,
  activeConnections,
};
