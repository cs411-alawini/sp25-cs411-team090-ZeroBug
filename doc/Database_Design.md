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

Users with the Highest Spending in Base Currency
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
![image](https://github.com/user-attachments/assets/85fd0c6b-dd9f-44c2-b83f-8f5a02e35e59)


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
GROUP BY t.transaction_id
ORDER BY t.amount DESC
LIMIT 15;
```
![image](https://github.com/user-attachments/assets/55f37f22-58bd-4ad9-8db4-ef67bfe238fa)


Returns how close each user is to the saving goal
```sql
SELECT 
  u.user_id, 
  u.name, 
  sg.goal_name, 
  sg.target_amount, 
  sg.current_savings,
  IFNULL(exp.TotalExpense, 0) AS TotalExpense,
  (sg.target_amount - sg.current_savings - IFNULL(exp.TotalExpense, 0)) AS RemainingToGoal
FROM User u
JOIN SavingsGoal sg ON u.user_id = sg.user_id
LEFT JOIN (
  SELECT 
    t.user_id,
    SUM(t.amount * cx.exchange_rate_to_base) AS TotalExpense
  FROM Transaction t
  JOIN CurrencyExchange cx ON t.currency_code = cx.currency_code
  WHERE t.transaction_type = 'Normal'
  GROUP BY t.user_id
) exp ON u.user_id = exp.user_id
ORDER BY RemainingToGoal ASC
LIMIT 15;
```
![image](https://github.com/user-attachments/assets/1179e3d5-ff35-4a2b-8496-847c7a9cb2c8)

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
    GROUP BY t.user_id
)
LIMIT 15;
```
![image](https://github.com/user-attachments/assets/2af80210-fa42-406d-ba99-902a3c570363)






