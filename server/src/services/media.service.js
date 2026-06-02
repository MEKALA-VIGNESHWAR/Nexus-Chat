/**
 * Media Service
 * Handles file uploads to Cloudinary and media record management.
 */
const cloudinary = require('../config/cloudinary');
const Media = require('../models/Media');
const Room = require('../models/Room');
const ApiError = require('../utils/ApiError');
const { UPLOAD } = require('../utils/constants');
const logger = require('../utils/logger');

/**
 * Determines media type from MIME type.
 * @param {string} mimeType
 * @returns {'image'|'video'|'document'|'audio'}
 */
function getMediaType(mimeType) {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  return 'document';
}

/**
 * Uploads a file to Cloudinary and creates a Media record.
 * @param {Object} params
 * @param {Buffer} params.buffer - File buffer from multer
 * @param {string} params.originalName - Original filename
 * @param {string} params.mimeType - File MIME type
 * @param {number} params.size - File size in bytes
 * @param {string} params.uploaderId - User uploading the file
 * @param {string} params.roomId - Room the file belongs to
 * @returns {Promise<Document>} Created Media document
 */
async function uploadMedia({ buffer, originalName, mimeType, size, uploaderId, roomId }) {
  // Verify user is a member of the room
  const isMember = await Room.isMember(roomId, uploaderId);
  if (!isMember) {
    throw ApiError.forbidden('You are not a member of this room');
  }

  const mediaType = getMediaType(mimeType);

  // Configure Cloudinary upload options based on media type
  const uploadOptions = {
    folder: `${UPLOAD.CLOUDINARY_FOLDER}/${roomId}`,
    resource_type: mediaType === 'document' ? 'raw' : 'auto',
  };

  // Add image-specific transformations
  if (mediaType === 'image') {
    uploadOptions.transformation = [
      { quality: 'auto', fetch_format: 'auto' },
    ];
  }

  // Upload to Cloudinary via stream
  const result = await new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          logger.error('Cloudinary upload failed', { error: error.message });
          reject(ApiError.internal('File upload failed'));
        } else {
          resolve(result);
        }
      }
    );
    uploadStream.end(buffer);
  });

  // Create media record in database
  const media = await Media.create({
    uploader: uploaderId,
    room: roomId,
    type: mediaType,
    url: result.secure_url,
    publicId: result.public_id,
    originalName,
    mimeType,
    size,
    dimensions: {
      width: result.width || null,
      height: result.height || null,
    },
  });

  return media;
}

/**
 * Deletes a media file from Cloudinary and the database.
 * @param {string} mediaId
 * @param {string} userId - Must be the uploader
 */
async function deleteMedia(mediaId, userId) {
  const media = await Media.findById(mediaId);
  if (!media) {
    throw ApiError.notFound('Media not found');
  }

  if (media.uploader.toString() !== userId) {
    throw ApiError.forbidden('You can only delete your own uploads');
  }

  // Delete from Cloudinary
  try {
    const resourceType = media.type === 'document' ? 'raw' : 'image';
    await cloudinary.uploader.destroy(media.publicId, { resource_type: resourceType });
  } catch (error) {
    logger.error('Cloudinary deletion failed', { error: error.message, publicId: media.publicId });
  }

  // Delete from database
  await Media.findByIdAndDelete(mediaId);
}

/**
 * Gets all media files for a room.
 * @param {string} roomId
 * @param {string} userId
 * @param {Object} [options] - { type, limit }
 * @returns {Promise<Document[]>}
 */
async function getRoomMedia(roomId, userId, options = {}) {
  const isMember = await Room.isMember(roomId, userId);
  if (!isMember) {
    throw ApiError.forbidden('You are not a member of this room');
  }

  return Media.getByRoom(roomId, options);
}

module.exports = {
  uploadMedia,
  deleteMedia,
  getRoomMedia,
};
