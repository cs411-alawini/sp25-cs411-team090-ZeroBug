const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');

// Import route files
const usersRouter = require('./routes/users');
const transactionsRouter = require('./routes/transactions');
const indexRouter = require('./routes/index');

const app = express();
app.use(bodyParser.json());

// Use the static middleware to serve files from public directory
app.use(express.static('public'));

const dbConfig = {
  host: '34.58.76.253',
  user: 'yuhao',
  database: 'fintrack_db'
};

// Use API routes
app.use('/', indexRouter);
app.use('/api/users', usersRouter);
app.use('/api/transactions', transactionsRouter);

// Remove or comment out this route as it overrides the static file serving
// app.get('/', function (req, res) {
//   res.send({ message: 'Hello' });
// });

app.listen(3000, '0.0.0.0', function () {
  console.log('Node app is running on port 3000');
});
