const express = require('express');
const productsController = require('../controllers/productsController.js');
const authMiddleware = require('../middlewares/authMiddleware.js');
const roleMiddleware = require('../middlewares/roleMiddleware.js');
const router = express.Router();

// Static Routes (Must come first)
router.get('/', authMiddleware.authenticate, productsController.getProducts);

router.post(
  '/',
  authMiddleware.authenticate,
  roleMiddleware.requireRole('admin'),
  productsController.createProduct
);

// Protected cursor route
router.get(
  '/cursor',
  authMiddleware.authenticate,
  productsController.getProductsCursor
);

// Moved the test route ABOVE the /:id route so it doesn't get swallowed uppety up - Jere
router.get('/test', (req, res) => {
  console.log('TEST ROUTE HIT');
  res.json({
    message: 'Server works',
    url: req.url,
    method: req.method,
  });
});

// Dynamic Routes (Must come last (They just MUST))
router.put(
  '/:id',
  authMiddleware.authenticate,
  roleMiddleware.requireRole('admin'),
  productsController.updateProduct
);

router.get(
  '/:id',
  authMiddleware.authenticate,
  productsController.getProductById
);

module.exports = router;
