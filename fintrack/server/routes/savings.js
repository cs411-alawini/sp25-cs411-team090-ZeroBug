const express = require('express');
const router = express.Router();
const { pool: db } = require('../config/database');

// Get all savings goals for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM SavingsGoal WHERE user_id = ?',
      [req.params.userId]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error getting savings goals:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a specific savings goal
router.get('/:goalId', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM SavingsGoal WHERE goal_id = ?',
      [req.params.goalId]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Savings goal not found' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error getting savings goal:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new savings goal
router.post('/', async (req, res) => {
  try {
    const { user_id, goal_name, target_amount, current_savings, deadline } = req.body;
    
    const [result] = await db.query(
      'INSERT INTO SavingsGoal (user_id, goal_name, target_amount, current_savings, deadline) VALUES (?, ?, ?, ?, ?)',
      [user_id, goal_name, target_amount, current_savings || 0, deadline]
    );
    
    res.status(201).json({ 
      goal_id: result.insertId,
      user_id,
      goal_name,
      target_amount,
      current_savings: current_savings || 0,
      deadline
    });
  } catch (error) {
    console.error('Error creating savings goal:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a savings goal
router.put('/:goalId', async (req, res) => {
  try {
    const { goal_name, target_amount, current_savings, deadline } = req.body;
    
    await db.query(
      'UPDATE SavingsGoal SET goal_name = ?, target_amount = ?, current_savings = ?, deadline = ? WHERE goal_id = ?',
      [goal_name, target_amount, current_savings, deadline, req.params.goalId]
    );
    
    res.json({ 
      goal_id: parseInt(req.params.goalId),
      goal_name,
      target_amount,
      current_savings,
      deadline
    });
  } catch (error) {
    console.error('Error updating savings goal:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
