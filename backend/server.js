try {
  const express = require('express');
  const cors = require('cors');
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
