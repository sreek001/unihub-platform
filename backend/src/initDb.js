const fs = require('fs');
const path = require('path');
const db = require('./db');

/**
 * Initializes the database schemas and seeds initial values by executing
 * the modular raw SQL files directly.
 */
async function initDatabase() {
  try {
    console.log('Checking database connection & executing migrations...');
    const lostFoundSql = fs.readFileSync(
      path.join(__dirname, 'modules/lostFound/lostFound.sql'),
      'utf8'
    );
    await db.query(lostFoundSql);
    console.log('✅ Database initialization and seeding completed successfully!');
  } catch (err) {
    console.warn('⚠️  Postgres connection not available:', err.message || err);
    console.warn('⚡ In-memory simulation fallback is active for all modules.');
  }
}

module.exports = {
  initDatabase,
};
