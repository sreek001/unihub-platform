const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  database: process.env.DB_NAME || 'postgres',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  ssl: {
    rejectUnauthorized: false
  }
});

pool.on('error', (err) => {
  console.error('[Academics DB] Unexpected pool error:', err.message);
});

module.exports = pool;