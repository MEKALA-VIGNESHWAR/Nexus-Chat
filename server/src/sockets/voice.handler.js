/**
 * Socket.IO WebRTC Signaling Event Handler
 * Facilitates peer-to-peer connection handshakes for voice rooms.
 * Maps WebRTC signal trades (offers, answers, ICE candidates) between peers.
 */
const { SOCKET_EVENTS } = require('../utils/constants');
const logger = require('../utils/logger');

// Global map tracking active users inside each voice room
// Key: roomId, Value: Map of (userId -> socketId)
const voiceRooms = new Map();

/**
 * Register WebRTC voice signaling handlers.
 * @param {import('socket.io').Server} io
 * @param {import('socket.io').Socket} socket
 */
function registerVoiceHandlers(io, socket) {
  const userId = socket.userId;
  const username = socket.user.username;
  const avatar = socket.user.avatar?.url || '';

  /**
   * User joins a voice room channel.
   */
  socket.on(SOCKET_EVENTS.VOICE_JOIN, (data, callback) => {
    try {
      const { roomId } = data;
      if (!roomId) throw new Error('Room ID is required');

      // Initialize voice room tracking if it doesn't exist
      if (!voiceRooms.has(roomId)) {
        voiceRooms.set(roomId, new Map());
      }

      const roomPeers = voiceRooms.get(roomId);

      // Check if user is already inside the voice room
      if (roomPeers.has(userId)) {
        // Disconnect their old socket from voice room first
        const oldSocketId = roomPeers.get(userId).socketId;
        const oldSocket = io.sockets.sockets.get(oldSocketId);
        if (oldSocket) {
          oldSocket.leave(`voice_${roomId}`);
        }
      }

      // Add user to the voice room mapping
      roomPeers.set(userId, {
        socketId: socket.id,
        username,
        avatar,
      });

      // Join the room's socket channel
      socket.join(`voice_${roomId}`);

      // Notify other peers in the voice channel that a user joined
      socket.to(`voice_${roomId}`).emit(SOCKET_EVENTS.MEMBER_JOINED, {
        userId,
        socketId: socket.id,
        username,
        avatar,
      });

      // Format peer list to send back to joining user
      const existingPeers = [];
      roomPeers.forEach((peerData, peerId) => {
        if (peerId !== userId) {
          existingPeers.push({
            userId: peerId,
            socketId: peerData.socketId,
            username: peerData.username,
            avatar: peerData.avatar,
          });
        }
      });

      logger.debug(`Voice: User ${username} joined voice room ${roomId}`);

      if (typeof callback === 'function') {
        callback({ success: true, peers: existingPeers });
      }
    } catch (error) {
      logger.error('Socket voice_join error', { error: error.message, userId });
      if (typeof callback === 'function') {
        callback({ success: false, error: error.message });
      }
    }
  });

  /**
   * User routes a WebRTC signaling payload (offer/answer/ICE candidate) to a target peer.
   */
  socket.on(SOCKET_EVENTS.VOICE_SIGNAL, (data) => {
    const { targetSocketId, signal } = data;
    if (!targetSocketId || !signal) return;

    // Send the WebRTC signal payload to the target peer's specific connection socket
    io.to(targetSocketId).emit(SOCKET_EVENTS.VOICE_SIGNAL, {
      senderSocketId: socket.id,
      senderUserId: userId,
      signal,
    });
  });

  /**
   * User leaves a voice room channel.
   */
  socket.on(SOCKET_EVENTS.VOICE_LEAVE, (data) => {
    const { roomId } = data;
    if (!roomId) return;

    handleVoiceRoomLeave(io, socket, roomId);
  });

  /**
   * Disconnect fallback — cleanup if socket disconnects while in voice room.
   */
  socket.on(SOCKET_EVENTS.DISCONNECT, () => {
    voiceRooms.forEach((peers, roomId) => {
      if (peers.has(userId) && peers.get(userId).socketId === socket.id) {
        handleVoiceRoomLeave(io, socket, roomId);
      }
    });
  });
}

/**
 * Helper to remove user from voice room tracking and emit leaving notifications.
 */
function handleVoiceRoomLeave(io, socket, roomId) {
  const userId = socket.userId;
  const roomPeers = voiceRooms.get(roomId);

  if (roomPeers && roomPeers.has(userId)) {
    roomPeers.delete(userId);
    socket.leave(`voice_${roomId}`);

    // Broadcast departure to remaining peers
    socket.to(`voice_${roomId}`).emit(SOCKET_EVENTS.MEMBER_LEFT, {
      userId,
      socketId: socket.id,
    });

    logger.debug(`Voice: User ${socket.user.username} left voice room ${roomId}`);

    // Clean up empty room map keys
    if (roomPeers.size === 0) {
      voiceRooms.delete(roomId);
    }
  }
}

module.exports = registerVoiceHandlers;
