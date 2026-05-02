const productsService = require('../services/productsService');

// GET /products
async function getProducts(req, res) {
  try {
    const products = await productsService.getAllProducts();
    res.json(products);
  } catch (err) {
    res.status(500).json({error: 'Failed to fetch products'});
  }
}

// POST /products
async function createProduct(req, res) {
  try {
    const {name, base_price, stock_quantity} = req.body;

    if (!name || !base_price) {
      return res.status(400).json({error: 'Missing fields'});
    }

    const id = await productsService.createProduct(
      name,
      base_price,
      stock_quantity || 0
    );

    res.status(201).json({message: 'Product created', id});
  } catch (err) {
    res.status(500).json({error: 'Failed to create product'});
  }
}

async function getProductById(req, res) {
  console.log('🔥 HIT getProductById:', req.params);
  try {
    const {id} = req.params;
    const product_getter = await productsService.getProductById(id);
    if (!product_getter) {
      throw new Error('Product not found. ');
    }
    res.json(product_getter);
  } catch (err) {
    console.error('Product fetching by ID error: ' + err);
    res.status(404).json({error: err.message});
  }
}

// PUT /products/:id
async function updateProduct(req, res) {
  try {
    const {id} = req.params;
    const {name, base_price, stock_quantity} = req.body;

    const updated = await productsService.updateProduct(
      id,
      name,
      base_price,
      stock_quantity
    );

    if (updated === 0) {
      return res.status(404).json({error: 'Product not found'});
    }

    res.json({message: 'Product updated'});
  } catch (err) {
    res.status(500).json({error: 'Failed to update product'});
  }
}

async function getProductsCursor(req, res) {
  try {
    const cursor = req.query.cursor || 0;
    const limit = req.query.limit || 20;

    const result = await productsService.getProductsCursor(cursor, limit);
    return res.json({success: true, ...result});
  } catch (error) {
    return res.status(500).json({success: false, error: error.message});
  }
}

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  getProductsCursor,
};
