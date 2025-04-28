const axios = require('axios');
const mysql = require('mysql2/promise');
const dbConfig = require('../config/database').dbConfig;
const cron = require('node-cron');

async function updateCurrencyRates() {
  // Fetch rates from exchangerate.host (free, no API key required)
  const base = 'USD'; // or your preferred base currency
  const symbols = ['USD', 'EUR', 'GBP', 'JPY', 'CNY'].join(',');
  const url = `https://api.exchangerate.host/latest?base=${base}&symbols=${symbols}`;

  try {
    const response = await axios.get(url);
    const rates = response.data.rates;

    const connection = await mysql.createConnection(dbConfig);

    for (const [currency, rate] of Object.entries(rates)) {
      await connection.query(
        `INSERT INTO CurrencyExchange (currency_code, exchange_rate)
         VALUES (?, ?)
         ON DUPLICATE KEY UPDATE exchange_rate = VALUES(exchange_rate), last_updated = CURRENT_TIMESTAMP`,
        [currency, rate]
      );
    }

    await connection.end();
    console.log('Currency rates updated successfully!');
  } catch (error) {
    console.error('Error updating currency rates:', error);
  }
}

// Schedule to run every hour
cron.schedule('0 * * * *', () => {
  console.log('Running scheduled currency rate update...');
  updateCurrencyRates();
});

// Optionally, run once at startup
updateCurrencyRates();
