const express = require('express');
const router = express.Router();
const { pool: db } = require('../config/database');

// Get all categories
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM Category');
    res.json(rows);
  } catch (error) {
    console.error('Error getting categories:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get categories by type (Income or Expense)
router.get('/type/:type', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM Category WHERE category_type = ?',
      [req.params.type]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error getting categories by type:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new category
router.post('/', async (req, res) => {
  try {
    const { category_name, category_type } = req.body;
    
    const [result] = await db.query(
      'INSERT INTO Category (category_name, category_type) VALUES (?, ?)',
      [category_name, category_type]
    );
    
    res.status(201).json({ 
      category_id: result.insertId,
      category_name,
      category_type
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
