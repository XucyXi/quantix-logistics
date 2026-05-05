const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/deliveryController');
const {authenticate} = require('../middlewares/authMiddleware');
const { gpsLimiter } = require('../middlewares/rateLimiter');

router.get('/active', authenticate, deliveryController.getAllActiveLocations);

// KUSKI PÄIVITTÄÄ (POST)
router.post(
  '/:orderId/location',
  gpsLimiter,
  authenticate,
  deliveryController.updateLocation
);
// ASIAKAS LUKEE (GET)
router.get(
  '/:orderId/status',
  authenticate,
  deliveryController.getTrackingData
);
module.exports = router;
