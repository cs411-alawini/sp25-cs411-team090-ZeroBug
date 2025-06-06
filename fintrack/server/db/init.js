const mysql = require('mysql2/promise');
const dbConfig = require('../config/database').dbConfig;

async function initializeDatabase() {
  // Connect without specifying a database first
  const connection = await mysql.createConnection({
    host: dbConfig.host,
    user: dbConfig.user,
    password: dbConfig.password
  });

  // Create the database if it doesn't exist
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\``);
  // Select the database to use
  await connection.query(`USE \`${dbConfig.database}\``);

  // Create the User table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS User (
      user_id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100),
      email VARCHAR(100) UNIQUE,
      password_hash VARCHAR(255),
      base_currency VARCHAR(3) DEFAULT 'USD'
    )
  `);

  // Create the Category table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS Category (
      category_id INT AUTO_INCREMENT PRIMARY KEY,
      category_name VARCHAR(50),
      category_type ENUM('Income', 'Expense'),
      user_id INT,
      FOREIGN KEY (user_id) REFERENCES User(user_id),
      UNIQUE KEY (category_name, user_id)
    )
  `);

  // Create the CurrencyExchange table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS CurrencyExchange (
      currency_code VARCHAR(3) PRIMARY KEY,
      exchange_rate DECIMAL(10,4),
      last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  // Create the Transaction table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS Transaction (
      transaction_id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT,
      category_id INT,
      amount DECIMAL(10,2),
      currency_code VARCHAR(3),
      transaction_date DATE,
      transaction_type ENUM('Income', 'Expense'),
      description TEXT,
      payment_method VARCHAR(50),
      FOREIGN KEY (user_id) REFERENCES User(user_id),
      FOREIGN KEY (category_id) REFERENCES Category(category_id),
      FOREIGN KEY (currency_code) REFERENCES CurrencyExchange(currency_code)
    )
  `);

  // Create the SavingsGoal table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS SavingsGoal (
      goal_id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT,
      goal_name VARCHAR(100),
      target_amount DECIMAL(10,2),
      current_amount DECIMAL(10,2) DEFAULT 0,
      currency_code VARCHAR(3),
      start_date DATE,
      deadline DATE,
      FOREIGN KEY (user_id) REFERENCES User(user_id),
      FOREIGN KEY (currency_code) REFERENCES CurrencyExchange(currency_code)
    )
  `);

  // Create the Budget table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS Budget (
      budget_id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT,
      category_id INT,
      amount DECIMAL(10,2),
      currency_code VARCHAR(3),
      period ENUM('Daily', 'Weekly', 'Monthly', 'Yearly'),
      start_date DATE,
      FOREIGN KEY (user_id) REFERENCES User(user_id),
      FOREIGN KEY (category_id) REFERENCES Category(category_id),
      FOREIGN KEY (currency_code) REFERENCES CurrencyExchange(currency_code)
    )
  `);

  // Insert some default currencies
  await connection.query(`
    INSERT IGNORE INTO CurrencyExchange (currency_code, exchange_rate_to_base) VALUES 
    ('USD', 1.0),
    ('EUR', 0.91),
    ('GBP', 0.78),
    ('JPY', 151.77),
    ('CNY', 7.23)
  `);

  // Check if 'balance' column exists
  const [columns] = await connection.query(`
    SHOW COLUMNS FROM User LIKE 'balance'
  `);
  if (columns.length === 0) {
    await connection.query(`
      ALTER TABLE User
      ADD COLUMN balance DECIMAL(15,2) DEFAULT 0
    `);
  }

  // Drop triggers if they exist (to avoid duplicate triggers on re-init)
  await connection.query(`DROP TRIGGER IF EXISTS after_transaction_insert`);
  await connection.query(`DROP TRIGGER IF EXISTS after_transaction_update`);
  await connection.query(`DROP TRIGGER IF EXISTS after_transaction_delete`);

  // Trigger: After INSERT on Transaction
  await connection.query(`
    CREATE TRIGGER after_transaction_insert
    AFTER INSERT ON Transaction
    FOR EACH ROW
    BEGIN
      IF NEW.transaction_type = 'Income' THEN
        UPDATE User SET balance = balance + NEW.amount WHERE user_id = NEW.user_id;
      ELSE
        UPDATE User SET balance = balance - NEW.amount WHERE user_id = NEW.user_id;
      END IF;
    END
  `);

  // Trigger: After UPDATE on Transaction
  await connection.query(`
    CREATE TRIGGER after_transaction_update
    AFTER UPDATE ON Transaction
    FOR EACH ROW
    BEGIN
      -- Revert the old value
      IF OLD.transaction_type = 'Income' THEN
        UPDATE User SET balance = balance - OLD.amount WHERE user_id = OLD.user_id;
      ELSE
        UPDATE User SET balance = balance + OLD.amount WHERE user_id = OLD.user_id;
      END IF;
      -- Apply the new value
      IF NEW.transaction_type = 'Income' THEN
        UPDATE User SET balance = balance + NEW.amount WHERE user_id = NEW.user_id;
      ELSE
        UPDATE User SET balance = balance - NEW.amount WHERE user_id = NEW.user_id;
      END IF;
    END
  `);

  // Trigger: After DELETE on Transaction
  await connection.query(`
    CREATE TRIGGER after_transaction_delete
    AFTER DELETE ON Transaction
    FOR EACH ROW
    BEGIN
      IF OLD.transaction_type = 'Income' THEN
        UPDATE User SET balance = balance - OLD.amount WHERE user_id = OLD.user_id;
      ELSE
        UPDATE User SET balance = balance + OLD.amount WHERE user_id = OLD.user_id;
      END IF;
    END
  `);

  console.log('Database initialized successfully!');
  await connection.end();
}

module.exports = { initializeDatabase };