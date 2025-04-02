import csv
import random
from datetime import datetime, timedelta
import hashlib
from faker import Faker

fake = Faker()

def generate_password_hash(password):
    return hashlib.sha256(password.encode()).hexdigest()

def generate_users(start_id, count):
    users = []
    for i in range(start_id, start_id + count):
        user = {
            'user_id': i,
            'name': fake.name(),
            'email': fake.email(),
            'password_hash': generate_password_hash(fake.password()),
            'base_currency': 'USD'  # Keeping USD as default
        }
        users.append(user)
    return users

def generate_savings_goals(users):
    goals = []
    for user in users:
        # Generate 1-3 goals per user
        num_goals = random.randint(1, 3)
        for _ in range(num_goals):
            target_amount = round(random.uniform(1000, 10000), 2)
            current_savings = round(random.uniform(0, target_amount), 2)
            
            # Generate deadline between 2026-06-01 and 2027-12-31
            start_date = datetime(2026, 6, 1)
            end_date = datetime(2027, 12, 31)
            days_between = (end_date - start_date).days
            random_days = random.randint(0, days_between)
            deadline = start_date + timedelta(days=random_days)
            
            goal = {
                'user_id': user['user_id'],
                'goal_name': ' '.join(fake.words(random.randint(2, 4))),
                'target_amount': target_amount,
                'current_savings': current_savings,
                'deadline': deadline.strftime('%Y-%m-%d')
            }
            goals.append(goal)
    return goals

# Generate new data starting from user_id 877
new_users = generate_users(877, 200)
new_goals = generate_savings_goals(new_users)

# Create new users file
with open('scripts/new_users_generated.csv', 'w', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=['user_id', 'name', 'email', 'password_hash', 'base_currency'])
    writer.writeheader()  # Write the header first
    for user in new_users:
        writer.writerow(user)

# Create new savings goals file
with open('scripts/new_savings_goals_generated.csv', 'w', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=['user_id', 'goal_name', 'target_amount', 'current_savings', 'deadline'])
    writer.writeheader()  # Write the header first
    for goal in new_goals:
        writer.writerow(goal) 