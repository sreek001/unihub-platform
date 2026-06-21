const { Pool } = require('pg');

// In production, we read the connection string securely from the hosting environment
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Simple validation logging on boot
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Cloud Database connection failed:', err.message);
  } else {
    console.log('🚀 Connected to live production Supabase instance successfully.');
    release();
  }
});

module.exports = pool;