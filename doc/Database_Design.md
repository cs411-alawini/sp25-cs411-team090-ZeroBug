```sql
CREATE TABLE User (
    user_id INT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    password_hash VARCHAR(255),
    base_currency VARCHAR(3)
);
```
```sql
CREATE TABLE Category (
    category_id INT PRIMARY KEY,
    category_name VARCHAR(50) UNIQUE,
    category_type VARCHAR(10)
);
``
```sql
CREATE TABLE CurrencyExchange (
    currency_code VARCHAR(3) PRIMARY KEY,
    exchange_rate_to_base DECIMAL(10,4),
    last_updated TIMESTAMP
);
```
```sql
CREATE TABLE Transaction (
    transaction_id INT PRIMARY KEY,
    user_id INT,
    category_id INT,
    amount DECIMAL(10,2),
    currency_code VARCHAR(3),
    transaction_date DATE,
    transaction_type VARCHAR(50),
    description TEXT,
    FOREIGN KEY (user_id) REFERENCES User(user_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES Category(category_id),
    FOREIGN KEY (currency_code) REFERENCES CurrencyExchange(currency_code)
);
```

```sql
CREATE TABLE SavingsGoal (
    goal_id INT PRIMARY KEY,
    user_id INT,
    goal_name VARCHAR(100),
    target_amount DECIMAL(10,2),
    current_savings DECIMAL(10,2),
    deadline DATE,
    FOREIGN KEY (user_id) REFERENCES User(user_id) ON DELETE CASCADE
);
```

# Advanced Queries

## Total Expense by Category

```sql
SELECT 
  u.name,
  u.base_currency,
  SUM(t.amount * cx.exchange_rate_to_base) AS total_spent
FROM Transaction t
JOIN User u ON t.user_id = u.user_id
JOIN CurrencyExchange cx ON t.currency_code = cx.currency_code
WHERE t.transaction_type = 'Normal'
GROUP BY u.user_id
ORDER BY total_spent DESC
LIMIT 15;
```


The next query gets transactions where amount is greater than the avg transaction amount for the same person.
```sql
SELECT 
  t.transaction_id,
  u.user_id,
  u.name,
  t.amount,
  t.transaction_date
FROM Transaction t
JOIN User u ON t.user_id = u.user_id
WHERE t.amount > (
    SELECT AVG(t2.amount)
    FROM Transaction t2
    WHERE t2.user_id = t.user_id
)
ORDER BY t.amount DESC
LIMIT 15;
```
![image](https://github.com/user-attachments/assets/55f37f22-58bd-4ad9-8db4-ef67bfe238fa)

 *Comparing Expense vs. Income Totals by User*
The next query uses a UNION ALL to combine expense and income totals per user. 
```sql
(SELECT 
  u.user_id,
  u.name,
  'Expense' AS trans_type,
  SUM(t.amount * cx.exchange_rate_to_base) AS Total
FROM Transaction t
JOIN User u ON t.user_id = u.user_id
JOIN CurrencyExchange cx ON t.currency_code = cx.currency_code
WHERE t.transaction_type = 'Normal'
GROUP BY u.user_id, u.name)
UNION ALL
(SELECT 
  u.user_id,
  u.name,
  'Income' AS trans_type,
  SUM(t.amount * cx.exchange_rate_to_base) AS Total
FROM Transaction t
JOIN User u ON t.user_id = u.user_id
JOIN CurrencyExchange cx ON t.currency_code = cx.currency_code
WHERE t.transaction_type = 'Income'
GROUP BY u.user_id, u.name)
ORDER BY Total DESC
LIMIT 15;
```
![image](https://github.com/user-attachments/assets/62b49bc0-9bbe-406f-b252-8eb9ba0e35e9)

The next query finds users who have never made a transaction in a given category ("Food" in this case).

```sql
SELECT 
  u.user_id,
  u.name,
  u.email
FROM User u
WHERE u.user_id NOT IN (
    SELECT t.user_id
    FROM Transaction t
    JOIN Category ca ON t.category_id = ca.category_id
    WHERE ca.category_name = 'Food'
)
LIMIT 15;
```
![image](https://github.com/user-attachments/assets/2af80210-fa42-406d-ba99-902a3c570363)






