const fs = require('fs');
const path = require('path');
const db = require('./db');
const pool = db.pool || db;

/**
 * Executes an entire SQL file inside a secure transaction block.
 */
async function executeSqlFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const sqlText = fs.readFileSync(filePath, 'utf8').trim();
  if (!sqlText) return;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(sqlText);
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    if (client && client.release) client.release();
  }
}

async function initDatabase() {
  try {
    console.log('Checking database connection & executing migrations...');
    try {
      await pool.query("ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'venue_admin'");
    } catch (e) {}

    const authPath = path.join(__dirname, 'modules/auth/auth.sql');
    if (fs.existsSync(authPath)) await executeSqlFile(authPath);

    const bookingPath = path.join(__dirname, 'modules/booking/booking.sql');
    if (fs.existsSync(bookingPath)) await executeSqlFile(bookingPath);

    const lostFoundPath = path.join(__dirname, 'modules/lostFound/lostFound.sql');
    if (fs.existsSync(lostFoundPath)) await executeSqlFile(lostFoundPath);

    console.log('✅ Database initialization completed successfully!');
  } catch (err) {
    console.warn('⚠️  Database migrations skipped/simulated:', err.message || err);
    console.warn('⚡ In-memory simulation fallback is active for all modules.');
  }
}

module.exports = {
  initDatabase,
};