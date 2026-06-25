const { Pool } = require('pg');

/**
 * Self-contained PostgreSQL connection pool for the Booking module.
 * Reads configuration from environment variables.
 */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  connectionTimeoutMillis: 5000
});

// Safe event-driven error tracking that NEVER freezes the Node server
pool.on('error', (err) => {
  console.error('❌ Unexpected database pool error:', err.message);
});

module.exports = pool;