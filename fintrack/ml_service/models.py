from sklearn.ensemble import RandomForestRegressor, IsolationForest
from sklearn.linear_model import LinearRegression
import joblib
import os

def get_model_path(category):
    """Return path to save/load model for a given category"""
    # Create models directory if it doesn't exist
    if not os.path.exists('models'):
        os.makedirs('models')
    return f'models/{category.replace(" ", "_").lower()}_model.joblib'

def save_model(model, category):
    """Save model to disk"""
    joblib.dump(model, get_model_path(category))

def load_model(category):
    """Load model from disk if exists, otherwise return None"""
    model_path = get_model_path(category)
    if os.path.exists(model_path):
        return joblib.load(model_path)
    return None

def create_spending_predictor(features_train, target):
    """Create and train a Random Forest model for spending prediction"""
    model = RandomForestRegressor(
        n_estimators=100,
        max_depth=10,
        random_state=42
    )
    model.fit(features_train, target)
    return model

def create_anomaly_detector(features):
    """Create and train an Isolation Forest model for anomaly detection"""
    model = IsolationForest(
        contamination=0.05,  # Assume 5% of transactions are anomalies
        random_state=42
    )
    model.fit(features)
    return model