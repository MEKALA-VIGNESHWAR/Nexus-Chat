/**
 * Express Application Setup
 * Configures core middlewares, routes, and error handling.
 */
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const routes = require('./routes');
const corsOptions = require('./config/cors');
const { generalLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');
const ApiError = require('./utils/ApiError');

const app = express();

// ── Security Middlewares ───────────────────────────────
// Set secure HTTP headers
app.use(helmet());

// Enable CORS with dynamic options
app.use(cors(corsOptions));

// ── Parsing Middlewares ────────────────────────────────
// Parse incoming request bodies in JSON format
app.use(express.json({ limit: '10kb' }));

// Parse cookie headers (needed for secure refresh token cookies)
app.use(cookieParser());

// ── Rate Limiting ─────────────────────────────────────
// Apply general rate limiting to all requests
app.use('/api', generalLimiter);

// ── API Routes ────────────────────────────────────────
app.use('/api/v1', routes);

// ── Error Handling ────────────────────────────────────
// Catch-all route for undefined paths (trigger 404)
app.use('*', (req, res, next) => {
  next(ApiError.notFound(`Cannot find ${req.originalUrl} on this server`));
});

// Register global error handler middleware
app.use(errorHandler);

module.exports = app;
