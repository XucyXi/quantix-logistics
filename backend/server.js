try {
  const express = require('express');
  const cors = require('cors');
  const rateLimit = require('express-rate-limit');
  require('dotenv').config(); // Load .env

  const authRoutes = require('./routes/authRoutes.js');
  const productRoutes = require('./routes/productRoutes.js');
  const orderRoutes = require('./routes/orderRoutes.js');
  const deliveryRoutes = require('./routes/deliveryRoutes.js');
  const adminRoutes = require('./routes/adminRoutes.js');
  const categoryRoutes = require('./routes/categoryRoutes.js');
  const userRoutes = require('./routes/userRoutes.js');
  const notificationRoutes = require('./routes/notificationRoutes.js');

  const app = express();

  app.set('trust proxy', 1);

  // Pulls from .env and split into an array, or fallback to defaults
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:5173', 'http://127.0.0.1:5173'];

  app.use(
    cors({
      origin: allowedOrigins,
      credentials: true, // Allows the authorization headers
    })
  );

  app.use((req, res, next) => {
    console.log(`Incoming request: ${req.method} ${req.url}`);
    next();
  });

  app.use(express.json()); // Parse JSON bodies

  // <-- GLOBAL RATE LIMITER -->
  const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // Raised to 500 to allow normal frontend navigation
    skip: (req) => req.originalUrl.includes('/location'), // Let the gpsLimiter handle this exclusively
    message: { error: 'Too many requests from this IP, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Apply global limiter to all /api routes
  app.use('/api', globalLimiter);

  app.use('/api/auth', authRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/deliveries', deliveryRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/categories', categoryRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/notifications', notificationRoutes);

  // Use PORT from .env as well
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
} catch (err) {
  console.error('Failed to start server:', err);
}
