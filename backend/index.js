require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

const bookingRoutes = require('./src/modules/booking/bookingRoutes');
const printRoutes = require('./src/modules/booking/print/print.routes');
const canteenRoutes = require('./src/modules/canteen/canteenRoutes');
const lostFoundRoutes = require('./src/modules/lostFound/lostFoundRoutes');
const academicsRoutes = require('./src/modules/academics/academicsRoutes');

const { initDatabase } = require('./src/initDb');
const {
  scheduleLostFoundCleanup,
  cleanupLostFoundPosts,
} = require('./src/cron/cleanupLostFound');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health Check
app.get('/', (req, res) => {
  res.json({ message: 'UniHub Backend API is running smoothly!' });
});

app.get('/api', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Backend ready for Booking, Print, Canteen, Lost Found & Academics',
  });
});

// Routes
app.use('/api/booking', bookingRoutes);
app.use('/api/print', printRoutes);
app.use('/api/canteen', canteenRoutes);
app.use('/api/lostfound', lostFoundRoutes);
app.use('/api/academics', academicsRoutes);

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke internally!' });
});

// Start Server
(async () => {
  try {
    await initDatabase();
    await cleanupLostFoundPosts();
    scheduleLostFoundCleanup();
  } catch (error) {
    console.warn('\n⚠️ Postgres database initialization failed!');
    console.warn('Backend will run in in-memory simulation mode.');
    console.warn('Error details:', error.message || error);
  }

  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });
})();