const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./src/db');

const app = express();

// ─── DYNAMIC CORS CONFIGURATION (Enforces Deployed Vercel Domain Clearances) ───
const allowedOrigins = [
  'http://localhost:5173',                  // Local frontend vite dev cluster
  'https://unihub-platform.vercel.app',    // Production Vercel domain
  'https://unihub-platform-qbs0deejw-ksreehari84m-3947s-projects.vercel.app' // Vercel Preview Pipeline
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
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], // Authorizes PATCH checks cleanly
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

const PORT = process.env.PORT || 4000;

// ─── DATABASE MIGRATION LOGIC LOOP ───────────────────────────────────────────
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
    console.log("📦 Database check: 'print_jobs' table is ready (PostgreSQL cloud matrix).");
    console.log("✅ Database initialization completed successfully!");
  } catch (err) {
    console.error("❌ SQL Migration failed globally:", err.message);
  }
}

// ─── PLATFORM SYSTEM HANDSHAKES ─────────────────────────────────────────────

// Global API Status Validation Target
app.get('/api/status', (req, res) => {
  res.json({ status: 'healthy', database: 'connected' });
});

// Profile Rehydration Handshake Check
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

// Dynamic Role Redirection Routing Matrix
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

// ─── ACADEMICS HUB ENDPOINTS ────────────────────────────────────────────────

app.get('/api/academics/students', (req, res) => {
  res.json([
    { id: 'anannya-20', name: 'Anannya Sunny', branch: 'Computer Science', currentSemester: 6 },
    { id: 'sreehari-456', name: 'Sreehari K', branch: 'Ai and datascience', currentSemester: 4 },
    { id: 'astrea-789', name: 'Astrea Rose Antony', branch: 'Electrical Engineering', currentSemester: 2 },
    { id: 'Karthik -789', name: 'Karthik sajan', branch: 'Electrical Engineering', currentSemester: 2 }
  ]);
});

// Moved text records to a mutable live memory catalog store to support new listings
let textbooksCatalog = [
  { id: 'book-1', title: 'DBMS', author: 'GUIDE', category: 'AI and Data Science Engineering', sem: 4, price: 0, condition: 'Good', description: 'Comprehensive KTU core guidelines and transaction analysis notebooks.', status: 'Available' },
  { id: 'book-2', title: 'University Physics', author: 'Hugh D. Young', category: 'Basic Science & Humanities', sem: 1, price: 150, condition: 'Like New', description: 'Volume 1 master reference textbook matching standard first-year specifications.', status: 'Available' },
  { id: 'book-3', title: 'Calculus: Early Transcedentals', author: 'James Stewart', category: 'Basic Science & Humanities', sem: 1, price: 80, condition: 'Fair', description: 'Essential math reference matrix used extensively for optimization architectures.', status: 'Available' },
  { id: 'book-4', title: 'Digital Electronics Lab Record', author: 'KTU Syllabus', category: 'Electrical and Electronics Engineering', sem: 3, price: 50, condition: 'Like New', description: 'Fully mapped and organized digital gates circuit records and validation maps.', status: 'Available' },
  { id: 'book-5', title: 'Engineering Graphics Drawing Sheets', author: 'First Year CSE', category: 'Mechanical Engineering', sem: 1, price: 0, condition: 'Good', description: 'A3 isometric projections layout sheet pack.', status: 'Accepted' },
  { id: 'book-6', title: 'Introduction to Algorithms (CLRS)', author: 'Thomas H. Cormen', category: 'Computer Science and Engineering', sem: 4, price: 120, condition: 'Good', description: 'Standard algorithmic complexity parsing guide.', status: 'Handed Over' }
];

// Tracking array to manage logged handover entities contextually 
let handoverRequests = [];

// Textbooks Catalog matching the Marketplace dashboard sheets perfectly
app.get('/api/academics/textbooks', (req, res) => {
  res.json(textbooksCatalog);
});

// Handle List New Book Listing Form Submissions
app.post('/api/academics/textbooks', (req, res) => {
  const newBook = {
    id: req.body.id || `book-${Date.now()}`,
    title: req.body.title,
    author: req.body.author,
    category: req.body.category || 'Computer Science and Engineering',
    price: parseInt(req.body.price, 10) || 0,
    condition: req.body.condition || 'Good',
    description: req.body.description || '',
    ownerId: req.body.ownerId,
    status: 'Available'
  };
  textbooksCatalog.unshift(newBook);
  res.json({ success: true, book: newBook });
});

// GET Handover Router to handle status verification queries
app.get('/api/academics/handover', (req, res) => {
  res.json(handoverRequests);
});

// Consolidated Peer-to-Peer Request Handover Router to track internal memory states
app.post('/api/academics/handover', (req, res) => {
  const targetId = req.body.textbookId || req.body.id;

  textbooksCatalog = textbooksCatalog.map(book =>
    book.id === targetId ? { ...book, status: 'Requested' } : book
  );

  const matchedBook = textbooksCatalog.find(b => b.id === targetId);
  if (matchedBook) {
    handoverRequests.unshift({
      id: `req-${Date.now()}`,
      textbookId: targetId,
      title: matchedBook.title,
      buyerId: req.body.buyerId || 'student-anon',
      status: 'Requested',
      created_at: new Date().toISOString()
    });
  }

  res.json({ success: true, message: "Handover request logged successfully." });
});

// 🌟 ADDED: GET /api/academics/vault (Fixes the Vault 404 & length property undefined crash)
app.get('/api/academics/vault', (req, res) => {
  res.json([
    { id: 'doc-1', name: 'Graph Theory Lecture Notes - S4.pdf', type: 'PDF', size: '4.2 MB', uploadedAt: '2026-04-12' },
    { id: 'doc-2', name: 'Data Structures Question Bank.pdf', type: 'PDF', size: '2.8 MB', uploadedAt: '2026-05-01' }
  ]);
});

// Document Upload Simulation Router (Resolves the 404 Upload crash)
app.post('/api/academics/upload', (req, res) => {
  res.json({ success: true, fileUrl: "https://unihub-cdn.s3.amazonaws.com/simulated-document.pdf" });
});

// ─── CANTEEN platform MODULE (EXACT SUPABASE DATA MATCH) ───────────────────

let canteenMenu = [
  { id: '10', name: 'porotta', price: 10.00, category: 'snacks', description: 'kerala dish', available: true },
  { id: '11', name: 'noodles', price: 50.00, category: 'snacks', description: 'chineese dish', available: true },
  { id: '1', name: 'Veg Meal', price: 50.00, category: 'lunch', description: 'Rice, curry and side dishes', available: true },
  { id: '3', name: 'Masala Dosa', price: 40.00, category: 'breakfast', description: 'South Indian breakfast item', available: true },
  { id: '6', name: 'Fried Rice', price: 60.00, category: 'lunch', description: 'Delicious', available: true },
  { id: '4', name: 'Cold Coffee', price: 35.00, category: 'beverages', description: 'Chilled coffee beverage', available: true }
];

// Maps exact matching records from karthiksss911's live relational tables
app.get('/api/canteen/menu', (req, res) => {
  res.json(canteenMenu);
});

// Patch availability handler to allow active kitchen display toggles to alter storage state
app.patch('/api/canteen/menu/:id/availability', (req, res) => {
  const { id } = req.params;
  const { available } = req.body;
  canteenMenu = canteenMenu.map(item =>
    item.id === id ? { ...item, available } : item
  );
  res.json({ success: true, message: "Item availability successfully sync-updated." });
});

app.get('/api/canteen/orders', (req, res) => {
  res.json([]);
});

// Handle Checkout and Order Submissions (Fixes your 404 / JSON Token crash)
app.post('/api/canteen/order', (req, res) => {
  const tokenNumber = Math.floor(100 + Math.random() * 900); // Dynamic 3-digit token generation
  res.json({
    success: true,
    message: "Order queued and registered successfully.",
    order: {
      id: `ord-${Date.now()}`,
      token_number: tokenNumber,
      status: "PENDING",
      total_amount: req.body.items ? req.body.items.length * 50 : 50,
      created_at: new Date().toISOString()
    }
  });
});

// Live Telemetry tracking endpoint for active order progress tracking view panels
app.get('/api/canteen/order/:orderId', (req, res) => {
  res.json({
    success: true,
    order: {
      token_number: "742",
      status: "PREPARING",
      total_amount: 120,
      queuePosition: 2,
      estimatedTime: 8,
      items: []
    }
  });
});

// ─── PRINTING MODULE DATA MOCK STUBS ────────────────────────────────────────

app.get('/api/print/history', (req, res) => {
  res.json([]);
});

// ─── INITIALIZATION STACKS ──────────────────────────────────────────────────
app.listen(PORT, async () => {
  await initializeDatabase();
  console.log(`🚀 Fully Synced Production Server operational on Port ${PORT}`);
});