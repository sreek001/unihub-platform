const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT) || 443,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Cloud Database connection failed:', err.message);
  } else {
    console.log('🚀 Connected to live production Supabase instance successfully over secure discrete parameters.');
    release();
  }
});

module.exports = pool;