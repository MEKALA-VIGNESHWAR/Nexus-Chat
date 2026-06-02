/**
 * User Routes
 * Profiles, settings, user search, and presence endpoints.
 */
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { uploadAvatar } = require('../middleware/upload');
const { uploadLimiter } = require('../middleware/rateLimiter');

// Protect all user routes
router.use(authenticate);

// Update user details
router.patch('/profile', userController.updateProfile);

// Update user profile avatar picture
router.post('/avatar', uploadLimiter, uploadAvatar, userController.updateAvatar);

// Search users
router.get('/search', userController.searchUsers);

// Get online users status
router.get('/online', userController.getOnlineUsers);

// Get a specific user profile
router.get('/:userId', userController.getUserProfile);

module.exports = router;
