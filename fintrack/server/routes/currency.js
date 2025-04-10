const express = require('express');
const router = express.Router();
const { pool: db } = require('../config/database');

// Get all currency exchange rates
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM CurrencyExchange');
    res.json(rows);
  } catch (error) {
    console.error('Error getting currency exchange rates:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a specific currency exchange rate
router.get('/:code', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM CurrencyExchange WHERE currency_code = ?',
      [req.params.code]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Currency not found' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error getting currency:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a currency exchange rate
router.put('/:code', async (req, res) => {
  try {
    const { exchange_rate_to_base } = req.body;
    
    await db.query(
      'UPDATE CurrencyExchange SET exchange_rate_to_base = ? WHERE currency_code = ?',
      [exchange_rate_to_base, req.params.code]
    );
    
    res.json({ 
      currency_code: req.params.code,
      exchange_rate_to_base,
      last_updated: new Date()
    });
  } catch (error) {
    console.error('Error updating currency:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
