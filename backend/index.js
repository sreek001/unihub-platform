const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./src/db');

const app = express();

// DYNAMIC CORS CONFIGURATION
const allowedOrigins = [
  'http://localhost:5173',
  'https://unihub-platform.vercel.app',
  'https://unihub-platform-qbs0deejw-ksreehari84m-3947s-projects.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

const PORT = process.env.PORT || 4000;

async function initializeDatabase() {
  console.log("Setting up Auth schema (users table + roles)...");
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS print_jobs (
        id SERIAL PRIMARY KEY,
        filename TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("📦 Database check: 'print_jobs' table is ready.");
    console.log("✅ Database initialization completed successfully!");
  } catch (err) {
    console.error("❌ SQL Migration failed globally:", err.message);
  }
}

// Global API Status Route
app.get('/api/status', (req, res) => {
  res.json({ status: 'healthy', database: 'connected' });
});

// Profile Verification Handshake
app.get('/api/auth/me', (req, res) => {
  res.json({
    success: true,
    user: {
      id: 'sreehari-456',
      name: 'Sreehari K',
      email: 'student@unihub.com',
      role: 'student'
    }
  });
});

// Academics Data Route
app.get('/api/academics/students', (req, res) => {
  res.json([
    { id: 'anannya-20', name: 'Anannya Sunny', branch: 'Computer Science', currentSemester: 6 },
    { id: 'sreehari-456', name: 'Sreehari K', branch: 'Ai and datascience', currentSemester: 4 },
    { id: 'astrea-789', name: 'Astrea Rose Antony', branch: 'Electrical Engineering', currentSemester: 2 }
  ]);
});

// 🌟 FIXED: Dynamic Login Controller Route (Assigns correct role marker tags matching incoming emails)
app.post('/api/auth/login', (req, res) => {
  const { email } = req.body;

  // Parse role based on demo email structure definitions
  let userRole = 'student';
  let userName = 'Sreehari K';

  if (email === 'faculty@unihub.com') {
    userRole = 'faculty';
    userName = 'Prof. Faculty User';
  } else if (email === 'canteen@unihub.com') {
    userRole = 'canteen_admin';
    userName = 'Canteen Manager';
  } else if (email === 'xerox@unihub.com') {
    userRole = 'xerox_admin';
    userName = 'Print Station Operator';
  } else if (email === 'venue@unihub.com') {
    userRole = 'venue_admin';
    userName = 'Spatial Allocator Admin';
  }

  res.json({
    success: true,
    token: "mock_session_token_xyz",
    user: {
      id: `user-${userRole}`,
      name: userName,
      email: email || 'student@unihub.com',
      role: userRole
    }
  });
});

app.listen(PORT, async () => {
  await initializeDatabase();
  console.log(`🚀 Server safely processing metrics on http://localhost:${PORT}`);
});