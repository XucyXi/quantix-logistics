const productModel = require('../services/productsService.js');

// GET /products
async function getProducts(req, res) {
  try {
    const products = await productModel.getAllProducts();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
}

// GET /products?cursor=0
async function getProductsCursor(req, res) {
  try {
    const cursor = Number(req.query.cursor || 0);

    const result = await productModel.getProductsCursor(cursor);

    res.json(result);

  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: 'Failed to fetch paginated products'
    });
  }
}


// POST /products
async function createProduct(req, res) {
  try {
    const { name, description, base_price, stock_quantity, category_names } = req.body;

    if (!name || !base_price == null) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    const product = await productModel.createProduct(
      name,
      description,
      base_price,
      stock_quantity ?? 0,
      Array.isArray(category_names) ? category_names : []
    );

    res.status(201).json(
      { 
        message: 'Product created', 
        product 
      }
    );
  } catch (err) {
    console.error("CREATE PRODUCT ERROR:", err);

    res.status(500).json({
      error: err.message || 'Failed to create product'
    });   
  }
}

async function getProductById(req, res) {
  try {
    const { id } = req.params;

    const product = await productModel.getProductById(id);

    if (!product) {
      return res.status(404).json({
        error: 'Product not found'
      });
    }

    res.json(product);

  } catch (err) {
    console.error("Product fetching error:", err);

    res.status(500).json({
      error: 'Failed to fetch product'
    });
  }
}


// PUT /products/:id
async function updateProduct(req, res) {
  try {
    const { id } = req.params;
    const { name, description, base_price, stock_quantity } = req.body;

    if (!name || base_price == null) {
      return res.status(400).json({
        error: 'Missing required fields'
      });
    }

    const updated = await productModel.updateProduct(
      id,
      name,
      description,
      base_price,
      stock_quantity
    );

    if (updated === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update product' });
  }
}

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  getProductsCursor
};