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

// Get order stats (customer) - TULE ENNEN /:id REITTIÄ!
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

router.get(
  '/my-orders',
  authMiddleware.authenticate,
  //roleMiddleware.requireRole('customer'),
  orderController.getCustomerOrders
);

// Get single order
router.get('/:id', authMiddleware.authenticate, orderController.getOrder);

router.put(
  '/:id/status',
  authMiddleware.authenticate,
  roleMiddleware.requireRole('driver'),
  orderController.updateOrderStatus
);

module.exports = router;
