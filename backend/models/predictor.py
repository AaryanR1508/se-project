from prophet import Prophet
import pandas as pd
from datetime import datetime, timedelta

def predict_stock_price(df, days=7):
    """
    Predict future stock prices using Prophet
    
    Args:
        df (pd.DataFrame): Historical data with 'ds' and 'y' columns
        days (int): Number of days to predict
    
    Returns:
        dict: {'dates': [...], 'predictions': [...]}
    """
    try:
        # Initialize and train Prophet model
        model = Prophet(
            daily_seasonality=True,
            yearly_seasonality=False,
            weekly_seasonality=True
        )
        model.fit(df)
        
        # Create future dataframe
        future = model.make_future_dataframe(periods=days)
        forecast = model.predict(future)
        
        # Get only future predictions
        predictions = forecast[['ds', 'yhat']].tail(days)
        
        dates = predictions['ds'].dt.strftime('%Y-%m-%d').tolist()
        prices = predictions['yhat'].round(2).tolist()
        
        return {'dates': dates, 'predictions': prices}
        
    except Exception as e:
        print(f"Error in prediction: {e}")
        return None