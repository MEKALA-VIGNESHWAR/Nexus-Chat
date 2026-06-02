/**
 * Cloudinary Configuration
 * Initializes Cloudinary SDK with credentials from environment.
 */
const cloudinary = require('cloudinary').v2;
const env = require('./env');

cloudinary.config({
  cloud_name: env.cloudinary.cloudName,
  api_key: env.cloudinary.apiKey,
  api_secret: env.cloudinary.apiSecret,
  secure: true, // Always use HTTPS URLs
});

module.exports = cloudinary;
