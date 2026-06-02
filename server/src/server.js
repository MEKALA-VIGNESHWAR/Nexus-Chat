/**
 * Server entry point
 * Boots the database, initializes the HTTP server, binds Socket.IO,
 * and sets up graceful shutdown listeners.
 */
const http = require('http');
const app = require('./app');
const env = require('./config/env');
const { connectDB, disconnectDB } = require('./config/db');
const initSockets = require('./sockets');
const logger = require('./utils/logger');

// Create raw HTTP server wrapping our Express app
const server = http.createServer(app);

// Bind Socket.IO
const io = initSockets(server);

// Boot sequence
async function startServer() {
  try {
    // 1. Establish database connection
    await connectDB();

    // 2. Start listening for network traffic
    server.listen(env.port, () => {
      logger.info(`NexusChat API server started`, {
        port: env.port,
        environment: env.nodeEnv,
        pid: process.pid,
      });
    });
  } catch (error) {
    logger.error('Failed to start server', { error: error.message });
    process.exit(1);
  }
}

// Handle unhandled promise rejections outside of Express
process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! Shutting down...', {
    message: err.message,
    stack: err.stack,
  });
  // Graceful exit
  gracefulShutdown();
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! Shutting down...', {
    message: err.message,
    stack: err.stack,
  });
  // Graceful exit
  gracefulShutdown();
});

/**
 * Gracefully terminates server connections and database sessions.
 */
function gracefulShutdown() {
  logger.info('Received shutdown signal. Commencing graceful shutdown...');

  // 1. Stop accepting new connections
  server.close(async () => {
    logger.info('HTTP server closed.');

    try {
      // 2. Disconnect from database
      await disconnectDB();
      logger.info('Graceful shutdown completed successfully.');
      process.exit(0);
    } catch (error) {
      logger.error('Error during database disconnection', { error: error.message });
      process.exit(1);
    }
  });

  // Force close after 10s if connections persist
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
}

// Listen for process termination events (sent by Docker, PM2, Render, or Ctrl+C)
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Run the boot sequence
startServer();
