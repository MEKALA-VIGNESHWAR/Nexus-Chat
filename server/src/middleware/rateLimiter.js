/**
 * Rate Limiter Middleware
 * Configurable rate limiters for different endpoint categories.
 */
const rateLimit = require('express-rate-limit');
const ApiError = require('../utils/ApiError');
const env = require('../config/env');

/**
 * General API rate limiter.
 * Applies to all routes by default.
 */
const generalLimiter = rateLimit({
  windowMs: env.rateLimit.windowMs,
  max: env.rateLimit.maxRequests,
  standardHeaders: true, // Return rate limit info in RateLimit-* headers
  legacyHeaders: false,  // Disable X-RateLimit-* headers
  handler: (req, res, next) => {
    next(ApiError.tooManyRequests('Too many requests, please try again later'));
  },
});

/**
 * Strict rate limiter for authentication endpoints.
 * Prevents brute-force attacks on login/register.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  handler: (req, res, next) => {
    next(ApiError.tooManyRequests('Too many authentication attempts, please try again in 15 minutes'));
  },
});

/**
 * File upload rate limiter.
 * Prevents abuse of storage resources.
 */
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // 50 uploads per hour
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(ApiError.tooManyRequests('Upload limit exceeded, please try again later'));
  },
});

module.exports = {
  generalLimiter,
  authLimiter,
  uploadLimiter,
};
