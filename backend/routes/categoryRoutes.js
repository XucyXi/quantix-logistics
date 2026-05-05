const express = require('express');
const categoryController = require('../controllers/categoryController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

const router = express.Router();

// Get all categories (Anyone authenticated can read)
router.get('/', authMiddleware.authenticate, categoryController.getCategories);

// Create, Update, Delete (Admin only)
router.post(
  '/',
  authMiddleware.authenticate,
  roleMiddleware.requireRole('admin'),
  categoryController.createCategory
);
router.put(
  '/:id',
  authMiddleware.authenticate,
  roleMiddleware.requireRole('admin'),
  categoryController.updateCategory
);
router.delete(
  '/:id',
  authMiddleware.authenticate,
  roleMiddleware.requireRole('admin'),
  categoryController.deleteCategory
);

module.exports = router;
