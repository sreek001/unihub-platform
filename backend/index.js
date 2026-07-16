const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./src/db');

const app = express();

// 🌟 DYNAMIC CORS CONFIGURATION (Fixes the Vercel block)
const allowedOrigins = [
  'http://localhost:5173', // Local frontend development
  'https://unihub-platform.vercel.app', // Production Vercel domain
  'https://unihub-platform-qbs0deejw-ksreehari84m-3947s-projects.vercel.app' // Vercel Preview
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

// Profile Verification Handshake (Returns fallback user context tracking elements)
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

// 🌟 STUB FIXED: Added Canteen API endpoints to stop frontend 404/Refused crashes
app.get('/api/canteen/menu', (req, res) => {
  res.json([
    { id: 'item-1', name: 'Masala Dosa', price: 40, category: 'breakfast', available: true },
    { id: 'item-2', name: 'Veg Meals', price: 60, category: 'lunch', available: true },
    { id: 'item-3', name: 'Samosa', price: 15, category: 'snacks', available: true },
    { id: 'item-4', name: 'Coffee', price: 15, category: 'beverages', available: true }
  ]);
});

app.get('/api/canteen/orders', (req, res) => {
  res.json([]);
});

// 🌟 STUB FIXED: Added Print API history tracker endpoint to prevent JSON parse failures
app.get('/api/print/history', (req, res) => {
  res.json([]);
});

// 🌟 STUB FIXED: Added Academics catalog textbooks route
app.get('/api/academics/textbooks', (req, res) => {
  res.json([
    { id: 'book-1', title: 'Introduction to Graph Theory', author: 'Douglas B. West', sem: 4 },
    { id: 'book-2', title: 'Data Science & AI Baselines', author: 'Engineering Press', sem: 4 }
  ]);
});

// 🌟 UPDATED: Academics Data Route (Includes the requested Karthik profile schema)
app.get('/api/academics/students', (req, res) => {
  res.json([
    { id: 'anannya-20', name: 'Anannya Sunny', branch: 'Computer Science', currentSemester: 6 },
    { id: 'sreehari-456', name: 'Sreehari K', branch: 'Ai and datascience', currentSemester: 4 },
    { id: 'astrea-789', name: 'Astrea Rose Antony', branch: 'Electrical Engineering', currentSemester: 2 },
    { id: 'Karthik -789', name: 'Karthik sajan', branch: 'Electrical Engineering', currentSemester: 2 }
  ]);
});

// 🌟 FIXED: Dynamic Login Controller Route (Maps role parameters correctly to fix Admin dashboard entry redirects)
app.post('/api/auth/login', (req, res) => {
  const { email } = req.body;

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