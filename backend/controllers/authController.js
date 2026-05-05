/**
 * @fileoverview Authentication Controller.
 * Handles HTTP requests related to user authentication, registration, and profile management.
 * Delegates business logic to the authService.
 */

import authService from '../services/authService.js';
import jwt from 'jsonwebtoken';

/**
 * Registers a new user (Customer or Driver) in the system.
 *
 * @param {import('express').Request} req - Express request object containing email, password, role, and extra data in the body.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>} Sends a 201 status with user data and token on success, or a 400 status on error.
 */
export async function register(req, res) {
  try {
    const {email, password, role, ...extraData} = req.body;

    const result = await authService.register({
      email,
      password,
      role,
      extraData,
    });

    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({error: err.message || 'Registration failed'});
  }
}

/**
 * Authenticates a user and generates a JWT.
 *
 * @param {import('express').Request} req - Express request object containing email and password.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>} Sends user data and token on success, or a 400 status on authentication failure.
 */
export async function login(req, res) {
  try {
    const result = await authService.login(req.body);
    res.json(result);
  } catch (err) {
    res.status(400).json({error: err.message});
  }
}

/**
 * Retrieves the profile information for the currently authenticated user.
 *
 * @param {import('express').Request} req - Express request object containing the authenticated user's ID.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>} Sends the user's profile data on success.
 */
export async function getProfile(req, res) {
  try {
    const profile = await authService.getProfile(req.user.user_id);
    res.json({success: true, profile});
  } catch (err) {
    res.status(400).json({success: false, error: err.message});
  }
}

/**
 * Updates driver-specific profile information (e.g., vehicle details).
 *
 * @param {import('express').Request} req - Express request object containing vehicleInfo.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>} Sends the updated profile on success.
 */
export async function updateDriverProfile(req, res) {
  try {
    const {vehicleInfo} = req.body;
    const profile = await authService.updateDriverProfile(
      req.user.user_id,
      vehicleInfo
    );

    res.json({success: true, profile});
  } catch (err) {
    res.status(400).json({success: false, error: err.message});
  }
}

/**
 * Updates general profile information for a user.
 *
 * @param {import('express').Request} req - Express request object containing updated profile fields.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>} Sends the updated profile on success.
 */
export async function updateProfile(req, res) {
  try {
    const profile = await authService.updateProfile(
      req.user.user_id,
      req.body || {}
    );
    res.json({success: true, profile});
  } catch (err) {
    res.status(400).json({success: false, error: err.message});
  }
}

/**
 * Changes the authenticated user's password.
 *
 * @param {import('express').Request} req - Express request object containing currentPassword and newPassword.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>} Sends a success confirmation, or a 400 status if verification fails.
 */
export async function changePassword(req, res) {
  try {
    const {currentPassword, newPassword} = req.body || {};
    await authService.changePassword(
      req.user.user_id,
      currentPassword,
      newPassword
    );
    res.json({success: true});
  } catch (err) {
    res.status(400).json({success: false, error: err.message});
  }
}

/**
 * Generates a fresh JWT for an authenticated user, extending their session.
 * Allows refreshing an expired token, provided the token signature is still valid.
 *
 * @param {import('express').Request} req - Express request object containing the existing JWT in the Authorization header.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>} Sends a new JWT on success, or a 401/403 status if the token is missing or invalid.
 */
export async function refresh(req, res) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res
        .status(401)
        .json({success: false, message: 'No token provided or malformed'});
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error('JWT_SECRET is missing from server configuration');
    }

    const decoded = jwt.verify(token, secret, {ignoreExpiration: true});

    const newToken = jwt.sign(
      {user_id: decoded.user_id, role: decoded.role},
      secret,
      {expiresIn: '24h'}
    );

    return res.json({success: true, token: newToken});
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Invalid token',
      error: error.message,
    });
  }
}
