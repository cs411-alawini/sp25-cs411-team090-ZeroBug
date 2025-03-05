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
- **User ↔ Transaction (1:M):** A user can have multiple transactions.
- **Transaction ↔ Category (M:1):** Each transaction belongs to one category.
- **User ↔ SavingsGoal (1:M):** A user can define multiple savings goals.
- **Transaction ↔ Currency Exchange (M:1):** Each transaction has a currency that is converted using real-time rates.

## Normalization - 3NF Compliance

- **User Table**: No repeating groups, dependencies on primary key only.
- **Transaction Table**: Ensures each transaction is uniquely defined and avoids data redundancy.
- **Category Table**: Ensures each category is unique, eliminating duplicate categories.
- **SavingsGoal Table**: Keeps user savings goals separate from transactions, preventing redundancy.
- **Currency Exchange Table**: Stores currency conversion separately to avoid duplication in transactions.

## Logical Design / Relational Schema

- **User(user_id: INT [PK], name: VARCHAR(100), email: VARCHAR(100) UNIQUE, password_hash: VARCHAR(255), base_currency: VARCHAR(3))**
- **Transaction(transaction_id: INT [PK], user_id: INT [FK to User.user_id], category_id: INT [FK to Category.category_id], amount: DECIMAL(10,2), currency_code: VARCHAR(3) [FK to CurrencyExchange.currency_code], transaction_date: DATE, transaction_type: VARCHAR(50), description: TEXT)**
- **Category(category_id: INT [PK], category_name: VARCHAR(50) UNIQUE, category_type: ENUM('Income', 'Expense'))**
- **SavingsGoal(goal_id: INT [PK], user_id: INT [FK to User.user_id], goal_name: VARCHAR(100), target_amount: DECIMAL(10,2), current_savings: DECIMAL(10,2), deadline: DATE)**
- **CurrencyExchange(currency_code: VARCHAR(3) [PK], exchange_rate_to_base: DECIMAL(10,4), last_updated: TIMESTAMP)**

