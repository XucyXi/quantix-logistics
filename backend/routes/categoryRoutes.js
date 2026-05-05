/**
 * @fileoverview Category management routes.
 * Allows authenticated users to view categories, but restricts modifications to admins.
 */

import express from 'express';
import * as categoryController from '../controllers/categoryController.js';
import {authenticate} from '../middlewares/authMiddleware.js';
import {requireRole} from '../middlewares/roleMiddleware.js';

const router = express.Router();

// Get all categories (Anyone authenticated can read)
router.get('/', authenticate, categoryController.getCategories);

// Create, Update, Delete (Admin only)
router.post(
  '/',
  authenticate,
  requireRole('admin'),
  categoryController.createCategory
);
router.put(
  '/:id',
  authenticate,
  requireRole('admin'),
  categoryController.updateCategory
);
router.delete(
  '/:id',
  authenticate,
  requireRole('admin'),
  categoryController.deleteCategory
);

export default router;
