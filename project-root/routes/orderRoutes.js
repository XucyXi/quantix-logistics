const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/authMiddleware');
const orderController = require('../controllers/orderController');

router.post('/', authMiddleware.authenticate, orderController.createOrder);

router.get('/:id', authMiddleware.authenticate, orderController.getOrder);

module.exports = router;
