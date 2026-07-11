const { Pool } = require('pg');

// Uses ACADEMICS_DB_URL — now routed through Port 443 pooler (see backend/.env)
const pool = new Pool({
  connectionString: process.env.ACADEMICS_DB_URL,
  ssl: {
    rejectUnauthorized: false
  },
  connectionTimeoutMillis: 15000 // Generous timeout for cloud pooler round-trip
});

pool.on('error', (err) => {
  console.error('[Academics DB] Unexpected pool error:', err.message);
});

const query = (text, params) => pool.query(text, params);

module.exports = { pool, query };