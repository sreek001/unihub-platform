const fs = require('fs');
const path = require('path');
const { pool } = require('./db');

/**
 * Executes an entire SQL file inside a secure transaction block.
 */
async function executeSqlFile(filePath) {
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
    client.release();
  }
}

async function initDatabase() {
  try {
    // Run central Auth setup first
    console.log('Setting up Auth schema (users table + roles)...');
    try {
      await pool.query("ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'venue_admin'");
      console.log('🔹 Added venue_admin to user_role enum if it existed.');
    } catch (e) {
      console.log('Note: ALTER TYPE user_role skipped/failed (expected on fresh setup):', e.message);
    }
    const authPath = path.join(__dirname, 'modules/auth/auth.sql');
    await executeSqlFile(authPath);
    console.log('🔹 Auth infrastructure successfully verified.');

    console.log('Restructuring Booking database via transaction script...');
    const bookingPath = path.join(__dirname, 'modules/booking/booking.sql');
    await executeSqlFile(bookingPath);
    console.log('🔹 Booking schema successfully verified and up to date.');

    console.log('Restructuring Lost & Found database via transaction script...');
    const lostFoundPath = path.join(__dirname, 'modules/lostFound/lostFound.sql');
    await executeSqlFile(lostFoundPath);
    console.log('🔹 Lost & Found schema successfully verified and up to date.');

    console.log('✅ Database initialization and seeding completed successfully!');
  } catch (err) {
    console.error('❌ SQL Migration failed globally:', err.message);
    throw err;
  }
}

module.exports = {
  initDatabase,
};