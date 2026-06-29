const { Pool } = require('pg');

const pool = new Pool({
  connectionString: "postgresql://postgres.uiauztyhabdmvcqxbfby:UdUPb8yUOAFzvebtM5gZJQ_yBNZRFJ7@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true",
  ssl: {
    rejectUnauthorized: false
  },
  connectionTimeoutMillis: 10000
});

pool.on('error', (err) => {
  console.error('[Canteen DB] Unexpected pg client pool error:', err.message);
});

pool.Promise = global.Promise;

module.exports = pool;