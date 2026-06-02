/**
 * Socket Authentication Middleware
 * Validates JWT access tokens sent during WebSocket handshake query.
 * Attaches authenticated user details to socket.user.
 */
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const env = require('../config/env');
const logger = require('../utils/logger');

/**
 * Socket.IO middleware to authenticate connection handshakes.
 * @param {import('socket.io').Socket} socket
 * @param {Function} next
 */
async function socketAuthenticate(socket, next) {
  try {
    // Read access token from handshake query or headers
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization;

    if (!token) {
      return next(new Error('Authentication error: Access token required'));
    }

    // Handle optional Bearer prefix format
    const cleanToken = token.startsWith('Bearer ') ? token.split(' ')[1] : token;

    // Verify JWT
    let decoded;
    try {
      decoded = jwt.verify(cleanToken, env.jwt.accessSecret);
    } catch (err) {
      return next(new Error('Authentication error: Invalid or expired access token'));
    }

    // Retrieve user from DB
    const user = await User.findById(decoded.userId).select('username avatar status');
    if (!user) {
      return next(new Error('Authentication error: User not found'));
    }

    // Attach authenticated user to the socket object
    socket.user = user;
    socket.userId = user._id.toString();
    
    next();
  } catch (error) {
    logger.error('Socket authentication failed', { error: error.message });
    next(new Error('Authentication error: Internal server error'));
  }
}

module.exports = socketAuthenticate;
