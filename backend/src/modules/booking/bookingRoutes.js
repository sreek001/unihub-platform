const express = require('express');
const router = express.Router();

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

module.exports = router;
