const express = require('express');
const productsController = require("../controllers/productsController.js");
const authMiddleware = require("../middlewares/authMiddleware.js");
const roleMiddleware = require("../middlewares/roleMiddleware.js");
const router = express.Router();

router.get('/cursor', productsController.getProductsCursor);
router.post('/', authMiddleware.authenticate, roleMiddleware.requireRole('admin'), productsController.createProduct);
router.put('/:id', authMiddleware.authenticate, roleMiddleware.requireRole('admin'), productsController.updateProduct);
router.get('/:id', authMiddleware.authenticate, productsController.getProductById);
router.delete('/:id', authMiddleware.authenticate, roleMiddleware.requireRole('admin'), productsController.deleteProduct);
  

// Add remove product by ID

module.exports = router;
