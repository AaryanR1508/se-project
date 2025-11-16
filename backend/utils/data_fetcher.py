import yfinance as yf
import pandas as pd
from datetime import datetime, timedelta

def fetch_stock_data(ticker, days=90):
    """
    Fetch historical stock data from Yahoo Finance
    
    Args:
        ticker (str): Stock ticker symbol (e.g., 'AAPL')
        days (int): Number of days of historical data
    
    Returns:
        pd.DataFrame: Historical stock data with Date and Close columns
    """
    try:
        stock = yf.Ticker(ticker)
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        
        df = stock.history(start=start_date, end=end_date)
        
        if df.empty:
            return None
        
        # Keep only Close price and reset index
        df = df[['Close']].reset_index()
        
        # CRITICAL FIX: Remove timezone from Date column
        df['Date'] = df['Date'].dt.tz_localize(None)
        
        # Rename for Prophet (ds = datestamp, y = value)
        df = df.rename(columns={'Date': 'ds', 'Close': 'y'})
        
        # Remove any NaN values
        df = df.dropna()
        
        return df
        
    except Exception as e:
        print(f"Error fetching data for {ticker}: {e}")
        return None

def get_current_price(ticker):
    """
    Get current stock price
    
    Args:
        ticker (str): Stock ticker symbol
    
    Returns:
        float: Current stock price or None if error
    """
    try:
        stock = yf.Ticker(ticker)
        data = stock.history(period='1d')
        
        if data.empty:
            return None
            
        return round(data['Close'].iloc[-1], 2)
        
    except Exception as e:
        print(f"Error getting current price for {ticker}: {e}")
        return None

def get_historical_for_chart(ticker, days=30):
    """
    Get historical data formatted for frontend charts
    
    Args:
        ticker (str): Stock ticker symbol
        days (int): Number of days to fetch
    
    Returns:
        dict: {'dates': [...], 'prices': [...]}
    """
    try:
        stock = yf.Ticker(ticker)
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        
        df = stock.history(start=start_date, end=end_date)
        
        if df.empty:
            return None
        
        # CRITICAL FIX: Remove timezone before formatting
        df.index = df.index.tz_localize(None)
        
        dates = df.index.strftime('%Y-%m-%d').tolist()
        prices = df['Close'].round(2).tolist()
        
        return {'dates': dates, 'prices': prices}
        
    except Exception as e:
        print(f"Error getting chart data for {ticker}: {e}")
        return None