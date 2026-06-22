const { Pool } = require('pg');

/**
 * Self-contained PostgreSQL connection pool for the LostFound module.
 * Reads configuration from environment variables.
 */
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  database: process.env.DB_NAME || 'unihub',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('[LostFound DB] Unexpected pool error:', err.message);
});

module.exports = pool;
