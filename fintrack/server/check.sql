USE fintrack_db;

SELECT
    (SELECT COUNT(*) FROM User) AS user_count,
    (SELECT COUNT(*) FROM Transaction) AS transaction_count,
    (SELECT COUNT(*) FROM SavingsGoal) AS savings_goal_count;
