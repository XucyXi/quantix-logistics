const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/deliveryController');
const {authenticate} = require('../middlewares/authMiddleware');

router.get('/active', authenticate, deliveryController.getAllActiveLocations);

// KUSKI PÄIVITTÄÄ (POST)
router.post(
  '/:orderId/location',
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
