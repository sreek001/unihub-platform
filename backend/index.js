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

app.get('/api/status', (req, res) => {
  res.json({ status: 'healthy', database: 'connected' });
});

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

app.get('/api/academics/students', (req, res) => {
  res.json([
    { id: 'anannya-20', name: 'Anannya Sunny', branch: 'Computer Science', currentSemester: 6 },
    { id: 'sreehari-456', name: 'Sreehari K', branch: 'Ai and datascience', currentSemester: 4 },
    { id: 'astrea-789', name: 'Astrea Rose Antony', branch: 'Electrical Engineering', currentSemester: 2 },
    { id: 'Karthik -789', name: 'Karthik sajan', branch: 'Electrical Engineering', currentSemester: 2 }
  ]);
});

// 📚 SYNCED: Textbooks Database precisely matching your live Marketplace view panels
app.get('/api/academics/textbooks', (req, res) => {
  res.json([
    {
      id: 'book-1',
      title: 'DBMS',
      author: 'GUIDE',
      subject: 'AI and Data Science Engineering',
      sem: 4,
      price: 0,
      condition: 'Good',
      description: 'Core concepts layout engine tracker asset modules.'
    },
    {
      id: 'book-2',
      title: 'University Physics',
      author: 'Hugh D. Young',
      subject: 'Basic Science & Humanities',
      sem: 1,
      price: 150,
      condition: 'Like New',
      description: 'Volume 1, covers mechanics, waves, and thermodynamics.'
    },
    {
      id: 'book-3',
      title: 'Calculus: Early Transcedentals',
      author: 'James Stewart',
      subject: 'Basic Science & Humanities',
      sem: 1,
      price: 80,
      condition: 'Fair',
      description: 'Essential calculus reference for early semesters.'
    },
    {
      id: 'book-4',
      title: 'Digital Electronics Lab Record',
      author: 'KTU Syllabus',
      subject: 'Electrical and Electronics Engineering',
      sem: 3,
      price: 50,
      condition: 'Like New',
      description: 'Fully completed and signed lab record with logic gates diagrams.'
    },
    {
      id: 'book-5',
      title: 'Engineering Graphics Drawing Sheets',
      author: 'First Year CSE',
      subject: 'Mechanical Engineering',
      sem: 1,
      price: 0,
      condition: 'Good',
      description: 'Standard A3 drawing sheets, containing basic projections.',
      status: 'Accepted'
    },
    {
      id: 'book-6',
      title: 'Introduction to Algorithms (CLRS)',
      author: 'Thomas H. Cormen',
      subject: 'Computer Science and Engineering',
      sem: 4,
      price: 120,
      condition: 'Good',
      description: 'Standard algorithms textbook, slightly highlighted pages.',
      status: 'Handed Over'
    }
  ]);
});

// ─── CANTEEN PLATFORM MODULE (100% SUPABASE ALIGNED) ─────────────────────────

// 🍕 SYNCED: Maps directly to karthiksss911's SQL schema rules and entity identifiers
app.get('/api/canteen/menu', (req, res) => {
  res.json([
    { id: '10', name: 'porotta', price: 10.00, category: 'snacks', description: 'kerala dish', available: true },
    { id: '11', name: 'noodles', price: 50.00, category: 'snacks', description: 'chineese dish', available: true },
    { id: '1', name: 'Veg Meal', price: 50.00, category: 'lunch', description: 'Rice, curry and side dishes', available: true },
    { id: '3', name: 'Masala Dosa', price: 40.00, category: 'breakfast', description: 'South Indian breakfast item', available: true },
    { id: '6', name: 'Fried Rice', price: 60.00, category: 'lunch', description: 'Delicious', available: true },
    { id: '4', name: 'Cold Coffee', price: 35.00, category: 'beverages', description: 'Chilled coffee beverage', available: true }
  ]);
});

app.get('/api/canteen/orders', (req, res) => {
  res.json([]);
});

// ─── PRINT MODULE ───────────────────────────────────────────────────────────

app.get('/api/print/history', (req, res) => {
  res.json([]);
});

// ─── LIFECYCLE LISTENERS ────────────────────────────────────────────────────
app.listen(PORT, async () => {
  await initializeDatabase();
  console.log(`🚀 Synced full-stack engine running on port ${PORT}`);
});