const express = require('express');
const router = express.Router();

const canteenController = require('./canteenController');
const { verifyToken, requireRole } = require('../../middleware/authMiddleware');

// ─── Public Read Routes ───────────────────────────────────────────────────────
router.get('/menu', canteenController.getMenu);
router.get('/order/:id', canteenController.getOrderById);
router.get('/orders', canteenController.getAllOrders);

// ─── Student Route — place an order (any authenticated user) ─────────────────
router.post('/order', canteenController.createOrder);

// ─── Admin-Only Write Routes ─────────────────────────────────────────────────
router.post(
  '/menu',
  
  canteenController.addMenuItem
);

router.patch(
  '/order/:id/status',
 
  canteenController.updateOrderStatus
);

router.patch(
  '/menu/:id/availability',
  
  canteenController.updateAvailability
);

module.exports = router;