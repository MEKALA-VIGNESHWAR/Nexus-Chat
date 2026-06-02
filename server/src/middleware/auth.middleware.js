/**
 * Authentication Middleware
 * Verifies JWT access tokens from the Authorization header.
 * Attaches authenticated user to req.user.
 */
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const env = require('../config/env');

/**
 * Protects routes by requiring a valid JWT access token.
 * Token must be in the Authorization header as: Bearer <token>
 */
async function authenticate(req, res, next) {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Access token is required');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw ApiError.unauthorized('Access token is required');
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, env.jwt.accessSecret);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        throw ApiError.unauthorized('Access token has expired');
      }
      throw ApiError.unauthorized('Invalid access token');
    }

    // Find user and attach to request
    const user = await User.findById(decoded.userId);
    if (!user) {
      throw ApiError.unauthorized('User not found');
    }

    req.user = user;
    req.userId = user._id.toString();
    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Optional authentication — attaches user if token present, but doesn't fail if missing.
 */
async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    if (!token) return next();

    const decoded = jwt.verify(token, env.jwt.accessSecret);
    const user = await User.findById(decoded.userId);

    if (user) {
      req.user = user;
      req.userId = user._id.toString();
    }
  } catch {
    // Silently continue without auth
  }

  next();
}

module.exports = { authenticate, optionalAuth };
