/**
 * Authentication Service
 * Business logic for registration, login, token management, and logout.
 * Implements access + refresh token rotation strategy.
 */
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const env = require('../config/env');
const logger = require('../utils/logger');

/**
 * Generates a JWT access token (short-lived).
 * @param {string} userId
 * @returns {string}
 */
function generateAccessToken(userId) {
  return jwt.sign({ userId }, env.jwt.accessSecret, {
    expiresIn: env.jwt.accessExpiry,
  });
}

/**
 * Generates a JWT refresh token (long-lived).
 * @param {string} userId
 * @returns {string}
 */
function generateRefreshToken(userId) {
  return jwt.sign({ userId }, env.jwt.refreshSecret, {
    expiresIn: env.jwt.refreshExpiry,
  });
}

/**
 * Hashes a refresh token for secure storage in DB.
 * We don't store raw refresh tokens — only their SHA-256 hash.
 * @param {string} token
 * @returns {string}
 */
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Generates both tokens and stores hashed refresh token in DB.
 * @param {Document} user - Mongoose user document
 * @returns {{ accessToken: string, refreshToken: string }}
 */
async function generateTokenPair(user) {
  const accessToken = generateAccessToken(user._id.toString());
  const refreshToken = generateRefreshToken(user._id.toString());

  // Store hashed refresh token
  user.refreshToken = hashToken(refreshToken);
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
}

/**
 * Registers a new user.
 * @param {Object} userData - { username, email, password }
 * @returns {{ user: Object, accessToken: string, refreshToken: string }}
 */
async function register({ username, email, password }) {
  // Check for existing user
  const existingUser = await User.findOne({
    $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }],
  });

  if (existingUser) {
    if (existingUser.email === email.toLowerCase()) {
      throw ApiError.conflict('Email is already registered');
    }
    throw ApiError.conflict('Username is already taken');
  }

  // Create user (password hashing handled by pre-save hook)
  const user = await User.create({
    username,
    email,
    password,
  });

  // Generate tokens
  const { accessToken, refreshToken } = await generateTokenPair(user);

  logger.info('User registered', { userId: user._id, username: user.username });

  return {
    user: user.toPublicProfile(),
    accessToken,
    refreshToken,
  };
}

/**
 * Authenticates a user by email and password.
 * @param {Object} credentials - { email, password }
 * @returns {{ user: Object, accessToken: string, refreshToken: string }}
 */
async function login({ email, password }) {
  // Find user with password field included
  const user = await User.findByEmailWithPassword(email);

  if (!user) {
    // Use generic message to prevent user enumeration
    throw ApiError.unauthorized('Invalid email or password');
  }

  // Verify password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  // Update online status
  user.status.online = true;
  user.status.lastSeen = new Date();

  // Generate tokens
  const { accessToken, refreshToken } = await generateTokenPair(user);

  logger.info('User logged in', { userId: user._id });

  return {
    user: user.toPublicProfile(),
    accessToken,
    refreshToken,
  };
}

/**
 * Refreshes the access token using a valid refresh token.
 * Implements refresh token rotation — old refresh token is invalidated.
 * @param {string} refreshToken - Current refresh token
 * @returns {{ accessToken: string, refreshToken: string }}
 */
async function refreshAccessToken(refreshToken) {
  if (!refreshToken) {
    throw ApiError.unauthorized('Refresh token is required');
  }

  // Verify the refresh token JWT
  let decoded;
  try {
    decoded = jwt.verify(refreshToken, env.jwt.refreshSecret);
  } catch (err) {
    throw ApiError.unauthorized('Invalid or expired refresh token');
  }

  // Find user and verify stored hash matches
  const user = await User.findByIdWithRefreshToken(decoded.userId);
  if (!user) {
    throw ApiError.unauthorized('User not found');
  }

  const hashedToken = hashToken(refreshToken);
  if (user.refreshToken !== hashedToken) {
    // Token reuse detected — possible token theft
    // Invalidate all tokens for this user
    user.refreshToken = null;
    await user.save({ validateBeforeSave: false });

    logger.warn('Refresh token reuse detected', { userId: user._id });
    throw ApiError.unauthorized('Token reuse detected. Please login again.');
  }

  // Rotate: generate new token pair
  const tokens = await generateTokenPair(user);

  logger.debug('Tokens refreshed', { userId: user._id });

  return tokens;
}

/**
 * Logs out a user by invalidating their refresh token.
 * @param {string} userId
 */
async function logout(userId) {
  await User.findByIdAndUpdate(userId, {
    refreshToken: null,
    'status.online': false,
    'status.lastSeen': new Date(),
  });

  logger.info('User logged out', { userId });
}

/**
 * Gets the current authenticated user's profile.
 * @param {string} userId
 * @returns {Object} User public profile
 */
async function getCurrentUser(userId) {
  const user = await User.findById(userId);
  if (!user) {
    throw ApiError.notFound('User not found');
  }
  return user.toPublicProfile();
}

module.exports = {
  register,
  login,
  refreshAccessToken,
  logout,
  getCurrentUser,
};
