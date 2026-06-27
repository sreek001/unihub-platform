const { Pool } = require('pg');
const pool = new Pool({
  connectionString: "postgresql://postgres:siOKbrpSuT25Qnec@db.rxkkzmugyrzyrmgcfiph.supabase.co:5432/postgres",
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000
});
pool.Promise = global.Promise;
module.exports = pool;