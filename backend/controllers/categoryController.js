const db = require('../config/db'); // Varmista, että reitti db.js:ään on oikein!

async function getCategories(req, res) {
  try {
    const [categories] = await db.query('SELECT * FROM CATEGORIES');
    res.json(categories);
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({error: 'Failed to fetch categories'});
  }
}

async function createCategory(req, res) {
  try {
    const {name} = req.body;
    if (!name) return res.status(400).json({error: 'Name is required'});

    const [result] = await db.query(
      'INSERT INTO CATEGORIES (name) VALUES (?)',
      [name]
    );
    res.status(201).json({category_id: result.insertId, name});
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({error: 'Category already exists'});
    }
    console.error('Error creating category:', err);
    res.status(500).json({error: 'Failed to create category'});
  }
}

async function updateCategory(req, res) {
  try {
    const {id} = req.params;
    const {name} = req.body;
    if (!name) return res.status(400).json({error: 'Name is required'});

    const [result] = await db.query(
      'UPDATE CATEGORIES SET name = ? WHERE category_id = ?',
      [name, id]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({error: 'Category not found'});
    res.json({message: 'Category updated'});
  } catch (err) {
    console.error('Error updating category:', err);
    res.status(500).json({error: 'Failed to update category'});
  }
}

async function deleteCategory(req, res) {
  try {
    const {id} = req.params;
    const [result] = await db.query(
      'DELETE FROM CATEGORIES WHERE category_id = ?',
      [id]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({error: 'Category not found'});
    res.json({message: 'Category deleted'});
  } catch (err) {
    console.error('Error deleting category:', err);
    res.status(500).json({error: 'Failed to delete category'});
  }
}

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
