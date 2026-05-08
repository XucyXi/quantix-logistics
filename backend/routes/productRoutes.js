/**
 * @fileoverview Product management routes.
 * Handles fetching, creating, updating, and deleting products.
 */

import express from 'express';
import * as productsController from '../controllers/productsController.js';
import {authenticate} from '../middlewares/authMiddleware.js';
import {requireRole} from '../middlewares/roleMiddleware.js';

const router = express.Router();

// Static & Cursor Routes
router.get('/', authenticate, productsController.getProducts);
router.get('/cursor', authenticate, productsController.getProductsCursor);
router.get(
  '/category/cursor',
  authenticate,
  productsController.getProductsByCategoryCursor
);

// Admin Product Management
router.post(
  '/',
  authenticate,
  requireRole('admin'),
  productsController.createProduct
);

// Debugging route
router.get('/test', (req, res) => {
  res.json({message: 'Server works', url: req.url, method: req.method});
});

// Dynamic Routes (Must be defined after static routes to avoid param swallowing)
router.get('/:id', authenticate, productsController.getProductById);
router.put(
  '/:id',
  authenticate,
  requireRole('admin'),
  productsController.updateProduct
);
router.delete(
  '/:id',
  authenticate,
  requireRole('admin'),
  productsController.deleteProduct
);

export default router;
