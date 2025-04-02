![image](https://github.com/user-attachments/assets/7afee5ad-f807-4194-be61-9371fa17bb93)
![image](https://github.com/user-attachments/assets/d70ae702-53f4-4772-88e8-51a08cacac94)



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
```
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


Total Personal Expense for each Person
```sql
SELECT u.Name, u.user_id, (
    SELECT COALESCE(SUM(t1.amount * c1.exchange_rate_to_base), 0)
    FROM Transaction t1
    INNER JOIN CurrencyExchange c1 ON t1.currency_code = c1.currency_code
    INNER JOIN Category ca1 ON ca1.category_id = t1.category_id
    WHERE t1.user_id = u.user_id AND ca1.category_type = 'Expense'
) as PersonalTotalExpense
FROM User u
WHERE (
    SELECT COALESCE(SUM(t1.amount * c1.exchange_rate_to_base), 0)
    FROM Transaction t1
    INNER JOIN CurrencyExchange c1 ON t1.currency_code = c1.currency_code
    INNER JOIN Category ca1 ON ca1.category_id = t1.category_id
    WHERE t1.user_id = u.user_id AND ca1.category_type = 'Expense'
) > (
    SELECT COALESCE(SUM(t1.amount * c1.exchange_rate_to_base), 0)
    FROM Transaction t1
    INNER JOIN CurrencyExchange c1 ON t1.currency_code = c1.currency_code
    INNER JOIN Category ca1 ON ca1.category_id = t1.category_id
    WHERE t1.user_id = u.user_id AND ca1.category_type = 'Income'
)
ORDER BY u.Name DESC
LIMIT 15;
```
![image](https://github.com/user-attachments/assets/85bf3ae0-b66c-4c3a-858b-0d98bbf672e4)

# Indexing
<img width="1090" alt="Screenshot 2025-04-01 at 11 44 35 PM" src="https://github.com/user-attachments/assets/b955e16d-4731-4a06-a1ea-3da4dbcf9733" />
For Users with the Highest Spending in Base Currency
We initially selected two index configurations—idx_user_currency_type (user_id, currency_code, transaction_type) and idx_user_currency (user_id, currency_code)—based on a careful analysis of the query’s structure. Since the query joins the Transaction table to both the User and CurrencyExchange tables using user_id and currency_code, these columns were logical candidates for indexing. Additionally, the query includes a WHERE clause that filters on transaction_type = 'Normal', so we included this column in the composite index idx_user_currency_type to potentially support both filtering and joining in a single index. The second index, idx_user_currency, was a leaner version that prioritized join performance alone, under the assumption that filtering might already be efficiently handled by the query planner. These designs aligned with best practices: indexing join keys, filtering attributes, and avoiding indexing columns not used in the query. Despite testing multiple indexing strategies, including idx_user_currency_type (user_id, currency_code, transaction_type) and idx_user_currency (user_id, currency_code), we found no measurable difference in query performance when using EXPLAIN ANALYZE. The query cost remained unchanged, and the optimizer continued to follow the same execution plan. After analyzing the plan, we observed that MySQL was already efficiently handling the joins using the primary keys on the User and CurrencyExchange tables, and the filter on transaction_type did not benefit from the composite index order. Additionally, the query likely operated on a modest dataset, where full table scans or nested loop joins were not bottlenecks. Therefore, neither index provided a performance advantage. This suggests that the default query execution path was already optimal given the data size and access patterns, and further indexing did not improve it. We concluded that no additional index is needed for this particular query at this scale, though indexing might show benefits in larger datasets.




For the query finding users who never made transaction in given category.
The default had a cost of 89.5
![Screenshot 2025-04-01 234154](https://github.com/user-attachments/assets/7efe866e-5a16-4adf-951d-a25e2d55c6b5)
I created an index on the Category table for category_name, but the cost went up. This increase is likely because category_name has low cardinality. Many rows share the same value ('Food'), so the index lookup did not significantly reduce the number of rows scanned, and the extra index lookup overhead raised the cost.
![image](https://github.com/user-attachments/assets/96fd5bc7-5c02-46ef-b9aa-f11bfd2b919f)
Next, I created a composite index on the Transaction table
![image](https://github.com/user-attachments/assets/56bdc134-d31e-4214-afcd-414091e1dfeb)



