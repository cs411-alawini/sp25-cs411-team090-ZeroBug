const express = require('express');
const router = express.Router();
const { pool: db } = require('../config/database');
const { executeTransaction, transferBetweenSavingsGoals, batchProcessTransactions } = require('../db/transaction_utils');

// Call stored procedure to analyze user spending
router.get('/spending/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;
    
    // Validate input
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }
    
    // Call stored procedure
    const [results] = await db.query('CALL AnalyzeUserSpending(?, ?, ?)', [
      userId, startDate, endDate
    ]);
    
    // Return all result sets from stored procedure
    res.json({
      summary: results[0],
      categoryBreakdown: results[1],
      monthlyTrend: results[2]
    });
  } catch (error) {
    console.error('Error analyzing spending:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Call stored procedure to calculate budget status
router.get('/budget-status/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { month } = req.query;
    
    // Default to current month if not provided
    const targetMonth = month || new Date().toISOString().split('T')[0];
    
    // Call stored procedure
    const [results] = await db.query('CALL CalculateBudgetStatus(?, ?)', [
      userId, targetMonth
    ]);
    
    // Return budget status results
    res.json(results[0]);
  } catch (error) {
    console.error('Error calculating budget status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Route for transferring between savings goals using transaction
router.post('/transfer-savings', async (req, res) => {
  try {
    const { userId, fromGoalId, toGoalId, amount } = req.body;
    
    // Validate input
    if (!userId || !fromGoalId || !toGoalId || !amount || fromGoalId === toGoalId) {
      return res.status(400).json({ message: 'Invalid transfer parameters' });
    }
    
    // Execute transaction
    await transferBetweenSavingsGoals(userId, fromGoalId, toGoalId, amount);
    
    res.status(200).json({ message: 'Transfer completed successfully' });
  } catch (error) {
    console.error('Error transferring between savings goals:', error);
    res.status(500).json({ message: 'Transfer failed' });
  }
});

// Route for batch processing transactions
router.post('/batch-transactions', async (req, res) => {
  try {
    const { userId, transactions } = req.body;
    
    // Validate input
    if (!userId || !transactions || !Array.isArray(transactions) || transactions.length === 0) {
      return res.status(400).json({ message: 'Invalid batch transaction parameters' });
    }
    
    // Execute batch transaction
    await batchProcessTransactions(userId, transactions);
    
    res.status(200).json({ message: 'Batch processed successfully' });
  } catch (error) {
    console.error('Error processing batch transactions:', error);
    res.status(500).json({ message: 'Batch processing failed' });
  }
});

// Advanced search with combined query
router.get('/advanced-search/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { keywords, categories, minAmount, maxAmount } = req.query;
    
    let keywordArray = [];
    if (keywords) {
      keywordArray = keywords.split(',').map(k => k.trim());
    }
    
    let categoryArray = [];
    if (categories) {
      categoryArray = categories.split(',').map(c => parseInt(c.trim()));
    }
    
    // Build advanced search query with combined conditions
    let query = `
      SELECT t.*, c.category_name,
        CASE 
          WHEN (${keywordArray.length > 0} AND t.category_id IN (${categoryArray.length > 0 ? categoryArray.map(() => '?').join(',') : '0'})) THEN 'both'
          WHEN ${keywordArray.length > 0} THEN 'description_match'
          ELSE 'category_match'
        END as match_type
      FROM Transaction t
      JOIN Category c ON t.category_id = c.category_id
      WHERE t.user_id = ?
    `;

    let conditions = [];
    let params = [userId];

    // Add keyword conditions if present
    if (keywordArray.length > 0) {
      conditions.push(`(${keywordArray.map(() => 't.description LIKE ?').join(' OR ')})`);
      keywordArray.forEach(keyword => {
        params.push(`%${keyword}%`);
      });
    }

    // Add category conditions if present
    if (categoryArray.length > 0) {
      conditions.push(`t.category_id IN (${categoryArray.map(() => '?').join(',')})`);
      params = params.concat(categoryArray);
      // Add category params again for the CASE statement
      params = params.concat(categoryArray);
    }

    // Add amount conditions if present
    if (minAmount) {
      conditions.push('t.amount >= ?');
      params.push(parseFloat(minAmount));
    }
    if (maxAmount) {
      conditions.push('t.amount <= ?');
      params.push(parseFloat(maxAmount));
    }

    // Add WHERE conditions if any exist
    if (conditions.length > 0) {
      query += ` AND (${conditions.join(' OR ')})`;
    }

    query += ` ORDER BY t.transaction_date DESC LIMIT 100`;
    
    const [results] = await db.query(query, params);
    res.json(results);
  } catch (error) {
    console.error('Error in advanced search:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
