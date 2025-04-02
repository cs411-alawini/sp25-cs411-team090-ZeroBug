import csv
import random
from datetime import datetime, timedelta
from faker import Faker

fake = Faker()

# ----- Configuration -----
input_file = 'credit_card_transactions.csv'
num_rows_to_use = 5000

# Output file names
users_file = 'users_generated.csv'
categories_file = 'categories_generated.csv'
transactions_file = 'transactions_generated.csv'
savings_goals_file = 'savings_goals_generated.csv'
currency_exchange_file = 'currency_exchange.csv'

# ----- Data structures for mapping -----
# For users: map cc_num to a user record.
user_mapping = {}  # key: cc_num, value: dict for user
next_user_id = 1

# For categories: map category string to a category record.
category_mapping = {}  # key: category name, value: dict for category
next_category_id = 1

# List to collect transaction records.
transactions = []

# ----- Process Input CSV (first 3000 rows) -----
with open(input_file, 'r', newline='', encoding='utf-8') as csvfile:
    reader = csv.DictReader(csvfile)
    row_count = 0
    for row in reader:
        if row_count >= num_rows_to_use:
            break
        row_count += 1

        # --- Process User Information ---
        cc_num = row.get('cc_num', '').strip()
        first = row.get('first', '').strip()
        last = row.get('last', '').strip()
        # Construct a name; fallback to a fake name if both missing.
        name = f"{first} {last}".strip() if (first or last) else fake.name()

        # If this credit card number hasn't been seen, create a new user.
        if cc_num not in user_mapping:
            # Generate an email from first and last if possible, otherwise use faker.
            email = f"{first.lower()}.{last.lower()}@example.com" if first and last else fake.email()
            password_hash = fake.sha256()
            base_currency = 'USD'
            user_mapping[cc_num] = {
                'user_id': next_user_id,
                'name': name,
                'email': email,
                'password_hash': password_hash,
                'base_currency': base_currency
            }
            next_user_id += 1

        user_id = user_mapping[cc_num]['user_id']

        # --- Process Category Information ---
        cat = row.get('category', '').strip() or "Unknown"
        if cat not in category_mapping:
            category_mapping[cat] = {
                'category_id': next_category_id,
                'category_name': cat,
                'category_type': "Expense"  # default value; adjust if needed
            }
            next_category_id += 1
        category_id = category_mapping[cat]['category_id']

        # --- Process Transaction Data ---
        try:
            amount = float(row.get('amt', 0))
        except:
            amount = 0.0

        # Extract the date portion from trans_date_trans_time (assumes "YYYY-MM-DD HH:MM:SS" format)
        trans_date_time = row.get('trans_date_trans_time', '')
        if trans_date_time:
            transaction_date = trans_date_time.split()[0]
        else:
            transaction_date = datetime.now().strftime('%Y-%m-%d')

        # Use is_fraud field to set transaction_type
        is_fraud = row.get('is_fraud', '0').strip()
        transaction_type = "Fraud" if is_fraud == '1' else "Normal"

        # Use merchant as description
        description = row.get('merchant', '').strip()

        # Append the transaction record
        transactions.append({
            'user_id': user_id,
            'category_id': category_id,
            'amount': amount,
            'currency_code': 'USD',  # fixed value
            'transaction_date': transaction_date,
            'transaction_type': transaction_type,
            'description': description
        })

# ----- Generate Savings Goals for each unique user -----
savings_goals = []
for user in user_mapping.values():
    uid = user['user_id']
    goal_name = fake.sentence(nb_words=3).rstrip('.')  # e.g., "Save for vacation"
    target_amount = round(random.uniform(1000, 10000), 2)
    current_savings = round(random.uniform(0, target_amount), 2)
    # Deadline: a random future date within 1 to 2 years from now.
    deadline = (datetime.now() + timedelta(days=random.randint(365, 730))).strftime('%Y-%m-%d')
    savings_goals.append({
        'user_id': uid,
        'goal_name': goal_name,
        'target_amount': target_amount,
        'current_savings': current_savings,
        'deadline': deadline
    })

# ----- Generate Fixed Currency Exchange Data -----
currencies = [
    {'currency_code': 'USD', 'exchange_rate_to_base': 1.0},
    {'currency_code': 'EUR', 'exchange_rate_to_base': 0.92},
    {'currency_code': 'GBP', 'exchange_rate_to_base': 0.81},
    {'currency_code': 'JPY', 'exchange_rate_to_base': 130.5},
    {'currency_code': 'AUD', 'exchange_rate_to_base': 1.45},
]
last_updated = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
for curr in currencies:
    curr['last_updated'] = last_updated

# ----- Write Output CSV Files -----
# 1. Users File
with open(users_file, 'w', newline='', encoding='utf-8') as f:
    fieldnames = ['user_id', 'name', 'email', 'password_hash', 'base_currency']
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    for user in user_mapping.values():
        writer.writerow(user)

# 2. Categories File
with open(categories_file, 'w', newline='', encoding='utf-8') as f:
    fieldnames = ['category_id', 'category_name', 'category_type']
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    for cat in category_mapping.values():
        writer.writerow(cat)

# 3. Transactions File
with open(transactions_file, 'w', newline='', encoding='utf-8') as f:
    fieldnames = ['user_id', 'category_id', 'amount', 'currency_code', 'transaction_date', 'transaction_type', 'description']
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(transactions)

# 4. Savings Goals File
with open(savings_goals_file, 'w', newline='', encoding='utf-8') as f:
    fieldnames = ['user_id', 'goal_name', 'target_amount', 'current_savings', 'deadline']
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(savings_goals)

# 5. Currency Exchange File
with open(currency_exchange_file, 'w', newline='', encoding='utf-8') as f:
    fieldnames = ['currency_code', 'exchange_rate_to_base', 'last_updated']
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(currencies)

print("✅ Data generation complete!")
print(f"Users: {users_file}")
print(f"Categories: {categories_file}")
print(f"Transactions: {transactions_file}")
print(f"Savings Goals: {savings_goals_file}")
print(f"Currency Exchange: {currency_exchange_file}")
