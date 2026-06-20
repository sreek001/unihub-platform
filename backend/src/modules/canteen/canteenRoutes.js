const express = require('express');
const router = express.Router();

const {
  verifyToken,
} = require('../booking/authMiddleware');

const {
  fetchMenu,
} = require('./canteenController');

console.log("verifyToken =", typeof verifyToken);
console.log("fetchMenu =", typeof fetchMenu);

router.get('/menu', fetchMenu);

module.exports = router;