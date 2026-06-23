const { Pool } = require('pg');

/**
 * Self-contained PostgreSQL connection pool for the Booking module.
 * Reads configuration from environment variables.
 *
 * Required env vars:
 *   DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
 */
const pool = new Pool({
<<<<<<< HEAD
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
  console.error('[Booking DB] Unexpected pool error:', err.message);
=======
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  connectionTimeoutMillis: 5000 // ⏱️ Hard boundary: terminates hung connections after 5 seconds
});

// Safe event-driven error tracking that NEVER freezes the Node server
pool.on('error', (err) => {
  console.error('❌ Unexpected database pool error:', err.message);
>>>>>>> e85e018 (fix: restore connection string model with strict timeout guardrails)
});

module.exports = pool;
