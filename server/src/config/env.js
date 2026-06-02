/**
 * Environment Configuration
 * Centralizes and validates all environment variables.
 * Fails fast on startup if required variables are missing.
 */
const dotenv = require('dotenv');
const path = require('path');

// Load .env from server root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

/**
 * Validates that all required environment variables are present.
 * @param {string[]} requiredVars - Array of required env variable names
 * @throws {Error} if any required variables are missing
 */
function validateEnv(requiredVars) {
  const missing = requiredVars.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing.map((v) => `  - ${v}`).join('\n')}\n` +
      'Copy .env.example to .env and fill in your values.'
    );
  }
}

// Validate critical vars on import
const REQUIRED_IN_PRODUCTION = [
  'DATABASE_URL',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'ENCRYPTION_KEY',
];

if (process.env.NODE_ENV === 'production') {
  validateEnv([
    ...REQUIRED_IN_PRODUCTION,
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
  ]);
} else {
  validateEnv(REQUIRED_IN_PRODUCTION);
}

const env = {
  // Server
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
  isProduction: process.env.NODE_ENV === 'production',

  // Database
  databaseUrl: process.env.DATABASE_URL,

  // JWT
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  },

  // Cloudinary
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },

  // CORS
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim()),

  // Encryption
  encryptionKey: process.env.ENCRYPTION_KEY,

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
  },
};

module.exports = env;
