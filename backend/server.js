try {
  const express = require('express');
  require('dotenv').config(); // Load .env
  const authRoutes = require('./routes/authRoutes.js');
  const productRoutes = require('./routes/productRoutes.js');
  const orderRoutes = require('./routes/orderRoutes.js');
  const deliveryRoutes = require('./routes/deliveryRoutes.js');
  const app = express();
  const cors = require('cors');

  app.use(
    cors({
      origin: 'http://localhost:5173',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );
  app.use((req, res, next) => {
    console.log(`Incoming request: ${req.method} ${req.url}`);
    next();
  });

  app.use(express.json()); // Parse JSON bodies

  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/products', productRoutes);
  app.use('/api/v1/orders', orderRoutes);
  app.use('/api/v1/deliveries', deliveryRoutes);

  app.listen(3000, () => console.log('Server running on port 3000'));
} catch (err) {
  console.error('Failed to start server:', err);
}
