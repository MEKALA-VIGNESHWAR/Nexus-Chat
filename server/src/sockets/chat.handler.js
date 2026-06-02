/**
 * Socket.IO Chat Event Handler
 * Manages message forwarding, delivery updates, and read receipts.
 */
const messageService = require('../services/message.service');
const Room = require('../models/Room');
const { SOCKET_EVENTS } = require('../utils/constants');
const logger = require('../utils/logger');

/**
 * Register chat socket event handlers.
 * @param {import('socket.io').Server} io
 * @param {import('socket.io').Socket} socket
 */
function registerChatHandlers(io, socket) {
  const userId = socket.userId;

  /**
   * Client sends a new message to a room.
   */
  socket.on(SOCKET_EVENTS.SEND_MESSAGE, async (data, callback) => {
    try {
      const { roomId, content, type, mediaId, replyTo } = data;

      if (!roomId) {
        throw new Error('Room ID is required');
      }

      // Save message in database (handles AES-256 encryption at rest)
      const message = await messageService.createMessage({
        roomId,
        senderId: userId,
        content,
        type,
        mediaId,
        replyTo,
      });

      // Broadcast message to all active room members
      socket.to(roomId).emit(SOCKET_EVENTS.RECEIVE_MESSAGE, message);

      // Emit real-time notifications via socket to online recipients who are not in the room
      const { activeConnections } = require('./presence.handler');
      const room = await Room.findById(roomId);
      if (room && room.members) {
        const recipientIds = room.members
          .map((m) => (m.user?._id || m.user).toString())
          .filter((id) => id !== userId);

        recipientIds.forEach((recipientId) => {
          const sockets = activeConnections.get(recipientId);
          if (sockets) {
            const notificationPayload = {
              type: 'message',
              title: `New message from ${message.sender.username}`,
              body: message.type === 'text' ? message.content.text.substring(0, 100) : `Sent a ${message.type}`,
              data: {
                room: roomId,
                message: message._id,
                sender: {
                  _id: userId,
                  username: message.sender.username,
                  avatar: message.sender.avatar,
                },
              },
              read: false,
              createdAt: new Date(),
            };

            sockets.forEach((socketId) => {
              io.to(socketId).emit(SOCKET_EVENTS.NOTIFICATION, notificationPayload);
            });
          }
        });
      }

      // Confirm success to the sender with the saved message details
      if (typeof callback === 'function') {
        callback({ success: true, data: message });
      }
    } catch (error) {
      logger.error('Socket send_message error', { error: error.message, userId });
      if (typeof callback === 'function') {
        callback({ success: false, error: error.message });
      }
    }
  });

  /**
   * Client reports that they read messages in a room.
   */
  socket.on(SOCKET_EVENTS.MESSAGE_READ, async (data) => {
    try {
      const { roomId } = data;
      if (!roomId) return;

      // Update read status in database
      await messageService.markAsRead(roomId, userId);

      // Broadcast read receipt update to other users in the room
      socket.to(roomId).emit(SOCKET_EVENTS.MESSAGE_READ, {
        roomId,
        userId,
        readAt: new Date(),
      });
    } catch (error) {
      logger.error('Socket message_read error', { error: error.message, userId });
    }
  });

  /**
   * Client reports delivery of messages in a room.
   */
  socket.on(SOCKET_EVENTS.MESSAGE_DELIVERED, async (data) => {
    try {
      const { roomId } = data;
      if (!roomId) return;

      // Update delivery status in database
      await messageService.markAsDelivered(roomId, userId);

      // Broadcast receipt update
      socket.to(roomId).emit(SOCKET_EVENTS.MESSAGE_DELIVERED, {
        roomId,
        userId,
        deliveredAt: new Date(),
      });
    } catch (error) {
      logger.error('Socket message_delivered error', { error: error.message, userId });
    }
  });

  /**
   * Client requests deletion (soft-delete) of their message.
   */
  socket.on(SOCKET_EVENTS.DELETE_MESSAGE, async (data, callback) => {
    try {
      const { messageId, roomId } = data;
      if (!messageId || !roomId) {
        throw new Error('Message ID and Room ID are required');
      }

      await messageService.deleteMessage(messageId, userId);

      // Broadcast deletion event to room members
      io.to(roomId).emit(SOCKET_EVENTS.DELETE_MESSAGE, { messageId, roomId });

      if (typeof callback === 'function') {
        callback({ success: true });
      }
    } catch (error) {
      logger.error('Socket delete_message error', { error: error.message, userId });
      if (typeof callback === 'function') {
        callback({ success: false, error: error.message });
      }
    }
  });
}

module.exports = registerChatHandlers;
