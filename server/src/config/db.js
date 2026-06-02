/**
 * PostgreSQL Connection Configuration
 * Handles connection with pg pool, ssl fallback, and automated schema migrations.
 */
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');
const env = require('./env');

let pool = null;

/**
 * Connects to PostgreSQL with auto-migration of schema.sql.
 * @returns {Promise<void>}
 */
async function connectDB() {
  try {
    const isSupabase = env.databaseUrl && env.databaseUrl.includes('supabase');
    pool = new Pool({
      connectionString: env.databaseUrl,
      ssl: env.isProduction || isSupabase ? { rejectUnauthorized: false } : false,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    // Test connection
    const client = await pool.connect();
    logger.info('PostgreSQL connected: Supabase database');
    client.release();

    // Run schema migrations automatically
    const schemaPath = path.resolve(__dirname, 'schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');
    await pool.query(sql);
    logger.info('PostgreSQL database schemas verified/migrated successfully');
  } catch (error) {
    logger.error('PostgreSQL connection attempt failed', {
      error: error.message,
    });
    logger.error('Please verify your Supabase DATABASE_URL in server/.env is valid and active.');
    // Let nodemon handle restarts instead of killing process immediately to keep server log active
    throw error;
  }
}

/**
 * Gracefully disconnects from PostgreSQL.
 * @returns {Promise<void>}
 */
async function disconnectDB() {
  if (pool) {
    await pool.end();
    logger.info('PostgreSQL disconnected gracefully');
  }
}

/**
 * Helper to run query via the pool
 * @param {string} text
 * @param {Array} params
 * @returns {Promise<Object>}
 */
function query(text, params) {
  if (!pool) {
    throw new Error('Database pool not initialized. Call connectDB first.');
  }
  return pool.query(text, params);
}

module.exports = {
  connectDB,
  disconnectDB,
  query,
  getPool: () => pool,
};
