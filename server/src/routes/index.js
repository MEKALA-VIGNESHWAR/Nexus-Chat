/**
 * Main API Route Aggregator
 * Combines all modular routes into a unified API layout.
 */
const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const roomRoutes = require('./room.routes');
const messageRoutes = require('./message.routes');
const mediaRoutes = require('./media.routes');
const notificationRoutes = require('./notification.routes');

// Health Check Endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date(),
    service: 'nexuschat-api',
  });
});

// Mount Routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/rooms', roomRoutes);
router.use('/messages', messageRoutes);
router.use('/media', mediaRoutes);
router.use('/notifications', notificationRoutes);

module.exports = router;
