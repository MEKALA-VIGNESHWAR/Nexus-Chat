/**
 * Notification Controller
 * Manages endpoints for retrieving and marking user notifications.
 */
const Notification = require('../models/Notification');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

/**
 * Gets paginated notifications for the current authenticated user.
 */
async function getNotifications(req, res, next) {
  try {
    const { page, limit, unreadOnly } = req.query;
    const options = {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      unreadOnly: unreadOnly === 'true',
    };

    const result = await Notification.getForUser(req.userId, options);
    ApiResponse.ok(result).send(res);
  } catch (error) {
    next(error);
  }
}

/**
 * Marks all notifications as read for the current user.
 */
async function markAllRead(req, res, next) {
  try {
    await Notification.markAllRead(req.userId);
    ApiResponse.ok(null, 'All notifications marked as read').send(res);
  } catch (error) {
    next(error);
  }
}

/**
 * Marks a single notification as read.
 */
async function markOneRead(req, res, next) {
  try {
    const { id } = req.params;

    // Find notification first to verify ownership
    const notification = await Notification.findById(id);
    if (!notification) {
      throw ApiError.notFound('Notification not found');
    }

    if (notification.recipient !== req.userId) {
      throw ApiError.forbidden('You can only read your own notifications');
    }

    const updated = await Notification.findByIdAndUpdate(id, { read: true });
    ApiResponse.ok(updated, 'Notification marked as read').send(res);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getNotifications,
  markAllRead,
  markOneRead,
};
