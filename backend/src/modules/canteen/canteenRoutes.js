const express = require('express');
const router = express.Router();

const canteenController = require('./canteenController');
const { verifyToken, requireRole } = require('../../middleware/authMiddleware');

// ─── Public Read Routes ───────────────────────────────────────────────────────
router.get('/menu', canteenController.getMenu);
router.get('/order/:id', canteenController.getOrderById);
router.get('/orders', canteenController.getAllOrders);

// ─── Student Route — place an order (any authenticated user) ─────────────────
router.post('/order', verifyToken, canteenController.createOrder);

// ─── Admin-Only Write Routes ─────────────────────────────────────────────────
router.post(
  '/menu',
  verifyToken,
  requireRole('canteen_admin'),
  canteenController.addMenuItem
);

router.patch(
  '/order/:id/status',
  verifyToken,
  requireRole('canteen_admin'),
  canteenController.updateOrderStatus
);

router.patch(
  '/menu/:id/availability',
  verifyToken,
  requireRole('canteen_admin'),
  canteenController.updateAvailability
);

module.exports = router;