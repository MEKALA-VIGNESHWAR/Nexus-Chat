/**
 * Media Controller
 * Handles uploading files (images, PDFs, documents) in a chat room context.
 */
const mediaService = require('../services/media.service');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

/**
 * Uploads a file inside a chat room.
 */
async function uploadFile(req, res, next) {
  try {
    if (!req.file) {
      throw ApiError.badRequest('No file provided for upload');
    }

    const roomId = req.body.roomId || req.params.roomId;
    if (!roomId) {
      throw ApiError.badRequest('Room ID is required');
    }
    const media = await mediaService.uploadMedia({
      buffer: req.file.buffer,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      uploaderId: req.userId,
      roomId,
    });

    new ApiResponse(201, media, 'File uploaded successfully').send(res);
  } catch (error) {
    next(error);
  }
}

/**
 * Gets files shared inside a specific room.
 */
async function getRoomMedia(req, res, next) {
  try {
    const { roomId } = req.params;
    const { type, limit } = req.query;

    const mediaList = await mediaService.getRoomMedia(roomId, req.userId, {
      type,
      limit: limit ? parseInt(limit, 10) : undefined,
    });

    ApiResponse.ok(mediaList).send(res);
  } catch (error) {
    next(error);
  }
}

/**
 * Deletes a shared file.
 */
async function deleteMedia(req, res, next) {
  try {
    const { mediaId } = req.params;
    await mediaService.deleteMedia(mediaId, req.userId);
    ApiResponse.noContent().send(res);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  uploadFile,
  getRoomMedia,
  deleteMedia,
};
