import pandas as pd
import numpy as np
from datetime import datetime
import matplotlib.pyplot as plt
import io
import base64

def generate_spending_chart(data, category=None):
    """
    Generate a matplotlib chart for spending trends.
    Returns the chart as a base64 encoded string.
    """
    plt.figure(figsize=(10, 6))
    
    if category:
        # Filter data for specific category
        category_data = data[data['category_name'] == category]
        title = f"Spending Trend for {category}"
    else:
        # Use all data
        category_data = data
        title = "Overall Spending Trend"
    
    # Group by month and sum amounts
    monthly_data = category_data.groupby(pd.Grouper(key='date', freq='M'))['amount_abs'].sum()
    
    # Plot the data
    plt.plot(monthly_data.index, monthly_data.values, marker='o', linestyle='-')
    plt.title(title)
    plt.xlabel('Month')
    plt.ylabel('Amount')
    plt.grid(True, alpha=0.3)
    plt.tight_layout()
    
    # Convert plot to base64 string
    buffer = io.BytesIO()
    plt.savefig(buffer, format='png')
    buffer.seek(0)
    image_png = buffer.getvalue()
    buffer.close()
    
    graphic = base64.b64encode(image_png).decode('utf-8')
    return graphic