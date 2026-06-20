require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bookingRoutes = require('./src/modules/booking/bookingRoutes');
const canteenRoutes = require('./src/modules/canteen/canteenRoutes');
console.log("Canteen Router:", canteenRoutes);
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Base Health Check Route
app.get('/', (req, res) => {
    res.json({ message: "UniHub Backend API is running smoothly!" });
});

// 🏛️ Mount your Venue Booking Module Router
app.use('/api/booking', bookingRoutes);

// 🍽️ Mount your Canteen Module Router
app.use('/api/canteen', canteenRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something broke internally!' });
});

app.listen(PORT, () => {
    console.log(`🚀 Server safely processing metrics on http://localhost:${PORT}`);
});