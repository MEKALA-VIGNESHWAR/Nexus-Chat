/**
 * Message Controller
 * Maps chat message operations to the message service.
 */
const messageService = require('../services/message.service');
const ApiResponse = require('../utils/ApiResponse');

/**
 * Sends a message in a specific room.
 */
async function sendMessage(req, res, next) {
  try {
    const { roomId } = req.params;
    const message = await messageService.createMessage({
      roomId,
      senderId: req.userId,
      ...req.body,
    });
    new ApiResponse(201, message, 'Message sent successfully').send(res);
  } catch (error) {
    next(error);
  }
}

/**
 * Gets paginated messages for a room.
 */
async function getRoomMessages(req, res, next) {
  try {
    const { roomId } = req.params;
    const { page, limit } = req.query;
    
    const result = await messageService.getMessages(roomId, req.userId, {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    });

    ApiResponse.ok(result).send(res);
  } catch (error) {
    next(error);
  }
}

/**
 * Marks all messages in a room as read by the user.
 */
async function markRoomAsRead(req, res, next) {
  try {
    const { roomId } = req.params;
    await messageService.markAsRead(roomId, req.userId);
    ApiResponse.ok(null, 'Messages marked as read').send(res);
  } catch (error) {
    next(error);
  }
}

/**
 * Soft-deletes a message (restricted to message sender).
 */
async function deleteMessage(req, res, next) {
  try {
    const { messageId } = req.params;
    await messageService.deleteMessage(messageId, req.userId);
    ApiResponse.ok(null, 'Message deleted successfully').send(res);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  sendMessage,
  getRoomMessages,
  markRoomAsRead,
  deleteMessage,
};
