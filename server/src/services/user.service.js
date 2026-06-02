/**
 * User Service
 * Business logic for user profile management and search.
 */
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const cloudinary = require('../config/cloudinary');
const { UPLOAD } = require('../utils/constants');

/**
 * Get user profile by ID.
 * @param {string} userId
 * @returns {Promise<Object>}
 */
async function getUserById(userId) {
  const user = await User.findById(userId).select('username email avatar status createdAt');
  if (!user) {
    throw ApiError.notFound('User not found');
  }
  return user;
}

/**
 * Update user profile.
 * @param {string} userId
 * @param {Object} updates - { username, email }
 * @returns {Promise<Object>}
 */
async function updateProfile(userId, updates) {
  const allowedFields = ['username', 'email'];
  const sanitized = {};

  for (const field of allowedFields) {
    if (updates[field] !== undefined) {
      sanitized[field] = updates[field];
    }
  }

  // Check for conflicts if username or email is being changed
  if (sanitized.username || sanitized.email) {
    const conflicts = [];
    if (sanitized.username) {
      conflicts.push({ username: sanitized.username.toLowerCase() });
    }
    if (sanitized.email) {
      conflicts.push({ email: sanitized.email.toLowerCase() });
    }

    const existingUser = await User.findOne({
      $or: conflicts,
      _id: { $ne: userId },
    });

    if (existingUser) {
      if (sanitized.username && existingUser.username === sanitized.username.toLowerCase()) {
        throw ApiError.conflict('Username is already taken');
      }
      throw ApiError.conflict('Email is already registered');
    }
  }

  const user = await User.findByIdAndUpdate(userId, sanitized, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  return user.toPublicProfile();
}

/**
 * Update user avatar by uploading to Cloudinary.
 * @param {string} userId
 * @param {Buffer} fileBuffer - Image buffer from multer
 * @param {string} mimetype - File MIME type
 * @returns {Promise<Object>} Updated user profile
 */
async function updateAvatar(userId, fileBuffer, mimetype) {
  const user = await User.findById(userId);
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  // Delete old avatar from Cloudinary if exists
  if (user.avatar.publicId) {
    try {
      await cloudinary.uploader.destroy(user.avatar.publicId);
    } catch {
      // Non-critical — log and continue
    }
  }

  // Upload new avatar to Cloudinary
  const result = await new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `${UPLOAD.CLOUDINARY_FOLDER}/avatars`,
        transformation: [
          { width: 200, height: 200, crop: 'fill', gravity: 'face' },
          { quality: 'auto', fetch_format: 'auto' },
        ],
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    uploadStream.end(fileBuffer);
  });

  // Update user document
  user.avatar = {
    url: result.secure_url,
    publicId: result.public_id,
  };
  await user.save({ validateBeforeSave: false });

  return user.toPublicProfile();
}

/**
 * Search users by username.
 * @param {string} query - Search term
 * @param {string} currentUserId - Exclude current user from results
 * @returns {Promise<Document[]>}
 */
async function searchUsers(query, currentUserId) {
  if (!query || query.length < 2) {
    throw ApiError.badRequest('Search query must be at least 2 characters');
  }

  return User.searchByUsername(query, currentUserId, 20);
}

/**
 * Get online users (for presence display).
 * @returns {Promise<Document[]>}
 */
async function getOnlineUsers() {
  return User.find({ 'status.online': true })
    .select('username avatar status')
    .lean();
}

module.exports = {
  getUserById,
  updateProfile,
  updateAvatar,
  searchUsers,
  getOnlineUsers,
};
