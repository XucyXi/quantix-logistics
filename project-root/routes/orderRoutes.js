const express = require('express');
const router = express.Router();

const orderController = require('../controllers/orderController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// Create order (customer)
router.post(
  '/',
  authMiddleware.authenticate,
  orderController.createOrder
);

// Get assigned orders (driver)
router.get(
  '/assigned',
  authMiddleware.authenticate,
  roleMiddleware.requireRole('driver'),
  orderController.getAssignedOrders
);

// backend/routes/orderRoutes.js
router.get(
  '/my-orders',
  authMiddleware.authenticate,
  roleMiddleware.requireRole('customer'),
  orderController.getCustomerOrders
);

router.get('/cursor', authMiddleware.authenticate, roleMiddleware.requireRole('admin'), orderController.getOrdersCursor);


// Assign driver (admin)
router.put(
  '/:id/assign',
  authMiddleware.authenticate,
  roleMiddleware.requireRole('admin'),
  orderController.assignDriverToOrder
);

// Get single order
router.get(
  '/:id',
  authMiddleware.authenticate,
  orderController.getOrder
);

router.put(
    '/:id/status',
    authMiddleware.authenticate,
    roleMiddleware.requireRole('driver'),
    orderController.updateOrderStatus
  );  

router.put(
  '/driver/availability',
  authMiddleware.authenticate,
  roleMiddleware.requireRole('driver'),
  orderController.updateAvailability
);

router.put(
  '/:id/cancel',
  authMiddleware.authenticate,
  roleMiddleware.requireRole('admin'),
  orderController.cancelOrder
);

router.get('/admin/drivers', authMiddleware.authenticate, roleMiddleware.requireRole('admin'), orderController.getAllDrivers);


module.exports = router;
