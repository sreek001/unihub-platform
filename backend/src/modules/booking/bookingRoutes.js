const express = require('express');
const router = express.Router();
<<<<<<< HEAD
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
=======
const bookingController = require('./bookingController');

router.get('/venues', bookingController.getVenues);
router.get('/availability', bookingController.getAvailability);
router.post('/reserve', bookingController.reserveSlot);

>>>>>>> 18051670cacb6ee7f6cae0d57141a35bb0935b99
module.exports = router;