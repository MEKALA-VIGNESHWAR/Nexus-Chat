/**
 * Encryption Service
 * AES-256-CBC encryption/decryption for message content at rest.
 * Uses a server-side key from environment variables.
 */
const crypto = require('crypto');
const env = require('../config/env');
const logger = require('../utils/logger');

const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16; // AES block size

// Derive a 32-byte key from the hex string in env
let encryptionKey;
try {
  encryptionKey = Buffer.from(env.encryptionKey, 'hex');
  if (encryptionKey.length !== 32) {
    throw new Error('Encryption key must be 32 bytes (64 hex characters)');
  }
} catch (error) {
  logger.error('Invalid ENCRYPTION_KEY format', { error: error.message });
  // Fallback: derive key using SHA-256 hash
  encryptionKey = crypto.createHash('sha256').update(env.encryptionKey).digest();
  logger.warn('Using SHA-256 derived encryption key (set a proper 64-char hex key in .env)');
}

/**
 * Encrypts a plain text string using AES-256-CBC.
 * @param {string} text - Plain text to encrypt
 * @returns {{ encrypted: string, iv: string }} - Encrypted text and IV (both hex encoded)
 */
function encrypt(text) {
  if (!text || typeof text !== 'string') {
    return { encrypted: '', iv: '' };
  }

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, encryptionKey, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  return {
    encrypted,
    iv: iv.toString('hex'),
  };
}

/**
 * Decrypts an AES-256-CBC encrypted string.
 * @param {string} encryptedText - Hex-encoded encrypted text
 * @param {string} ivHex - Hex-encoded initialization vector
 * @returns {string} - Decrypted plain text
 */
function decrypt(encryptedText, ivHex) {
  if (!encryptedText || !ivHex) {
    return '';
  }

  try {
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, encryptionKey, iv);

    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    logger.error('Decryption failed', { error: error.message });
    return '[Decryption failed]';
  }
}

module.exports = { encrypt, decrypt };
