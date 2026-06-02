/**
 * Socket.IO Room Event Handler
 * Manages WebSocket room subscription bindings.
 * Automatically loads user room lists to auto-join rooms on connection.
 */
const Room = require('../models/Room');
const { SOCKET_EVENTS } = require('../utils/constants');
const logger = require('../utils/logger');

/**
 * Register room socket event handlers.
 * @param {import('socket.io').Server} io
 * @param {import('socket.io').Socket} socket
 */
function registerRoomHandlers(io, socket) {
  const userId = socket.userId;

  // Auto-join all rooms the user belongs to when they connect
  joinUserRooms(socket);

  /**
   * Manually joins a specific room channel.
   */
  socket.on(SOCKET_EVENTS.JOIN_ROOM, async (data, callback) => {
    try {
      const { roomId } = data;
      if (!roomId) throw new Error('Room ID is required');

      // Check if user is member of room
      const isMember = await Room.isMember(roomId, userId);
      if (!isMember) {
        throw new Error('Not authorized to join this room');
      }

      socket.join(roomId);
      logger.debug(`Socket: User ${socket.user.username} joined room ${roomId}`);

      if (typeof callback === 'function') {
        callback({ success: true });
      }
    } catch (error) {
      logger.error('Socket join_room error', { error: error.message, userId });
      if (typeof callback === 'function') {
        callback({ success: false, error: error.message });
      }
    }
  });

  /**
   * Leaves a room channel.
   */
  socket.on(SOCKET_EVENTS.LEAVE_ROOM, (data, callback) => {
    const { roomId } = data;
    if (roomId) {
      socket.leave(roomId);
      logger.debug(`Socket: User ${socket.user.username} left room ${roomId}`);
    }
    if (typeof callback === 'function') {
      callback({ success: true });
    }
  });
}

/**
 * Finds user rooms in DB and hooks WebSocket room subscriptions.
 * @param {import('socket.io').Socket} socket
 */
async function joinUserRooms(socket) {
  try {
    const rooms = await Room.find({ 'members.user': socket.userId }).select('_id');
    rooms.forEach((room) => {
      socket.join(room._id.toString());
    });
    logger.debug(`Socket: Auto-joined ${rooms.length} rooms for user ${socket.user.username}`);
  } catch (error) {
    logger.error('Error auto-joining user rooms on socket connect', {
      error: error.message,
      userId: socket.userId,
    });
  }
}

module.exports = registerRoomHandlers;
