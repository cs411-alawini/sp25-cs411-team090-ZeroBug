const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');

const app = express();
app.use(bodyParser.json());

// Use the static middleware to serve files from public directory
app.use(express.static('public'));

const dbConfig = {
  host: '34.16.23.49',
  user: 'yuhao',
  database: 'fintrack_db'
};

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
      base_currency VARCHAR(3)
    )
  `);

  // Create the Category table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS Category (
      category_id INT AUTO_INCREMENT PRIMARY KEY,
      category_name VARCHAR(50) UNIQUE,
      category_type ENUM('Income', 'Expense')
    )
  `);

  // Create the CurrencyExchange table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS CurrencyExchange (
      currency_code VARCHAR(3) PRIMARY KEY,
      exchange_rate_to_base DECIMAL(10,4),
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
      transaction_type VARCHAR(50),
      description TEXT,
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
      current_savings DECIMAL(10,2),
      deadline DATE,
      FOREIGN KEY (user_id) REFERENCES User(user_id)
    )
  `);

  console.log('Database initialized successfully!');
  await connection.end();
}

// Remove or comment out this route as it overrides the static file serving
// app.get('/', function (req, res) {
//   res.send({ message: 'Hello' });
// });

app.listen(3000, '0.0.0.0', async function () {
  try {
    await initializeDatabase();
    console.log('Node app is running on port 3000');
  } catch (err) {
    console.error('Database initialization failed:', err);
  }
});
