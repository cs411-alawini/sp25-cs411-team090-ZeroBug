# Final Project Report - FinTrack

## Changes from Original Proposal

### Schema and Data Source Changes
- Added support for payment methods in transactions
- Enhanced currency exchange tracking with timestamps
- Integrated with ExchangeRate.host API for real-time currency rates
- Implemented automated currency rate updates
- Created data generation scripts for testing using Faker library

### ER Diagram and Table Implementation Changes
- Enhanced Entity Relationships
  - A balance column was added. This improves clarity and simplifies trigger implementation. It provides a cleaner and more efficient process compared to the original design.

### Table Structure Improvements
- Added transaction triggers for maintaining data consistency
- Added support for different transaction types
- Enhanced currency exchange tracking

## Added Features

### Advanced Transaction Management
- Batch transaction processing
- Transaction isolation levels
- Advanced search with SET operations
- Multi-currency support with real-time conversion

### Security Enhancements
- Password hashing
- Transaction isolation levels for data consistency
- Input validation and sanitization

## Removed Features
- Real-time currency exchange rate graph: Instead of displaying real-time rates, the system uses the exchange rate at the time of the transaction.
- Explicit budget rates: Focus shifted to savings goals. Users can create and contribute to saving goals and use a budget recommendation system to evaluate their spending.

## Advanced Database Program Implementation

### Triggers
- Automatic balance updates
- Transaction validation triggers
- Currency conversion triggers

### Stored Procedures
- Financial analysis procedures
- Transaction processing procedures

## Usefulness
The application allows users to:
- Log into individual accounts
- Categorize spending
- Add new spending and income entries
- Visualize transactions with graphs and diagrams
- Predict future spending and budget recommendations

It is highly useful for users who want a clean, efficient way to track and plan their finances.

## Technical Challenges

### Hanna
- **Challenge**: Implementing real-time currency conversion while maintaining data consistency.
- **Solution**: Created a dedicated `CurrencyExchange` table with timestamps and implemented a cron job for regular updates.

### Yuhao
- **Challenge**: Misconfiguration of MySQL@GCP led to unnecessary spending of $125.
- **Solution**: Changed server settings to be more resource-efficient.

### Hanzhang
- **Challenge**: Updating schema while preserving existing data.
- **Solution**: Developed migration scripts with comprehensive validation checks to ensure data consistency before applying changes.

### Tong
- **Challenge**: Debugging advanced queries without sufficient edge case data.
- **Solution**: Manually generated edge case data to ensure query robustness.

## Future Improvements
- Optimize query performance for large datasets
- Implement better indexing strategies
- Explore caching strategies for frequently repeated queries

## Team Collaboration and Division of Labor

| Member   | Responsibilities                                       |
|----------|---------------------------------------------------------|
| Hanna    | Backend development, database design, API implementation, transaction management |
| Yuhao    | Frontend development, UI/UX design, currency exchange integration, data visualization |
| Hanzhang | Data processing, schema design, testing, documentation   |
| Tong     | Deployment, performance optimization, security implementation, integration testing |

The team maintained effective collaboration through regular meetings, code reviews, and consistent version control using Git with clear branching strategies.

