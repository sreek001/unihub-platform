const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL || "postgresql://postgres.wzojlmakqklkdwnbjafg:UniHubSecureDb2026!@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres";

const pool = new Pool({
  connectionString,
  ssl: connectionString.includes('supabase.com') ? { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: 3000
});

// Suppress unhandled errors on idle clients so they don't crash the server
pool.on('error', (err) => {
  console.warn('[Postgres Pool Warning]', err.message || err);
});

pool.query = pool.query.bind(pool);
pool.pool = pool;

module.exports = pool;