const { Pool } = require('pg');

const pool = new Pool({
  connectionString: "postgresql://postgres.uiauztyhabdmvcqxbfby:UdUPb8yUOAFzvebtM5gZJQ_yBNZRFJ7@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true",
  ssl: {
    rejectUnauthorized: false
  },
  connectionTimeoutMillis: 10000
});

pool.Promise = global.Promise;

module.exports = pool;