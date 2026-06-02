/**
 * Notification Routes
 * Fetch and manage user notifications.
 */
const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const { authenticate } = require('../middleware/auth.middleware');

// Protect all notification routes
router.use(authenticate);

// Get paginated notifications
router.get('/', notificationController.getNotifications);

// Mark all notifications as read
router.patch('/read-all', notificationController.markAllRead);

// Mark single notification as read
router.patch('/:id/read', notificationController.markOneRead);

module.exports = router;
