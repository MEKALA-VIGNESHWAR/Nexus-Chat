/**
 * Message Routes
 * Maps message CRUD operations in rooms.
 */
const express = require('express');
const router = express.Router();
const messageController = require('../controllers/message.controller');
const { authenticate } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate');
const {
  sendMessageSchema,
  getMessagesSchema,
} = require('../validators/message.validator');

// Protect all message routes
router.use(authenticate);

// Get paginated messages in a room
router.get(
  '/:roomId',
  validate(getMessagesSchema, 'query'),
  messageController.getRoomMessages
);

// Send message to room
router.post(
  '/:roomId',
  validate(sendMessageSchema),
  messageController.sendMessage
);

// Mark all messages in room as read
router.patch('/:roomId/read', messageController.markRoomAsRead);

// Soft-delete a message
router.delete('/:messageId', messageController.deleteMessage);

module.exports = router;
