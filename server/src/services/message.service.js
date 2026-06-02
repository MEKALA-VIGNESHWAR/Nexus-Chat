/**
 * Message Service
 * Business logic for sending, retrieving, and managing messages.
 * Handles encryption at rest and read/delivery receipts.
 */
const Message = require('../models/Message');
const Room = require('../models/Room');
const Notification = require('../models/Notification');
const ApiError = require('../utils/ApiError');
const { encrypt, decrypt } = require('./encryption.service');
const { MESSAGE_TYPES, NOTIFICATION_TYPES } = require('../utils/constants');

/**
 * Creates and stores a new message with encryption.
 * @param {Object} data - { roomId, senderId, content, type, mediaId, replyTo }
 * @returns {Promise<Document>} Populated message document
 */
async function createMessage({ roomId, senderId, content, type = MESSAGE_TYPES.TEXT, mediaId = null, replyTo = null }) {
  // Verify sender is a member of the room
  const isMember = await Room.isMember(roomId, senderId);
  if (!isMember) {
    throw ApiError.forbidden('You are not a member of this room');
  }

  // Encrypt text content
  let encryptedContent = { text: '', iv: '' };
  if (content && type === MESSAGE_TYPES.TEXT) {
    const { encrypted, iv } = encrypt(content);
    encryptedContent = { text: encrypted, iv };
  }

  // Create message
  const message = await Message.create({
    room: roomId,
    sender: senderId,
    content: encryptedContent,
    type,
    media: mediaId,
    replyTo,
    readBy: [{ user: senderId, readAt: new Date() }], // Sender has "read" their own message
    deliveredTo: [{ user: senderId, deliveredAt: new Date() }],
  });

  // Update room's last message
  await Room.findByIdAndUpdate(roomId, {
    lastMessage: message._id,
    updatedAt: new Date(), // Bump room to top of list
  });

  // Populate for return
  const populated = await Message.findById(message._id)
    .populate('sender', 'username avatar')
    .populate('media')
    .populate('replyTo', 'content.text sender')
    .lean();

  // Decrypt content for response
  if (populated.content.text && populated.content.iv) {
    populated.content.text = decrypt(populated.content.text, populated.content.iv);
    delete populated.content.iv; // Don't send IV to client
  }

  // Create notifications for other room members
  const room = await Room.findById(roomId);
  const recipientIds = room.members
    .map((m) => m.user.toString())
    .filter((id) => id !== senderId);

  if (recipientIds.length > 0) {
    const notifications = recipientIds.map((recipientId) => ({
      recipient: recipientId,
      type: NOTIFICATION_TYPES.MESSAGE,
      title: `New message from ${populated.sender.username}`,
      body: type === MESSAGE_TYPES.TEXT
        ? populated.content.text.substring(0, 100)
        : `Sent a ${type}`,
      data: {
        room: roomId,
        message: message._id,
        sender: senderId,
      },
    }));

    // Bulk insert notifications (non-blocking)
    Notification.insertMany(notifications).catch(() => {});
  }

  return populated;
}

/**
 * Gets paginated messages for a room with decrypted content.
 * @param {string} roomId
 * @param {string} userId - Requesting user
 * @param {Object} [options] - { page, limit }
 * @returns {Promise<{ messages: Object[], totalCount: number, hasMore: boolean }>}
 */
async function getMessages(roomId, userId, options = {}) {
  // Verify membership
  const isMember = await Room.isMember(roomId, userId);
  if (!isMember) {
    throw ApiError.forbidden('You are not a member of this room');
  }

  const result = await Message.getByRoom(roomId, options);

  // Decrypt message content
  result.messages = result.messages.map((msg) => {
    if (msg.content.text && msg.content.iv) {
      msg.content.text = decrypt(msg.content.text, msg.content.iv);
      delete msg.content.iv;
    }
    return msg;
  });

  return result;
}

/**
 * Marks all messages in a room as read by a user.
 * @param {string} roomId
 * @param {string} userId
 */
async function markAsRead(roomId, userId) {
  const isMember = await Room.isMember(roomId, userId);
  if (!isMember) {
    throw ApiError.forbidden('You are not a member of this room');
  }

  await Message.markAsRead(roomId, userId);
}

/**
 * Marks all messages in a room as delivered to a user.
 * @param {string} roomId
 * @param {string} userId
 */
async function markAsDelivered(roomId, userId) {
  await Message.markAsDelivered(roomId, userId);
}

/**
 * Soft-deletes a message (only by the sender).
 * @param {string} messageId
 * @param {string} userId
 * @returns {Promise<Document>}
 */
async function deleteMessage(messageId, userId) {
  const message = await Message.findById(messageId);
  if (!message) {
    throw ApiError.notFound('Message not found');
  }

  if (message.sender.toString() !== userId) {
    throw ApiError.forbidden('You can only delete your own messages');
  }

  message.deleted = true;
  message.content = { text: '', iv: '' };
  await message.save();

  return message;
}

module.exports = {
  createMessage,
  getMessages,
  markAsRead,
  markAsDelivered,
  deleteMessage,
};
