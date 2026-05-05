/**
 * @fileoverview Category Controller.
 * Handles CRUD operations for product categories.
 */

import db from '../config/db.js';

/**
 * Retrieves all product categories from the database.
 *
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>} JSON array of categories.
 */
export async function getCategories(req, res) {
  try {
    const [categories] = await db.query('SELECT * FROM CATEGORIES');
    res.json(categories);
  } catch (err) {
    res.status(500).json({error: 'Failed to fetch categories'});
  }
}

/**
 * Creates a new product category.
 *
 * @param {import('express').Request} req - Express request object containing the category 'name'.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>} JSON response with the newly created category ID.
 */
export async function createCategory(req, res) {
  try {
    const {name} = req.body;
    if (!name)
      return res.status(400).json({error: 'Category name is required'});

    const [result] = await db.query(
      'INSERT INTO CATEGORIES (name) VALUES (?)',
      [name]
    );
    res.status(201).json({category_id: result.insertId, name});
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({error: 'Category already exists'});
    }
    res.status(500).json({error: 'Failed to create category'});
  }
}

/**
 * Updates an existing product category.
 *
 * @param {import('express').Request} req - Express request object containing category ID in params and new name in body.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>} JSON response indicating success or failure.
 */
export async function updateCategory(req, res) {
  try {
    const {id} = req.params;
    const {name} = req.body;
    if (!name)
      return res.status(400).json({error: 'Category name is required'});

    const [result] = await db.query(
      'UPDATE CATEGORIES SET name = ? WHERE category_id = ?',
      [name, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({error: 'Category not found'});
    }

    res.json({message: 'Category updated successfully'});
  } catch (err) {
    res.status(500).json({error: 'Failed to update category'});
  }
}

/**
 * Deletes a product category by its ID.
 *
 * @param {import('express').Request} req - Express request object containing the category ID in params.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>} JSON response indicating success or failure.
 */
export async function deleteCategory(req, res) {
  try {
    const {id} = req.params;
    const [result] = await db.query(
      'DELETE FROM CATEGORIES WHERE category_id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({error: 'Category not found'});
    }

    res.json({message: 'Category deleted successfully'});
  } catch (err) {
    res.status(500).json({error: 'Failed to delete category'});
  }
}
