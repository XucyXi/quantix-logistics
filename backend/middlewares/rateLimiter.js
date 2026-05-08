/**
 * @fileoverview Rate limiting middlewares.
 * Protects the API from brute-force attacks, spamming, and excessive traffic.
 */

import rateLimit from 'express-rate-limit';

/**
 * Strict rate limiter for authentication routes (login, register, password changes).
 * Limits requests to 10 per 15-minute window per IP to prevent brute-force attacks.
 *
 * @type {import('express').RequestHandler}
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: {
    success: false,
    error: 'Too many authentication attempts. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Moderate rate limiter for order creation.
 * Limits requests to 20 per 15-minute window per IP to prevent order spamming.
 *
 * @type {import('express').RequestHandler}
 */
export const orderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: {
    success: false,
    error: 'Too many orders created. Please wait a moment.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * High-throughput rate limiter specifically for driver GPS location updates.
 * Allows up to 30 updates per minute per IP (approx. one every 2 seconds).
 *
 * @type {import('express').RequestHandler}
 */
export const gpsLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30,
  message: {
    success: false,
    error: 'Too many location updates.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
