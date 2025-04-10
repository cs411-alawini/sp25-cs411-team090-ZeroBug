const express = require('express');
const router = express.Router();
const { pool: db } = require('../config/database');

// Get all transactions for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate, category, type, currency, limit = 50, offset = 0 } = req.query;
    
    let query = `
      SELECT t.*, c.category_name, c.category_type 
      FROM Transaction t
      JOIN Category c ON t.category_id = c.category_id
      WHERE t.user_id = ?
    `;
    
    const queryParams = [userId];
    
    if (startDate) {
      query += ' AND t.transaction_date >= ?';
      queryParams.push(startDate);
    }
    
    if (endDate) {
      query += ' AND t.transaction_date <= ?';
      queryParams.push(endDate);
    }
    
    if (category) {
      query += ' AND t.category_id = ?';
      queryParams.push(category);
    }
    
    if (type) {
      query += ' AND t.transaction_type = ?';
      queryParams.push(type);
    }
    
    if (currency) {
      query += ' AND t.currency_code = ?';
      queryParams.push(currency);
    }
    
    query += ' ORDER BY t.transaction_date DESC LIMIT ? OFFSET ?';
    queryParams.push(parseInt(limit), parseInt(offset));
    
    const [rows] = await db.query(query, queryParams);
    
    res.json(rows);
  } catch (error) {
    console.error('Error getting transactions:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a specific transaction
router.get('/:transactionId', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT t.*, c.category_name, c.category_type 
       FROM Transaction t
       JOIN Category c ON t.category_id = c.category_id
       WHERE t.transaction_id = ?`,
      [req.params.transactionId]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error getting transaction:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new transaction
router.post('/', async (req, res) => {
  try {
    const { 
      user_id, 
      category_id, 
      amount, 
      currency_code, 
      transaction_date, 
      transaction_type, 
      description,
      payment_method
    } = req.body;
    
    const [result] = await db.query(
      `INSERT INTO Transaction 
       (user_id, category_id, amount, currency_code, transaction_date, transaction_type, description, payment_method) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [user_id, category_id, amount, currency_code, transaction_date, transaction_type, description, payment_method]
    );
    
    res.status(201).json({ 
      transaction_id: result.insertId,
      user_id,
      category_id,
      amount,
      currency_code,
      transaction_date,
      transaction_type,
      description,
      payment_method
    });
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a transaction
router.put('/:transactionId', async (req, res) => {
  try {
    const { 
      category_id, 
      amount, 
      currency_code, 
      transaction_date, 
      transaction_type, 
      description,
      payment_method
    } = req.body;
    
    await db.query(
      `UPDATE Transaction 
       SET category_id = ?, amount = ?, currency_code = ?, transaction_date = ?, 
           transaction_type = ?, description = ?, payment_method = ?
       WHERE transaction_id = ?`,
      [category_id, amount, currency_code, transaction_date, transaction_type, description, payment_method, req.params.transactionId]
    );
    
    res.json({ 
      transaction_id: parseInt(req.params.transactionId),
      category_id,
      amount,
      currency_code,
      transaction_date,
      transaction_type,
      description,
      payment_method
    });
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a transaction
router.delete('/:transactionId', async (req, res) => {
  try {
    await db.query('DELETE FROM Transaction WHERE transaction_id = ?', [req.params.transactionId]);
    
    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get transaction summary for a user
router.get('/summary/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { period, startDate, endDate } = req.query;
    
    let timeFilter = '';
    const queryParams = [userId];
    
    if (startDate && endDate) {
      timeFilter = 'AND t.transaction_date BETWEEN ? AND ?';
      queryParams.push(startDate, endDate);
    } else if (period) {
      let dateFilter;
      const now = new Date();
      
      switch(period) {
        case 'week':
          // Calculate first day of current week (Sunday)
          const firstDayOfWeek = new Date(now);
          firstDayOfWeek.setDate(now.getDate() - now.getDay());
          firstDayOfWeek.setHours(0, 0, 0, 0);
          dateFilter = firstDayOfWeek.toISOString().split('T')[0];
          break;
        case 'month':
          dateFilter = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-01`;
          break;
        case 'year':
          dateFilter = `${now.getFullYear()}-01-01`;
          break;
        default:
          dateFilter = '1900-01-01'; // All time
      }
      
      timeFilter = 'AND t.transaction_date >= ?';
      queryParams.push(dateFilter);
    }
    
    // Get total income and expense
    const [summary] = await db.query(
      `SELECT 
        SUM(CASE WHEN t.transaction_type = 'Income' THEN 
          t.amount * (SELECT exchange_rate_to_usd FROM CurrencyExchange WHERE currency_code = t.currency_code) 
          ELSE 0 END) as total_income,
        SUM(CASE WHEN t.transaction_type = 'Expense' THEN 
          t.amount * (SELECT exchange_rate_to_usd FROM CurrencyExchange WHERE currency_code = t.currency_code) 
          ELSE 0 END) as total_expense,
        (SELECT base_currency FROM User WHERE user_id = ?) as base_currency
      FROM Transaction t
      WHERE t.user_id = ? ${timeFilter}`,
      [userId, ...queryParams]
    );
    
    // Get spending by category
    const [categories] = await db.query(
      `SELECT 
        c.category_id, 
        c.category_name, 
        c.category_type,
        SUM(t.amount * (SELECT exchange_rate_to_usd FROM CurrencyExchange WHERE currency_code = t.currency_code)) as total_amount
      FROM Transaction t
      JOIN Category c ON t.category_id = c.category_id
      WHERE t.user_id = ? ${timeFilter}
      GROUP BY c.category_id
      ORDER BY total_amount DESC`,
      queryParams
    );
    
    res.json({
      summary: summary[0],
      categories
    });
  } catch (error) {
    console.error('Error getting transaction summary:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;