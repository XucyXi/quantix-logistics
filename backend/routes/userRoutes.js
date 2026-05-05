/**
 * @fileoverview User management routes.
 * Strictly restricted to admin users for managing system accounts.
 */

import express from 'express';
import * as userController from '../controllers/userController.js';
import {authenticate} from '../middlewares/authMiddleware.js';
import {requireRole} from '../middlewares/roleMiddleware.js';

const router = express.Router();

// Protect all routes in this module
router.use(authenticate);
router.use(requireRole('admin'));

router.get('/', userController.getUsers);
router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

export default router;
