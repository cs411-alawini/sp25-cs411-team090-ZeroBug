# Conceptual and Logical Database Design

## UML Diagram


![UML Diagram](assets/FinTrack.drawio.svg)
## Assumptions and Description of Entities and Relationships

### Entities

#### **User**
- Stores user account information.
- Each user has a unique identifier, name, email, password hash, and base currency.
- A user can have multiple transactions and savings goals.

#### **Transaction**
- Represents financial transactions logged by users.
- Each transaction is associated with a user and belongs to a category.
- Contains attributes such as amount, currency, date, payment method, and description.

#### **Category**
- Defines transaction types such as "Groceries," "Rent," "Entertainment."
- Each category has a unique identifier and is classified as income or expense.

#### **SavingsGoal**
- Allows users to set and track financial savings goals.
- Each goal is tied to a user with a target amount, current savings, and a deadline.

#### **Currency Exchange**
- Stores real-time currency exchange rates for multi-currency support.
- Used to convert transactions into a base currency for accurate financial tracking.

### Relationships
- **User ↔ Transaction (1:M):**
- Explanation:
A User can record multiple Transaction entries, but each Transaction is associated with only one User.
This ensures that all financial transactions are linked to an individual user for personal tracking and accountability.
- Business Rules:
Each transaction is uniquely owned by a user and cannot be shared.
If a user deletes their account, their associated transactions may either be deleted (if personal records are not needed) or anonymized for analytics.
- **Transaction ↔ Category (M:1):**
- Explanation:
Each Transaction belongs to exactly one Category, such as "Groceries," "Rent," or "Salary."
A single Category can have multiple transactions associated with it, allowing users to analyze spending patterns by category.
- Business Rules:
Every transaction must be assigned a category to maintain financial organization.
Categories are classified as either Income or Expense (category_type attribute).
A transaction cannot belong to multiple categories, ensuring clear classification of each financial entry.
- **User ↔ SavingsGoal (1:M):**
- Explanation:
A User can set multiple SavingsGoal entries to track different financial objectives (e.g., "Vacation Fund," "Emergency Savings").
Each SavingsGoal is exclusively linked to one User, ensuring that savings targets are individualized.
- Business Rules:
Users must define a target_amount and deadline for each savings goal.
Users can update their current_savings periodically to track progress toward their financial objectives.
If a user deletes an account, their savings goals will also be removed or anonymized.
- **Transaction ↔ Currency Exchange (M:1):**
- Explanation:
Each Transaction records a currency_code, which refers to the CurrencyExchange table for exchange rate conversion.
The CurrencyExchange entity stores real-time exchange rates for accurate financial tracking across multiple currencies.
- Business Rules:
Transactions should store the exchange rate at the time of the transaction to ensure historical accuracy.
Exchange rates can be updated regularly (e.g., daily or hourly) from external sources.
If a currency exchange rate is missing, the system should flag the transaction for manual review or fallback to the last known rate.
## Normalization - 3NF Compliance

- **User Table**: No repeating groups, dependencies on primary key only.
- **Transaction Table**: Ensures each transaction is uniquely defined and avoids data redundancy.
- **Category Table**: Ensures each category is unique, eliminating duplicate categories.
- **SavingsGoal Table**: Keeps user savings goals separate from transactions, preventing redundancy.
- **Currency Exchange Table**: Stores currency conversion separately to avoid duplication in transactions.

## Logical Design / Relational Schema

- **User(user_id: INT [PK], name: VARCHAR(100), email: VARCHAR(100) UNIQUE, password_hash: VARCHAR(255), base_currency: VARCHAR(3))**
- **Transaction(transaction_id: INT [PK], user_id: INT [FK to User.user_id], category_id: INT [FK to Category.category_id], amount: DECIMAL(10,2), currency_code: VARCHAR(3) [FK to CurrencyExchange.currency_code], transaction_date: DATE, payment_method: VARCHAR(50), description: TEXT)**
- **Category(category_id: INT [PK], category_name: VARCHAR(50) UNIQUE, category_type: ENUM('Income', 'Expense'))**
- **SavingsGoal(goal_id: INT [PK], user_id: INT [FK to User.user_id], goal_name: VARCHAR(100), target_amount: DECIMAL(10,2), current_savings: DECIMAL(10,2), deadline: DATE)**
- **CurrencyExchange(currency_code: VARCHAR(3) [PK], exchange_rate_to_base: DECIMAL(10,4), last_updated: TIMESTAMP)**

