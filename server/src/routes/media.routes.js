/**
 * Media Routes
 * Shared files and uploads inside chat rooms.
 */
const express = require('express');
const router = express.Router();
const mediaController = require('../controllers/media.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { uploadFile } = require('../middleware/upload');
const { uploadLimiter } = require('../middleware/rateLimiter');

// Protect all media routes
router.use(authenticate);

// Get files uploaded to a specific room
router.get('/:roomId', mediaController.getRoomMedia);

// Upload a file to a room
router.post('/upload', uploadLimiter, uploadFile, mediaController.uploadFile);

// Delete file
router.delete('/:mediaId', mediaController.deleteMedia);

module.exports = router;
