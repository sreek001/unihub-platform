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

// ─── Public routes (auth bypassed for local dev) ───────────
router.get('/venues',                getVenues);
router.get('/venues/:venueId/slots', getSlots);
router.post('/',                     createBooking);
router.get('/my-bookings',           getMyBookings);

// ─── Restricted routes (FACULTY / ADMIN only) ──────────────
router.get('/pending',               verifyToken, requireRole('FACULTY', 'ADMIN'), getPendingBookings);
router.patch('/:bookingId',          verifyToken, requireRole('FACULTY', 'ADMIN'), updateBookingStatus);

module.exports = router;
