const mysql = require('mysql2/promise');

const dbConfig = {
  host: '34.58.76.253',
  user: 'yuhao',
  database: 'fintrack_db'
};

// Create a pool instead of a single connection for better performance
const pool = mysql.createPool(dbConfig);

// Export the pool to be used by other modules
module.exports = pool;