const mysql = require('mysql2/promise');
const dbConfig = require('../config/database').dbConfig;

// Function to execute transactions with proper isolation level
async function executeTransaction(operations, isolationLevel = 'REPEATABLE READ') {
  let connection;
  try {
    // Create connection
    connection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
      database: dbConfig.database
    });
    
    // Start transaction with specified isolation level
    await connection.execute(`SET TRANSACTION ISOLATION LEVEL ${isolationLevel}`);
    await connection.beginTransaction();
    
    // Execute all operations
    const results = [];
    for (const operation of operations) {
      const [result] = await connection.execute(operation.query, operation.params);
      results.push(result);
    }
    
    // Commit transaction
    await connection.commit();
    
    // Close connection
    await connection.end();
    
    // Return results
    return results;
    
  } catch (error) {
    // Rollback transaction on error
    if (connection) {
      await connection.rollback();
      await connection.end();
    }
    console.error('Transaction error:', error);
    throw error;
  }
}

// Function to transfer money between savings goals
async function transferBetweenSavingsGoals(userId, fromGoalId, toGoalId, amount) {
  const operations = [
    {
      query: `UPDATE SavingsGoal SET current_savings = current_savings - ? 
              WHERE goal_id = ? AND user_id = ? AND current_savings >= ?`,
      params: [amount, fromGoalId, userId, amount]
    },
    {
      query: `UPDATE SavingsGoal SET current_savings = current_savings + ? 
              WHERE goal_id = ? AND user_id = ?`,
      params: [amount, toGoalId, userId]
    },
    {
      // Insert record in transaction table
      query: `INSERT INTO Transaction (user_id, category_id, amount, currency_code, 
              transaction_date, transaction_type, description) 
              VALUES (?, 1, ?, 'USD', CURDATE(), 'Transfer', CONCAT('Transfer from goal #', ?, ' to goal #', ?))`,
      params: [userId, amount, fromGoalId, toGoalId]
    }
  ];
  
  // Execute with serializable isolation level for sensitive financial operations
  return executeTransaction(operations, 'SERIALIZABLE');
}

// Function to process a batch of transactions
async function batchProcessTransactions(userId, transactions) {
  const operations = transactions.map(transaction => ({
    query: `INSERT INTO Transaction (user_id, category_id, amount, currency_code, 
            transaction_date, transaction_type, description, payment_method) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    params: [
      userId,
      transaction.category_id,
      transaction.amount,
      transaction.currency_code,
      transaction.transaction_date || new Date().toISOString().split('T')[0],
      transaction.transaction_type,
      transaction.description,
      transaction.payment_method || 'Other'
    ]
  }));
  
  // Execute with read committed isolation level for better concurrency
  return executeTransaction(operations, 'READ COMMITTED');
}

module.exports = {
  executeTransaction,
  transferBetweenSavingsGoals,
  batchProcessTransactions
};
