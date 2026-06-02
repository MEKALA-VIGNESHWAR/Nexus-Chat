/**
 * Multer Upload Middleware
 * Configures file upload handling with size limits and type validation.
 * Files are stored in memory buffer for Cloudinary upload.
 */
const multer = require('multer');
const ApiError = require('../utils/ApiError');
const { UPLOAD } = require('../utils/constants');

// Use memory storage — files go to buffer, then to Cloudinary
const storage = multer.memoryStorage();

/**
 * File filter that validates MIME types.
 * @param {string[]} allowedTypes - Array of allowed MIME types
 * @returns {Function} Multer file filter function
 */
function createFileFilter(allowedTypes) {
  return (req, file, cb) => {
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        ApiError.badRequest(
          `File type '${file.mimetype}' is not allowed. Allowed types: ${allowedTypes.join(', ')}`
        ),
        false
      );
    }
  };
}

/**
 * Image upload middleware (single file, field name: 'image').
 * Max 5MB, accepts JPEG, PNG, GIF, WebP.
 */
const uploadImage = multer({
  storage,
  limits: { fileSize: UPLOAD.MAX_IMAGE_SIZE },
  fileFilter: createFileFilter(UPLOAD.ALLOWED_IMAGE_TYPES),
}).single('image');

/**
 * File upload middleware (single file, field name: 'file').
 * Max 10MB, accepts PDF, DOC, DOCX, TXT, ZIP.
 */
const uploadFile = multer({
  storage,
  limits: { fileSize: UPLOAD.MAX_FILE_SIZE },
  fileFilter: createFileFilter([...UPLOAD.ALLOWED_IMAGE_TYPES, ...UPLOAD.ALLOWED_FILE_TYPES]),
}).single('file');

/**
 * Avatar upload middleware (single file, field name: 'avatar').
 * Max 5MB, images only.
 */
const uploadAvatar = multer({
  storage,
  limits: { fileSize: UPLOAD.MAX_IMAGE_SIZE },
  fileFilter: createFileFilter(UPLOAD.ALLOWED_IMAGE_TYPES),
}).single('avatar');

/**
 * Wraps multer middleware to convert multer errors into ApiErrors.
 * @param {Function} uploadMiddleware - Multer middleware function
 * @returns {import('express').RequestHandler}
 */
function handleUpload(uploadMiddleware) {
  return (req, res, next) => {
    uploadMiddleware(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(ApiError.badRequest('File size exceeds the maximum limit'));
        }
        return next(ApiError.badRequest(err.message));
      }
      if (err) {
        return next(err);
      }
      next();
    });
  };
}

module.exports = {
  uploadImage: handleUpload(uploadImage),
  uploadFile: handleUpload(uploadFile),
  uploadAvatar: handleUpload(uploadAvatar),
};
