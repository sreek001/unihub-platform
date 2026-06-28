const express = require('express');
const router = express.Router();
const printRoutes = require('./print/print.routes');
const { verifyToken, requireRole } = require('./authMiddleware');
const {
  getVenues,
  getSlots,
  createBooking,
  updateBookingStatus,
  getMyBookings,
  getPendingBookings,
} = require('./bookingController');

// ─── Public-ish routes (any authenticated user) ────────────
router.get('/venues',                verifyToken, getVenues);
router.get('/venues/:venueId/slots', verifyToken, getSlots);
router.post('/',                     verifyToken, createBooking);
router.get('/my-bookings',           verifyToken, getMyBookings);

// ─── Restricted routes (FACULTY / ADMIN only) ──────────────
router.get('/pending',               verifyToken, requireRole('FACULTY', 'ADMIN'), getPendingBookings);
router.patch('/:bookingId',          verifyToken, requireRole('FACULTY', 'ADMIN'), updateBookingStatus);

// —— Restricted routes (FACULTY / ADMIN only) ——
router.get('/pending',     verifyToken, requireRole('FACULTY', 'ADMIN'), getPendingBookings);
router.patch('/:bookingId', verifyToken, requireRole('FACULTY', 'ADMIN'), updateBookingStatus);

// 🖨️ Mount your Print Module Router
router.use('/print', printRoutes);

// 📤 Export EVERYTHING together at the very end
module.exports = router;