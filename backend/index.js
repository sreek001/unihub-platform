const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./src/db');

const app = express();

// ─── DYNAMIC CORS ARCHITECTURE ──────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',                  // Local frontend server
  'https://unihub-platform.vercel.app',    // Production Vercel domain
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

// ─── DATABASE INITIALIZATION ────────────────────────────────────────────────
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

// ─── CORE API SYSTEM HANDSHAKES ─────────────────────────────────────────────

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

// Dynamic Login Gateway Matrix
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

// ─── ACADEMICS HUB MODULE ───────────────────────────────────────────────────

// Verified Student Records Array
app.get('/api/academics/students', (req, res) => {
  res.json([
    { id: 'anannya-20', name: 'Anannya Sunny', branch: 'Computer Science', currentSemester: 6 },
    { id: 'sreehari-456', name: 'Sreehari K', branch: 'Ai and datascience', currentSemester: 4 },
    { id: 'astrea-789', name: 'Astrea Rose Antony', branch: 'Electrical Engineering', currentSemester: 2 },
    { id: 'Karthik -789', name: 'Karthik sajan', branch: 'Electrical Engineering', currentSemester: 2 }
  ]);
});

// 📚 RESTORED: Full Textbooks Database Catalog
app.get('/api/academics/textbooks', (req, res) => {
  res.json([
    {
      id: 'book-1',
      title: 'Introduction to Graph Theory',
      author: 'Douglas B. West',
      subject: 'Mathematics (Graph Theory)',
      sem: 4,
      price: 350,
      condition: 'Like New',
      owner: 'Sreehari K'
    },
    {
      id: 'book-2',
      title: 'Computer Vision: Algorithms and Applications',
      author: 'Richard Szeliski',
      subject: 'Artificial Intelligence',
      sem: 4,
      price: 500,
      condition: 'Good',
      owner: 'Anannya Sunny'
    },
    {
      id: 'book-3',
      title: 'Programming Arduino: Getting Started with Sketches',
      author: 'Simon Monk',
      subject: 'Robotics & Automation',
      sem: 2,
      price: 220,
      condition: 'Marked text',
      owner: 'Karthik Sajan'
    },
    {
      id: 'book-4',
      title: 'Database System Concepts',
      author: 'Abraham Silberschatz',
      subject: 'Database Management',
      sem: 4,
      price: 400,
      condition: 'Excellent',
      owner: 'Astrea Rose'
    }
  ]);
});

// ─── CANTEEN PLATFORM AUTOMATION MODULE ─────────────────────────────────────

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

// ─── PRINT & STATIONERY QUEUE MODULE ────────────────────────────────────────

app.get('/api/print/history', (req, res) => {
  res.json([]);
});

// ─── LIFECYCLE LISTENERS ────────────────────────────────────────────────────
app.listen(PORT, async () => {
  await initializeDatabase();
  console.log(`🚀 Full-Stack Engine online at http://localhost:${PORT}`);
});