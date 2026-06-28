const express = require('express');
const router = express.Router();

const bookingController = require('./bookingController');
const printRoutes = require('./print/print.routes');

// Booking Routes
router.get('/venues', bookingController.getVenues);
router.get('/availability', bookingController.getAvailability);
router.post('/reserve', bookingController.reserveSlot);

// Print Module
router.use('/print', printRoutes);

module.exports = router;