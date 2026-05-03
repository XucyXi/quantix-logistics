const express = require('express');
const router = express.Router();

const orderController = require('../controllers/orderController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// Create order (customer)
router.post('/', authMiddleware.authenticate, orderController.createOrder);

// Get assigned orders (driver)
router.get(
  '/assigned',
  authMiddleware.authenticate,
  roleMiddleware.requireRole('driver'),
  orderController.getAssignedOrders
);

// Get customer orders (customer) - TÄYTYY OLLA ENNEN /stats!
router.get('/', authMiddleware.authenticate, orderController.getCustomerOrders);
router.get(
  '/my-orders',
  authMiddleware.authenticate,
  roleMiddleware.requireRole('customer'),
  orderController.getCustomerOrders
);

// Get order stats (customer)
router.get(
  '/stats',
  authMiddleware.authenticate,
  orderController.getOrderStats
);

// Assign driver (admin)
router.put(
  '/:id/assign',
  authMiddleware.authenticate,
  roleMiddleware.requireRole('admin'),
  orderController.assignDriverToOrder
);

// Get single order
router.get('/:id', authMiddleware.authenticate, orderController.getOrder);

router.put(
  '/:id/status',
  authMiddleware.authenticate,
  roleMiddleware.requireRole('driver'),
  orderController.updateOrderStatus
);

// Driver updates their availability
router.put(
  '/driver/availability',
  authMiddleware.authenticate,
  roleMiddleware.requireRole('driver'),
  orderController.updateAvailability
);

// Admin cancels an order
router.put(
  '/:id/cancel',
  authMiddleware.authenticate,
  roleMiddleware.requireRole('admin'),
  orderController.cancelOrder
);

// Admin fetches all drivers
router.get(
  '/admin/drivers',
  authMiddleware.authenticate,
  roleMiddleware.requireRole('admin'),
  orderController.getAllDrivers
);

// Admin cursor-based order pagination
router.get(
  '/cursor',
  authMiddleware.authenticate,
  roleMiddleware.requireRole('admin'),
  orderController.getOrdersCursor
);

// Hakee kaikki tilaukset adminille
router.get(
  '/admin/all',
  authMiddleware.authenticate,
  roleMiddleware.requireRole('admin'),
  orderController.getAllOrdersAdmin
);

// Kuskin assignaus
router.put(
  '/:id/assign',
  authMiddleware.authenticate,
  roleMiddleware.requireRole('admin'),
  orderController.assignDriver
);

// Tilauksen peruutus
router.put(
  '/:id/cancel',
  authMiddleware.authenticate,
  roleMiddleware.requireRole('admin'),
  orderController.cancelOrder
);

module.exports = router;
