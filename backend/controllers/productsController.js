/**
 * @fileoverview Products Controller.
 * Handles product catalog management, including cursor-based pagination, filtering, and CRUD operations.
 */

import * as productsService from '../services/productsService.js';

/**
 * Retrieves the entire product catalog without pagination.
 * Use cautiously on large datasets.
 *
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 */
export async function getProducts(req, res) {
  try {
    const products = await productsService.getAllProducts();
    res.json(products);
  } catch (err) {
    res.status(500).json({error: 'Failed to fetch products'});
  }
}

/**
 * Creates a new product in the database.
 *
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 */
export async function createProduct(req, res) {
  try {
    const {
      name,
      description,
      price,
      base_price,
      stock,
      stock_quantity,
      categories,
    } = req.body;

    const finalPrice = price !== undefined ? price : base_price;
    const finalStock = stock !== undefined ? stock : stock_quantity;

    if (!name || finalPrice === undefined) {
      return res
        .status(400)
        .json({error: 'Missing required fields (name, price)'});
    }

    const id = await productsService.createProduct(
      name,
      description || '',
      finalPrice,
      finalStock || 0,
      categories || []
    );

    res.status(201).json({message: 'Product created', id});
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(500).json({error: 'Failed to create product'});
  }
}

/**
 * Fetches a single product by its unique ID.
 *
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 */
export async function getProductById(req, res) {
  try {
    const {id} = req.params;
    const product_getter = await productsService.getProductById(id);

    if (!product_getter) {
      throw new Error('Product not found.');
    }

    res.json(product_getter);
  } catch (err) {
    res.status(404).json({error: err.message});
  }
}

/**
 * Updates an existing product's details and categories.
 *
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 */
export async function updateProduct(req, res) {
  try {
    const {id} = req.params;
    const {
      name,
      description,
      price,
      base_price,
      stock,
      stock_quantity,
      categories,
    } = req.body;

    const finalPrice = price !== undefined ? price : base_price;
    const finalStock = stock !== undefined ? stock : stock_quantity;

    const updated = await productsService.updateProduct(
      id,
      name,
      description || '',
      finalPrice,
      finalStock || 0,
      categories || []
    );

    if (updated === 0) {
      return res.status(404).json({error: 'Product not found'});
    }

    res.json({message: 'Product updated'});
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({error: 'Failed to update product'});
  }
}

/**
 * Fetches a paginated list of products using a cursor. Supports text-based search.
 *
 * @param {import('express').Request} req - Express request object containing cursor, limit, and search parameters.
 * @param {import('express').Response} res - Express response object.
 */
export async function getProductsCursor(req, res) {
  try {
    const cursor = req.query.cursor || 0;
    const limit = req.query.limit || 16;
    const search = req.query.search || null;

    const result = await productsService.getProductsCursor(
      cursor,
      limit,
      search
    );
    return res.json({success: true, ...result});
  } catch (error) {
    return res.status(500).json({success: false, error: error.message});
  }
}

/**
 * Fetches a paginated list of products filtered by one or more categories.
 *
 * @param {import('express').Request} req - Express request object containing categories, cursor, and limit parameters.
 * @param {import('express').Response} res - Express response object.
 */
export async function getProductsByCategoryCursor(req, res) {
  try {
    const cursor = req.query.cursor || 0;
    const limit = req.query.limit || 24;
    const categories = req.query.categories || req.query.category;

    if (!categories) {
      return res
        .status(400)
        .json({success: false, error: 'Category parameter is required'});
    }

    const result = await productsService.getProductsByCategoryCursor(
      categories,
      cursor,
      limit
    );
    return res.json({success: true, ...result});
  } catch (error) {
    if (
      error.message.includes('do not exist') ||
      error.message.includes('required')
    ) {
      return res.status(400).json({success: false, error: error.message});
    }
    return res
      .status(500)
      .json({success: false, error: 'Failed to fetch products by category'});
  }
}

/**
 * Deletes a product from the database. Prevents deletion if the product exists in order histories.
 *
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 */
export async function deleteProduct(req, res) {
  try {
    const {id} = req.params;
    const result = await productsService.deleteProduct(id);

    res.json({message: 'Product deleted successfully', id: result.product_id});
  } catch (err) {
    if (err.message.includes('not found')) {
      return res.status(404).json({error: err.message});
    }
    if (err.message.includes('tied to existing order history')) {
      return res.status(409).json({error: err.message});
    }
    res.status(500).json({error: 'Failed to delete product'});
  }
}
