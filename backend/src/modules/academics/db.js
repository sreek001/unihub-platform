const centralDb = require('../../db');
const { Pool } = require('pg');

let pool = centralDb.pool || centralDb;
if (process.env.ACADEMICS_DB_URL) {
  try {
    pool = new Pool({
      connectionString: process.env.ACADEMICS_DB_URL,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 5000
    });
    pool.on('error', (err) => console.warn('[Academics DB]', err.message));
  } catch (e) {}
}

const query = (text, params) => pool.query(text, params);

module.exports = { pool, query };
module.exports.pool = pool;
module.exports.query = query;
