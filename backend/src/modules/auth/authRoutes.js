const express = require('express');
const router = express.Router();

const { register, login, me } = require('./authController');
const { verifyToken } = require('../../middleware/authMiddleware');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected — requires valid JWT
router.get('/me', verifyToken, me);

module.exports = router;
