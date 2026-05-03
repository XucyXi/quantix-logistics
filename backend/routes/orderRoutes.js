const express = require('express');
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

const router = express.Router();

// --- KAIKILLE KIRJAUTUNEILLE YHTEISET REITIT ---
// (Asiakkaat, Kuskit, Adminit)
router.get(
  '/cursor',
  authMiddleware.authenticate,
  orderController.getOrdersCursor
);
router.post('/', authMiddleware.authenticate, orderController.createOrder);
router.get('/:id', authMiddleware.authenticate, orderController.getOrder);

// --- ASIAKKAAN REITIT ---
// Huom: Nää kannattaa asettaa reitittimeen ennen /:id -reittiä, jotta 'stats' ei tulkittaisi id:ksi
router.get(
  '/customer/stats',
  authMiddleware.authenticate,
  orderController.getOrderStats
);
router.get(
  '/customer/all',
  authMiddleware.authenticate,
  orderController.getCustomerOrders
);

// --- KULJETTAJAN REITIT ---
router.get(
  '/driver/assigned',
  authMiddleware.authenticate,
  roleMiddleware.requireRole('driver'),
  orderController.getAssignedOrders
);
router.put(
  '/driver/availability',
  authMiddleware.authenticate,
  roleMiddleware.requireRole('driver'),
  orderController.updateAvailability
);
// Tilauksen statuksen päivitys (Kuski kuittaa noudetuksi / toimitetuksi)
router.put(
  '/:id/status',
  authMiddleware.authenticate,
  orderController.updateOrderStatus
);

// --- ADMIN REITIT ---
router.get(
  '/admin/all',
  authMiddleware.authenticate,
  roleMiddleware.requireRole('admin'),
  orderController.getAllOrdersAdmin
);
router.get(
  '/admin/drivers',
  authMiddleware.authenticate,
  roleMiddleware.requireRole('admin'),
  orderController.getAllDrivers
);

// Kuskin määrääminen (KORJATTU: Käyttää nyt orderController.assignDriver -funktiota)
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
