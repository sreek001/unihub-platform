const { Pool } = require('pg');

// 🌟 FIXED: Dynamically construct the connection URI if a single DATABASE_URL isn't provided
let connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  if (process.env.DB_USER && process.env.DB_PASSWORD && process.env.DB_HOST && process.env.DB_PORT && process.env.DB_DATABASE) {
    connectionString = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`;
  } else {
    throw new Error('FATAL: Neither DATABASE_URL nor complete separate DB environment variables are set. Check backend/.env');
  }
}

const pool = new Pool({
  connectionString: connectionString.split('?')[0], // Safely strips any trailing url parameters
  ssl: {
    rejectUnauthorized: false // Necessary for accepting Supabase self-signed certificates
  },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 15000
});

const query = (text, params) => pool.query(text, params);

module.exports = {
  query,
  pool
};