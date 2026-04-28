const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/deliveryController');
const {authenticate} = require('../middlewares/authMiddleware');

router.post(
  '/:orderId/tracking',
  authenticate,
  deliveryController.updateLocation
);
router.get(
  '/my-active',
  authenticate,
  deliveryController.getMyActiveDeliveries
);
module.exports = router;
