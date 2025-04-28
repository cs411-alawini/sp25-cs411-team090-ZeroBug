const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');

// Import route files
const usersRouter = require('./routes/users');
const transactionsRouter = require('./routes/transactions');
const categoriesRouter = require('./routes/categories');
const currencyRouter = require('./routes/currency');
const savingsRouter = require('./routes/savings');
const indexRouter = require('./routes/index');
const { initializeDatabase } = require('./db/init');
const analysisRouter = require('./routes/analysis');

const app = express();
app.use(bodyParser.json());

// Use the static middleware to serve files from public directory
app.use(express.static('public'));

const dbConfig = {
  host: '34.58.76.253',
  user: 'yuhao',
  database: 'fintrack_db'
};

// Initialize database on startup
initializeDatabase().catch(err => {
  console.error('Database initialization failed:', err);
  process.exit(1);
});

// Use API routes
app.use('/', indexRouter);
app.use('/api/users', usersRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/currency', currencyRouter);
app.use('/api/savings', savingsRouter);
app.use('/api/analysis', analysisRouter);

// Remove or comment out this route as it overrides the static file serving
// app.get('/', function (req, res) {
//   res.send({ message: 'Hello' });
// });

// Comment out or remove the direct listening
// app.listen(3000, '0.0.0.0', function () {
//   console.log('Node app is running on port 3000');
// });

require('./cron/currencyUpdater');

// Export the app for bin/www to use
module.exports = app;
