const express = require('express');
const router = express.Router();
const db = require('../db/database');

// Get user profile
router.get('/:userId', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT user_id, name, email, base_currency FROM User WHERE user_id = ?',
      [req.params.userId]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new user
router.post('/', async (req, res) => {
  try {
    const { name, email, password_hash, base_currency } = req.body;
    
    const [result] = await db.query(
      'INSERT INTO User (name, email, password_hash, base_currency) VALUES (?, ?, ?, ?)',
      [name, email, password_hash, base_currency || 'USD']
    );
    
    res.status(201).json({ user_id: result.insertId, name, email, base_currency });
  } catch (error) {
    console.error('Error creating user:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Email already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/:userId', async (req, res) => {
  try {
    const { name, email, base_currency } = req.body;
    
    await db.query(
      'UPDATE User SET name = ?, email = ?, base_currency = ? WHERE user_id = ?',
      [name, email, base_currency, req.params.userId]
    );
    
    res.json({ user_id: req.params.userId, name, email, base_currency });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;