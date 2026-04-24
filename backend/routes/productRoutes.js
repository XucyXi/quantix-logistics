const express = require('express');
const productsController = require("../controllers/productsController.js");
const authMiddleware = require("../middlewares/authMiddleware.js");
const roleMiddleware = require("../middlewares/roleMiddleware.js");
const router = express.Router();

router.get('/', authMiddleware.authenticate, productsController.getProducts);
router.post('/', authMiddleware.authenticate, roleMiddleware.requireRole('admin'), productsController.createProduct);
router.put('/:id', authMiddleware.authenticate, roleMiddleware.requireRole('admin'), productsController.updateProduct);
router.get(
    '/:id',
    authMiddleware.authenticate,
    productsController.getProductById
  );
  
router.get('/test', (req, res) => {
    console.log('TEST ROUTE HIT');
    res.json({
        message: 'Server works',
        url: req.url,
        method: req.method
    });
}); 

module.exports = router;
