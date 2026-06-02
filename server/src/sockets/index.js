/**
 * Socket.IO Bootstrap Configuration
 * Binds Socket.IO server, runs JWT handshakes, and hooks up feature-specific routing.
 */
const { Server } = require('socket.io');
const socketAuthenticate = require('./auth.socket');
const registerChatHandlers = require('./chat.handler');
const { registerPresenceHandlers } = require('./presence.handler');
const registerRoomHandlers = require('./room.handler');
const registerVoiceHandlers = require('./voice.handler');
const corsOptions = require('../config/cors');
const logger = require('../utils/logger');

/**
 * Initializes and wires Socket.IO to the Node HTTP server.
 * @param {import('http').Server} httpServer
 * @returns {import('socket.io').Server}
 */
function initSockets(httpServer) {
  const io = new Server(httpServer, {
    cors: corsOptions,
    pingTimeout: 60000, // Detect silent drops in 60s
    pingInterval: 25000,
  });

  // Attach JWT validation check middleware
  io.use(socketAuthenticate);

  // Hook connection event listener
  io.on('connection', (socket) => {
    logger.info(`Socket: User connected`, {
      userId: socket.userId,
      username: socket.user.username,
      socketId: socket.id,
    });

    // Wire up feature-specific handlers
    registerPresenceHandlers(io, socket);
    registerRoomHandlers(io, socket);
    registerChatHandlers(io, socket);
    registerVoiceHandlers(io, socket);

    socket.on('error', (error) => {
      logger.error(`Socket error for user ${socket.user.username}`, { error: error.message });
    });
  });

  return io;
}

module.exports = initSockets;
