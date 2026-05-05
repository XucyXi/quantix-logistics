const rateLimit = require('express-rate-limit');

// 1. Auth Limiter (Strict)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 10, 
  message: { success: false, error: 'Too many authentication attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// 2. Order Creation Limiter (Moderate)
const orderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Max 20 new orders per IP per 15 mins
  message: { success: false, error: 'Too many orders created. Please wait a moment.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// 3. GPS Update Limiter (High Throughput)
const gpsLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // Allows up to 30 location updates per minute (one every 2 seconds)
  message: { success: false, error: 'Too many location updates.' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { authLimiter, orderLimiter, gpsLimiter };