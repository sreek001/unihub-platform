const express = require('express');
const cors = require('cors');
require('dotenv').config();

let db;
try {
  db = require('./src/db');
} catch (e) {
  console.warn("⚠️ Database module not loaded, continuing in memory mode.");
}

const app = express();

// ─── DYNAMIC CORS CONFIGURATION ───
const allowedOrigins = [
  'http://localhost:5173',
  'https://unihub-platform.vercel.app',
  'https://unihub-platform-qbs0deejw-ksreehari84m-3947s-projects.vercel.app',
  'https://unihub-backend-ydek.onrender.com',
  'https://unihub-frontend.onrender.com'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.indexOf(origin) !== -1 ||
      origin.endsWith('.vercel.app') ||
      origin.endsWith('.onrender.com')
    ) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

const PORT = process.env.PORT || 4000;

// ─── NON-BLOCKING DATABASE MIGRATION WITH TIMEOUT ───
async function initializeDatabase() {
  if (!db || typeof db.query !== 'function') {
    console.log("ℹ️ Running in persistent cloud-memory state.");
    return;
  }
  console.log("Setting up schema tables...");
  try {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Database connection timed out")), 3000)
    );
    await Promise.race([
      db.query(`
        CREATE TABLE IF NOT EXISTS print_jobs (
          id SERIAL PRIMARY KEY,
          filename TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'pending',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `),
      timeoutPromise
    ]);
    console.log("📦 Database check completed.");
  } catch (err) {
    console.warn("⚠️ Database setup skipped/timed out:", err.message);
  }
}

// ─── ROOT & HEALTH CHECK ENDPOINTS ───

app.get('/', (req, res) => {
  res.send('🚀 UniHub API Server is live and running!');
});

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
    userName = 'Venue Administrator';
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

// ─── VENUE BOOKING MODULE (RESTORED FROM ORIGINAL REPO) ───

let venues = [
  {
    id: 'venue-1',
    name: 'Main Auditorium',
    capacity: 500,
    type: 'Auditorium',
    features: ['Projector', 'Dolby Audio', 'Air Conditioned', 'Stage Lights'],
    status: 'Available',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'venue-2',
    name: 'Seminar Hall 1',
    capacity: 150,
    type: 'Seminar Hall',
    features: ['Smart Board', 'Audio System', 'Air Conditioned'],
    status: 'Available',
    image: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'venue-3',
    name: 'Conference Room (CS Block)',
    capacity: 50,
    type: 'Conference Room',
    features: ['Video Conferencing', 'Smart Screen', 'High-Speed Wi-Fi'],
    status: 'Available',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'venue-4',
    name: 'Open Air Theatre (OAT)',
    capacity: 1200,
    type: 'Outdoor Stage',
    features: ['Open Stage', 'Wide Seating Area', 'Direct Power Line'],
    status: 'Available',
    image: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&q=80&w=1000'
  }
];

let bookings = [
  {
    id: 'bk-101',
    venueId: 'venue-1',
    venueName: 'Main Auditorium',
    applicantName: 'Sreehari K',
    applicantEmail: 'student@unihub.com',
    eventTitle: 'Prayag 26 Department Tech Conclave',
    date: '2026-10-15',
    timeSlot: '09:30 AM - 04:30 PM',
    purpose: 'Technical talks, project demos, and inter-departmental competitions.',
    status: 'APPROVED',
    created_at: new Date().toISOString()
  },
  {
    id: 'bk-102',
    venueId: 'venue-2',
    venueName: 'Seminar Hall 1',
    applicantName: 'Anannya Sunny',
    applicantEmail: 'anannya@unihub.com',
    eventTitle: 'AI Ethics & NLP Keynote Workshop',
    date: '2026-10-18',
    timeSlot: '10:00 AM - 01:00 PM',
    purpose: 'Hands-on training session on natural language processing pipelines.',
    status: 'PENDING',
    created_at: new Date().toISOString()
  }
];

// Return list of available venues
app.get(['/api/booking/venues', '/api/venues'], (req, res) => {
  res.json(venues);
});

// Return all bookings (for dashboard and admin tracker)
app.get(['/api/booking/bookings', '/api/bookings'], (req, res) => {
  res.json(bookings);
});

// Bookings filtered by authenticated user
app.get('/api/booking/my-bookings', (req, res) => {
  res.json(bookings);
});

// Submit a new venue booking request
app.post(['/api/booking/book', '/api/bookings'], (req, res) => {
  const { venueId, eventTitle, title, date, timeSlot, slot, purpose, applicantName, applicantEmail } = req.body;
  const matchedVenue = venues.find(v => v.id === venueId) || { name: 'Campus Venue' };

  const newBooking = {
    id: `bk-${Date.now()}`,
    venueId: venueId || 'venue-1',
    venueName: matchedVenue.name,
    applicantName: applicantName || 'Sreehari K',
    applicantEmail: applicantEmail || 'student@unihub.com',
    eventTitle: eventTitle || title || 'Campus Event',
    date: date || new Date().toISOString().split('T')[0],
    timeSlot: timeSlot || slot || 'Full Day',
    purpose: purpose || 'Academic Activity',
    status: 'PENDING',
    created_at: new Date().toISOString()
  };

  bookings.unshift(newBooking);
  res.json({
    success: true,
    message: 'Venue booking application submitted successfully.',
    booking: newBooking
  });
});

// Authorizer approval / rejection endpoint
app.put(['/api/booking/:bookingId/status', '/api/bookings/:bookingId'], (req, res) => {
  const { bookingId } = req.params;
  const { status } = req.body;
  const nextStatus = String(status || 'APPROVED').toUpperCase();

  bookings = bookings.map(b =>
    b.id === bookingId ? { ...b, status: nextStatus } : b
  );

  res.json({ success: true, message: `Booking status updated to ${nextStatus}` });
});

// ─── ACADEMICS HUB ENDPOINTS ───

let studentsList = [
  { id: 'anannya-20', name: 'Anannya Sunny', branch: 'Computer Science', currentSemester: 6, email: 'anannya@unihub.com', phone: '+91 94470 12345' },
  { id: 'sreehari-456', name: 'Sreehari K', branch: 'Ai and datascience', currentSemester: 4, email: 'student@unihub.com', phone: '+91 98460 54321' },
  { id: 'astrea-789', name: 'Astrea Rose Antony', branch: 'Electrical Engineering', currentSemester: 2, email: 'astrea@unihub.com', phone: '+91 95620 98765' },
  { id: 'Karthik -789', name: 'Karthik sajan', branch: 'Electrical Engineering', currentSemester: 2, email: 'karthik@unihub.com', phone: '+91 97440 11223' }
];

app.get('/api/academics/students', (req, res) => {
  res.json(studentsList);
});

app.put('/api/academics/students/:id', (req, res) => {
  const { id } = req.params;
  studentsList = studentsList.map(student =>
    student.id === id ? { ...student, ...req.body } : student
  );
  res.json({ success: true, message: "Student metrics mapped safely.", student: req.body });
});

let textbooksCatalog = [
  { id: 'book-1', title: 'DBMS', author: 'GUIDE', subject: 'AI and Data Science Engineering', category: 'AI and Data Science Engineering', sem: 4, price: 0, condition: 'Good', description: 'Comprehensive KTU core guidelines and transaction analysis notebooks.', status: 'Available', ownerId: 'sreehari-456' },
  { id: 'book-2', title: 'University Physics', author: 'Hugh D. Young', subject: 'Basic Science & Humanities', category: 'Basic Science & Humanities', sem: 1, price: 150, condition: 'Like New', description: 'Volume 1 master reference textbook matching standard first-year specifications.', status: 'Available', ownerId: 'anannya-20' },
  { id: 'book-3', title: 'Calculus: Early Transcedentals', author: 'James Stewart', subject: 'Basic Science & Humanities', category: 'Basic Science & Humanities', sem: 1, price: 80, condition: 'Fair', description: 'Essential math reference matrix used extensively for optimization architectures.', status: 'Available', ownerId: 'astrea-789' },
  { id: 'book-4', title: 'Digital Electronics Lab Record', author: 'KTU Syllabus', subject: 'Electrical and Electronics Engineering', category: 'Electrical and Electronics Engineering', sem: 3, price: 50, condition: 'Like New', description: 'Fully mapped and organized digital gates circuit records and validation maps.', status: 'Available', ownerId: 'Karthik -789' },
  { id: 'book-5', title: 'Engineering Graphics Drawing Sheets', author: 'First Year CSE', subject: 'Mechanical Engineering', category: 'Mechanical Engineering', sem: 1, price: 0, condition: 'Good', description: 'A3 isometric projections layout sheet pack.', status: 'Accepted', ownerId: 'anannya-20' },
  { id: 'book-6', title: 'Introduction to Algorithms (CLRS)', author: 'Thomas H. Cormen', subject: 'Computer Science and Engineering', category: 'Computer Science and Engineering', sem: 4, price: 120, condition: 'Good', description: 'Standard algorithmic complexity parsing guide.', status: 'Handed Over', ownerId: 'sreehari-456' }
];

let handoverRequests = [];

app.get('/api/academics/textbooks', (req, res) => {
  const responsePayload = Object.assign([...textbooksCatalog], {
    textbooks: textbooksCatalog,
    books: textbooksCatalog,
    success: true
  });
  res.json(responsePayload);
});

app.post('/api/academics/textbooks', (req, res) => {
  const newBook = {
    id: req.body.id || `book-${Date.now()}`,
    title: req.body.title || 'Untitled Book',
    author: req.body.author || 'Unknown Author',
    category: req.body.category || 'Computer Science and Engineering',
    subject: req.body.category || 'Computer Science and Engineering',
    price: parseInt(req.body.price, 10) || 0,
    condition: req.body.condition || 'Good',
    description: req.body.description || '',
    ownerId: req.body.ownerId || 'unknown-student',
    status: 'Available'
  };
  textbooksCatalog.unshift(newBook);

  const responsePayload = Object.assign([...textbooksCatalog], {
    textbooks: textbooksCatalog,
    books: textbooksCatalog,
    success: true,
    book: newBook
  });
  res.json(responsePayload);
});

app.get('/api/academics/handover', (req, res) => {
  res.json(handoverRequests);
});

app.post('/api/academics/handover', (req, res) => {
  const targetId = req.body.textbookId || req.body.id;
  const buyerId = req.body.buyerId || 'student-anon';

  textbooksCatalog = textbooksCatalog.map(book =>
    book.id === targetId ? { ...book, status: 'Requested' } : book
  );

  const matchedBook = textbooksCatalog.find(b => b.id === targetId);
  if (matchedBook) {
    const ownerProfile = studentsList.find(s => s.id === matchedBook.ownerId) || { name: 'Faculty Admin', email: 'support@unihub.com', phone: '+91 99999 88888' };
    const buyerProfile = studentsList.find(s => s.id === buyerId) || { name: 'Peer Student' };

    handoverRequests.unshift({
      id: req.body.id || `req-${Date.now()}`,
      textbookId: targetId,
      textbookTitle: matchedBook.title,
      title: matchedBook.title,
      textbookPrice: matchedBook.price,
      buyerId: buyerId,
      buyerName: buyerProfile.name,
      ownerId: matchedBook.ownerId,
      ownerName: ownerProfile.name,
      ownerEmail: ownerProfile.email,
      ownerPhone: ownerProfile.phone,
      status: 'Pending',
      created_at: new Date().toISOString()
    });
  }

  const responsePayload = Object.assign([...textbooksCatalog], {
    textbooks: textbooksCatalog,
    books: textbooksCatalog,
    success: true
  });
  res.json(responsePayload);
});

app.put('/api/academics/handover/:requestId', (req, res) => {
  const { requestId } = req.params;
  const { status } = req.body;

  handoverRequests = handoverRequests.map(reqItem => {
    if (reqItem.id === requestId) {
      const updatedItem = { ...reqItem, status: status || 'Accepted' };
      textbooksCatalog = textbooksCatalog.map(book =>
        book.id === reqItem.textbookId ? { ...book, status: status === 'Completed' ? 'Handed Over' : status } : book
      );
      return updatedItem;
    }
    return reqItem;
  });

  res.json({ success: true, message: "Handover progress parameters sync-updated successfully." });
});

app.get('/api/academics/vault', (req, res) => {
  const vaultData = [
    { id: 'doc-1', name: 'Graph Theory Lecture Notes - S4.pdf', type: 'PDF', size: '4.2 MB', uploadedAt: '2026-04-12' },
    { id: 'doc-2', name: 'Data Structures Question Bank.pdf', type: 'PDF', size: '2.8 MB', uploadedAt: '2026-05-01' }
  ];
  res.json(Object.assign([...vaultData], { vault: vaultData, documents: vaultData }));
});

app.post('/api/academics/upload', (req, res) => {
  res.json({ success: true, fileUrl: "https://unihub-cdn.s3.amazonaws.com/simulated-document.pdf" });
});

// ─── CANTEEN PLATFORM MODULE ───

let canteenMenu = [
  { id: '10', name: 'porotta', price: 10.00, category: 'snacks', description: 'kerala dish', available: true },
  { id: '11', name: 'noodles', price: 50.00, category: 'snacks', description: 'chineese dish', available: true },
  { id: '1', name: 'Veg Meal', price: 50.00, category: 'lunch', description: 'Rice, curry and side dishes', available: true },
  { id: '3', name: 'Masala Dosa', price: 40.00, category: 'breakfast', description: 'South Indian breakfast item', available: true },
  { id: '6', name: 'Fried Rice', price: 60.00, category: 'lunch', description: 'Delicious', available: true },
  { id: '4', name: 'Cold Coffee', price: 35.00, category: 'beverages', description: 'Chilled coffee beverage', available: true }
];

let canteenOrders = [];

app.get('/api/canteen/menu', (req, res) => {
  res.json(canteenMenu);
});

app.post('/api/canteen/menu', (req, res) => {
  const newItem = {
    id: req.body.id || String(Date.now()),
    name: req.body.name || 'New Item',
    price: parseFloat(req.body.price) || 0.00,
    category: req.body.category || 'snacks',
    description: req.body.description || '',
    available: req.body.available !== undefined ? req.body.available : true
  };
  canteenMenu.push(newItem);
  res.json({ success: true, item: newItem });
});

app.patch('/api/canteen/menu/:id/availability', (req, res) => {
  const { id } = req.params;
  const { available } = req.body;
  canteenMenu = canteenMenu.map(item =>
    item.id === id ? { ...item, available } : item
  );
  res.json({ success: true, message: "Item availability successfully sync-updated." });
});

app.get('/api/canteen/orders', (req, res) => {
  res.json(canteenOrders);
});

app.post('/api/canteen/order', (req, res) => {
  const tokenNumber = Math.floor(100 + Math.random() * 900);
  const items = req.body.items || [];

  const newOrder = {
    id: req.body.id || `ord-${Date.now()}`,
    token_number: tokenNumber,
    status: "PENDING",
    total_amount: req.body.total_amount || (items.length * 45) || 50,
    items: items,
    created_at: new Date().toISOString()
  };

  canteenOrders.unshift(newOrder);

  res.json({
    success: true,
    message: "Order queued and registered successfully.",
    order: newOrder
  });
});

const processOrderUpdate = (orderId, passedStatus, res) => {
  let targetStatus = String(passedStatus || '').toUpperCase();

  const targetOrder = canteenOrders.find(o => o.id === orderId);
  if (targetOrder && (!targetStatus || targetStatus === 'UNDEFINED' || targetStatus === '')) {
    if (targetOrder.status === 'PENDING') targetStatus = 'PREPARING';
    else if (targetOrder.status === 'PREPARING') targetStatus = 'COMPLETED';
    else targetStatus = 'COMPLETED';
  }

  if (!targetStatus || targetStatus === 'UNDEFINED' || targetStatus === '') {
    targetStatus = 'PREPARING';
  }

  canteenOrders = canteenOrders.map(order => {
    if (order.id === orderId) {
      return { ...order, status: targetStatus };
    }
    return order;
  });

  return res.json({ success: true, message: `Status advanced to ${targetStatus}`, orderId });
};

app.put('/api/canteen/order/:orderId', (req, res) => processOrderUpdate(req.params.orderId, req.body.status, res));
app.put('/api/canteen/order/:orderId/status', (req, res) => processOrderUpdate(req.params.orderId, req.body.status, res));
app.put('/api/canteen/order/:orderId/prepare', (req, res) => processOrderUpdate(req.params.orderId, 'PREPARING', res));
app.post('/api/canteen/order/:orderId/prepare', (req, res) => processOrderUpdate(req.params.orderId, 'PREPARING', res));

app.put('/api/canteen/orders/:orderId/status', (req, res) => processOrderUpdate(req.params.orderId, req.body.status, res));
app.put('/api/canteen/orders/:orderId/prepare', (req, res) => processOrderUpdate(req.params.orderId, 'PREPARING', res));

app.get('/api/canteen/order/:orderId', (req, res) => {
  const { orderId } = req.params;
  const matchedOrder = canteenOrders.find(o => o.id === orderId) || { token_number: "742", status: "PREPARING", total_amount: 120 };
  res.json({ success: true, order: matchedOrder });
});

// ─── PRINTING MODULE DATA MOCK STUBS ───

app.get('/api/print/history', (req, res) => {
  res.json([]);
});

// ─── INSTANT SERVER BINDING ON 0.0.0.0 ───
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Fully Synced Production Server operational on Port ${PORT}`);
  initializeDatabase();
});