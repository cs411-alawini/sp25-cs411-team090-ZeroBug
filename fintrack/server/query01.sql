USE fintrack_db;

SELECT 
  ca.category_type,
  SUM(t.amount * cx.exchange_rate_to_base) AS TotalExpense
FROM Transaction t
INNER JOIN Category ca ON t.category_id = ca.category_id
INNER JOIN CurrencyExchange cx ON t.currency_code = cx.currency_code
WHERE t.transaction_type = 'Normal'
GROUP BY ca.category_type
ORDER BY TotalExpense DESC
LIMIT 15;