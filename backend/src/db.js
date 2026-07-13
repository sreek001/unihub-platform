const { Pool } = require('pg');

const connectionString = "postgresql://postgres:siOKbrpSuT25Qnec@db.rxkkzmugyrzyrmgcfiph.supabase.co:5432/postgres";

const pool = new Pool({
  connectionString: connectionString,
  ssl: { rejectUnauthorized: false }
});

// A wrapper query function to handle direct execution
const baseQuery = function (text, params) {
  return pool.query(text, params);
};

// Explicit client properties to satisfy controllers destructuring or calling .connect()
const dbInterface = {
  query: baseQuery,
  connect: async () => {
    const client = await pool.connect();
    return client;
  },
  pool: pool,
  options: {}
};

// Bind all methods directly onto the main function export
const db = Object.assign(baseQuery, dbInterface);

// Force global prototype definitions so destructured require calls don't return undefined
db.default = db;

module.exports = db;