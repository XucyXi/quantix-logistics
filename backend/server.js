try {
  const express = require('express');
  require('dotenv').config(); // Load .env
  const authRoutes = require('./routes/authRoutes.js');
  const productRoutes = require('./routes/productRoutes.js');
  const orderRoutes = require('./routes/orderRoutes.js');
  const deliveryRoutes = require('./routes/deliveryRoutes.js');
  const adminRoutes = require('./routes/adminRoutes.js');
  const app = express();

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

  app.listen(3000, () => console.log('Server running on port 3000'));
} catch (err) {
  console.error('Failed to start server:', err);
}
