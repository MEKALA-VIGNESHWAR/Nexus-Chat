/**
 * Auth Controller
 * Maps authentication endpoints to the auth service.
 * Handles access token and refresh token delivery (with secure cookie support).
 */
const authService = require('../services/auth.service');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const env = require('../config/env');
const { AUTH } = require('../utils/constants');

/**
 * Helper to set the refresh token as a secure, HTTP-only cookie.
 * @param {import('express').Response} res
 * @param {string} token
 */
function setRefreshTokenCookie(res, token) {
  // Convert 7d, 15m, etc. expiry string into milliseconds
  // Fallback to 7 days if parsing fails
  const secure = env.isProduction; // Only send over HTTPS in production
  
  res.cookie(AUTH.REFRESH_TOKEN_COOKIE, token, {
    httpOnly: true,
    secure,
    sameSite: env.isProduction ? 'none' : 'lax', // none for cross-site cookie in prod (Vercel + Render)
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  });
}

/**
 * Registers a new user.
 */
async function register(req, res, next) {
  try {
    const { username, email, password } = req.body;
    const result = await authService.register({ username, email, password });

    // Set refresh token in secure cookie
    setRefreshTokenCookie(res, result.refreshToken);

    // Return user profile and access token in response
    new ApiResponse(201, {
      user: result.user,
      accessToken: result.accessToken,
    }, 'Registration successful').send(res);
  } catch (error) {
    next(error);
  }
}

/**
 * Logs in a user.
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await authService.login({ email, password });

    setRefreshTokenCookie(res, result.refreshToken);

    new ApiResponse(200, {
      user: result.user,
      accessToken: result.accessToken,
    }, 'Login successful').send(res);
  } catch (error) {
    next(error);
  }
}

/**
 * Refreshes the access token using a refresh token from cookies.
 */
async function refresh(req, res, next) {
  try {
    // Attempt to extract refresh token from cookies or body
    const token = req.cookies[AUTH.REFRESH_TOKEN_COOKIE] || req.body.refreshToken;

    if (!token) {
      throw ApiError.unauthorized('Refresh token is required');
    }

    const tokens = await authService.refreshAccessToken(token);

    // Set new rotated refresh token
    setRefreshTokenCookie(res, tokens.refreshToken);

    new ApiResponse(200, {
      accessToken: tokens.accessToken,
    }, 'Tokens refreshed successfully').send(res);
  } catch (error) {
    next(error);
  }
}

/**
 * Logs out a user and clears the refresh token cookie.
 */
async function logout(req, res, next) {
  try {
    const userId = req.userId;
    await authService.logout(userId);

    // Clear client cookie
    res.clearCookie(AUTH.REFRESH_TOKEN_COOKIE, {
      httpOnly: true,
      secure: env.isProduction,
      sameSite: env.isProduction ? 'none' : 'lax',
    });

    ApiResponse.noContent().send(res);
  } catch (error) {
    next(error);
  }
}

/**
 * Gets the current logged-in user profile.
 */
async function getMe(req, res, next) {
  try {
    const user = await authService.getCurrentUser(req.userId);
    ApiResponse.ok(user).send(res);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
  refresh,
  logout,
  getMe,
};
