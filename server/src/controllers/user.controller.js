/**
 * User Controller
 * Maps user profile and search endpoints to the user service.
 */
const userService = require('../services/user.service');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

/**
 * Gets a user profile by their ID.
 */
async function getUserProfile(req, res, next) {
  try {
    const user = await userService.getUserById(req.params.userId);
    ApiResponse.ok(user).send(res);
  } catch (error) {
    next(error);
  }
}

/**
 * Updates the current user's profile info (username, email).
 */
async function updateProfile(req, res, next) {
  try {
    const updatedUser = await userService.updateProfile(req.userId, req.body);
    ApiResponse.ok(updatedUser, 'Profile updated successfully').send(res);
  } catch (error) {
    next(error);
  }
}

/**
 * Updates the current user's avatar.
 */
async function updateAvatar(req, res, next) {
  try {
    if (!req.file) {
      throw ApiError.badRequest('No avatar image provided');
    }

    const updatedUser = await userService.updateAvatar(
      req.userId,
      req.file.buffer,
      req.file.mimetype
    );

    ApiResponse.ok(updatedUser, 'Avatar updated successfully').send(res);
  } catch (error) {
    next(error);
  }
}

/**
 * Searches users by username query.
 */
async function searchUsers(req, res, next) {
  try {
    const { q } = req.query;
    const users = await userService.searchUsers(q, req.userId);
    ApiResponse.ok(users).send(res);
  } catch (error) {
    next(error);
  }
}

/**
 * Fetches list of all currently online users.
 */
async function getOnlineUsers(req, res, next) {
  try {
    const users = await userService.getOnlineUsers();
    ApiResponse.ok(users).send(res);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getUserProfile,
  updateProfile,
  updateAvatar,
  searchUsers,
  getOnlineUsers,
};
