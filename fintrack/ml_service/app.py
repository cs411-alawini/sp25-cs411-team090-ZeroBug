from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
import joblib
import os
import logging
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Models cache
models = {}

def handle_sparse_data(transactions):
    """
    Handle sparse data from 2019 only by creating synthetic data points
    that maintain seasonal patterns but extend into current period.
    """
    df = pd.DataFrame(transactions)
    
    # Convert to datetime
    df['date'] = pd.to_datetime(df['transaction_date'])
    df['year'] = df['date'].dt.year
    df['month'] = df['date'].dt.month
    df['day'] = df['date'].dt.day
    
    # Validation
    if df.empty:
        return df
    
    # Check if we only have 2019 data
    years_available = df['year'].unique()
    current_year = datetime.now().year
    
    if len(years_available) == 1 and years_available[0] < current_year:
        logger.info(f"Only data from {years_available[0]} available. Creating synthetic data points.")
        
        # Create synthetic data by shifting dates forward
        synthetic_records = []
        
        # Calculate how many years to shift
        years_to_shift = current_year - years_available[0]
        
        # Copy patterns from 2019 to current period
        for _, row in df.iterrows():
            # Create entries for each year in between
            for year_shift in range(1, years_to_shift + 1):
                new_row = row.copy()
                
                # Shift the date forward by 'year_shift' years
                new_date = row['date'] + pd.DateOffset(years=year_shift)
                new_row['date'] = new_date
                new_row['transaction_date'] = new_date.strftime('%Y-%m-%d')
                new_row['year'] = new_date.year
                
                # Add some random variation to the amount (±20%)
                variation = np.random.uniform(0.8, 1.2)
                new_row['amount'] = float(row['amount']) * variation
                
                synthetic_records.append(new_row)
        
        # Combine original and synthetic data
        extended_df = pd.concat([df, pd.DataFrame(synthetic_records)], ignore_index=True)
        logger.info(f"Extended data from {len(df)} to {len(extended_df)} records")
        return extended_df
    
    return df

@app.route('/api/ml/predict', methods=['POST'])
def predict_spending():
    """
    Predict future spending based on historical transaction data.
    """
    try:
        # Get transaction data from request
        data = request.json
        transactions = data.get('transactions', [])
        
        if not transactions:
            return jsonify({'error': 'No transaction data provided'}), 400
            
        # Process data accounting for sparsity
        df = handle_sparse_data(transactions)
        
        if df.empty:
            return jsonify({'error': 'No valid transaction data after processing'}), 400
        
        # Feature engineering
        df['amount_abs'] = df['amount'].abs()
        df['month_sin'] = np.sin(2 * np.pi * df['month']/12)
        df['month_cos'] = np.cos(2 * np.pi * df['month']/12)
        df['day_sin'] = np.sin(2 * np.pi * df['day']/31)
        df['day_cos'] = np.cos(2 * np.pi * df['day']/31)
        
        # Process features by category
        predictions = {}
        category_trends = {}
        
        for category in df['category_name'].unique():
            category_data = df[df['category_name'] == category]
            
            # Only predict if we have sufficient data points
            if len(category_data) >= 5:
                # Features for prediction
                X = category_data[['month_sin', 'month_cos', 'day_sin', 'day_cos', 'year']]
                y = category_data['amount_abs']
                
                # Train Random Forest model
                model = RandomForestRegressor(n_estimators=50, random_state=42)
                model.fit(X, y)
                
                # Store model for future use
                models[category] = model
                
                # Predict next 3 months
                next_months = []
                today = datetime.now()
                
                for i in range(1, 4):
                    future_date = today + timedelta(days=30*i)
                    month = future_date.month
                    day = future_date.day
                    year = future_date.year
                    
                    features = np.array([[
                        np.sin(2 * np.pi * month/12),
                        np.cos(2 * np.pi * month/12),
                        np.sin(2 * np.pi * day/31),
                        np.cos(2 * np.pi * day/31),
                        year
                    ]])
                    
                    prediction = float(model.predict(features)[0])
                    next_months.append({
                        'month': future_date.strftime('%B %Y'),
                        'value': prediction
                    })
                
                # Calculate trend
                if len(category_data) >= 10:
                    # Sort by date to get chronological order
                    sorted_data = category_data.sort_values('date')
                    recent_avg = sorted_data.iloc[-5:]['amount_abs'].mean()
                    earlier_avg = sorted_data.iloc[-10:-5]['amount_abs'].mean()
                    
                    if earlier_avg > 0:
                        percent_change = ((recent_avg - earlier_avg) / earlier_avg) * 100
                        trend = 'increasing' if percent_change > 0 else 'decreasing'
                        trend_percent = abs(int(percent_change))
                    else:
                        trend = 'stable'
                        trend_percent = 0
                else:
                    trend = 'unknown'
                    trend_percent = 0
                
                category_trends[category] = {
                    'trend': trend,
                    'trendPercent': trend_percent
                }
                    
                predictions[category] = next_months
        
        # Calculate total predicted spending by month
        total_by_month = {}
        
        for category, months in predictions.items():
            for month_data in months:
                month_name = month_data['month']
                if month_name not in total_by_month:
                    total_by_month[month_name] = 0
                total_by_month[month_name] += month_data['value']
        
        monthly_predictions = [
            {'month': month, 'totalPredicted': amount}
            for month, amount in total_by_month.items()
        ]
        
        # Sort by chronological order
        monthly_predictions.sort(key=lambda x: 
            datetime.strptime(x['month'], '%B %Y'))
        
        # Detect spending anomalies
        anomalies = detect_anomalies(df)
            
        return jsonify({
            'categoryPredictions': [
                {
                    'category': category,
                    'predictions': predictions[category],
                    'trend': category_trends.get(category, {}).get('trend', 'unknown'),
                    'trendPercent': category_trends.get(category, {}).get('trendPercent', 0)
                }
                for category in predictions
            ],
            'monthlyPredictions': monthly_predictions,
            'anomalies': anomalies
        })
        
    except Exception as e:
        logger.exception("Error in prediction endpoint")
        return jsonify({'error': str(e)}), 500

def detect_anomalies(df):
    """
    Detect anomalies in transaction data using statistical methods.
    """
    anomalies = []
    
    # Group by category
    for category in df['category_name'].unique():
        category_data = df[df['category_name'] == category]
        
        if len(category_data) < 5:  # Skip categories with too few data points
            continue
        
        amounts = category_data['amount_abs']
        avg = amounts.mean()
        std = amounts.std()
        
        # If std is 0, set a minimal value to avoid division by zero
        if std == 0:
            std = avg * 0.1 if avg > 0 else 1
        
        # Find transactions more than 2 standard deviations away from mean
        threshold = avg + 2 * std
        
        outliers = category_data[amounts > threshold]
        
        for _, row in outliers.iterrows():
            anomalies.append({
                'category': category,
                'date': row['date'].strftime('%Y-%m-%d'),
                'amount': float(row['amount_abs']),
                'description': row.get('description', ''),
                'average': float(avg),
                'diff_percent': int(((row['amount_abs'] - avg) / avg) * 100)
            })
    
    # Sort by deviation percentage (highest first)
    anomalies.sort(key=lambda x: x['diff_percent'], reverse=True)
    
    return anomalies[:10]  # Return top 10 anomalies

@app.route('/api/ml/budget', methods=['POST'])
def recommend_budget():
    """
    Generate budget recommendations based on historical spending.
    """
    try:
        # Get transaction data from request
        data = request.json
        transactions = data.get('transactions', [])
        
        if not transactions:
            return jsonify({'error': 'No transaction data provided'}), 400
            
        # Process data accounting for sparsity
        df = handle_sparse_data(transactions)
        
        if df.empty:
            return jsonify({'error': 'No valid transaction data after processing'}), 400
        
        # Extract expense transactions only
        expenses_df = df[df['transaction_type'] == 'Expense']
        
        # Group transactions by category and month
        expenses_df['month_year'] = expenses_df['date'].dt.strftime('%Y-%m')
        category_monthly = expenses_df.groupby(['category_name', 'month_year'])['amount_abs'].sum().reset_index()
        
        # Get distinct categories and months
        categories = expenses_df['category_name'].unique()
        month_years = expenses_df['month_year'].unique()
        
        recommendations = []
        
        for category in categories:
            category_data = category_monthly[category_monthly['category_name'] == category]
            
            if len(category_data) >= 2:  # At least 2 months of data
                # Calculate statistics
                amounts = category_data['amount_abs']
                avg_spending = float(amounts.mean())
                std_dev = float(amounts.std() if len(amounts) > 1 else amounts.mean() * 0.1)
                cv = std_dev / avg_spending if avg_spending > 0 else 1
                
                # Determine consistency
                if cv < 0.3:
                    consistency = 'High'
                elif cv < 0.6:
                    consistency = 'Medium'
                else:
                    consistency = 'Low'
                
                # Calculate recommended budget with buffer based on consistency
                if consistency == 'High':
                    buffer = 1.1  # 10% buffer for consistent spending
                elif consistency == 'Medium':
                    buffer = 1.2  # 20% buffer for medium consistency
                else:
                    buffer = 1.3  # 30% buffer for inconsistent spending
                
                recommended_budget = avg_spending * buffer
                
                recommendations.append({
                    'category': category,
                    'avgSpending': avg_spending,
                    'recommendedBudget': recommended_budget,
                    'consistency': consistency,
                    'months': len(category_data)
                })
        
        # Sort by average spending (highest first)
        recommendations.sort(key=lambda x: x['avgSpending'], reverse=True)
        
        return jsonify({
            'recommendations': recommendations
        })
        
    except Exception as e:
        logger.exception("Error in budget recommendation endpoint")
        return jsonify({'error': str(e)}), 500

@app.route('/api/ml/health', methods=['GET'])
def health_check():
    """
    Simple health check endpoint.
    """
    return jsonify({'status': 'healthy', 'service': 'ML prediction service'})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)