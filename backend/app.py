from flask import Flask, jsonify, request
from flask_cors import CORS
import logging
import warnings

from utils.data_fetcher import (
    fetch_stock_data, 
    get_current_price, 
    get_historical_for_chart
)
from utils.news_fetcher import get_news_for_ticker, NewsAPIError
from models.predictor import predict_stock_price
from models.sentiment import analyze_headlines
from models.risk import assemble_risk_report

# Suppress Prophet warnings
warnings.simplefilter(action='ignore', category=FutureWarning)
logging.getLogger('prophet').setLevel(logging.ERROR)
logging.getLogger('cmdstanpy').setLevel(logging.ERROR)

# Configure app logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)


def validate_ticker(ticker: str) -> tuple[bool, str]:
    """
    Validate ticker symbol
    
    Args:
        ticker: Stock ticker symbol
        
    Returns:
        tuple: (is_valid, error_message)
    """
    if not ticker:
        return False, 'Ticker symbol required'
    if not ticker.isalpha():
        return False, 'Ticker symbol must contain only letters'
    if len(ticker) > 10:
        return False, 'Ticker symbol too long'
    return True, ''


@app.route('/api/predict', methods=['GET'])
def predict():
    """
    Predict stock prices for the next N days
    
    Query params:
        ticker (str): Stock symbol (e.g., AAPL, TSLA, GOOGL)
        days (int): Number of days to predict (default: 7)
    
    Returns:
        JSON with current price, predictions, and historical data
    """
    try:
        ticker = request.args.get('ticker', '').upper().strip()
        days = int(request.args.get('days', 7))
        
        # Validate ticker
        is_valid, error_msg = validate_ticker(ticker)
        if not is_valid:
            return jsonify({'error': error_msg}), 400
        
        # Validate days parameter
        if days < 1 or days > 30:
            return jsonify({'error': 'Days must be between 1 and 30'}), 400
        
        # Fetch historical data
        historical_data = fetch_stock_data(ticker, days=90)
        if historical_data is None or historical_data.empty:
            return jsonify({'error': f'Invalid ticker or no data available: {ticker}'}), 404
        
        # Get current price
        current_price = get_current_price(ticker)
        if current_price is None:
            return jsonify({'error': 'Could not fetch current price'}), 500
        
        # Generate predictions
        predictions = predict_stock_price(historical_data, days=days)
        if predictions is None:
            return jsonify({'error': 'Prediction failed'}), 500
        
        # Get historical chart data
        chart_data = get_historical_for_chart(ticker, days=30)
        if chart_data is None:
            return jsonify({'error': 'Could not fetch historical chart data'}), 500
        
        return jsonify({
            'ticker': ticker,
            'current_price': current_price,
            'predictions': predictions['predictions'],
            'prediction_dates': predictions['dates'],
            'historical_dates': chart_data['dates'],
            'historical_prices': chart_data['prices']
        })
        
    except ValueError as e:
        return jsonify({'error': f'Invalid parameter: {str(e)}'}), 400
    except Exception as e:
        logger.exception(f'Error in /api/predict: {e}')
        return jsonify({'error': 'Internal server error'}), 500


@app.route('/api/sentiment', methods=['GET'])
def sentiment():
    """
    Analyze sentiment of financial news for a stock
    
    Query params:
        ticker (str): Stock symbol (e.g., AAPL, TSLA, GOOGL)
        limit (int): Maximum number of articles to analyze (default: 10)
        days_back (int): Number of days to look back for news (default: 7)
    
    Returns:
        JSON with per-article sentiment and overall sentiment analysis
    """
    try:
        ticker = request.args.get('ticker', '').upper().strip()
        limit = int(request.args.get('limit', 10))
        days_back = int(request.args.get('days_back', 7))
        
        # Validate ticker
        is_valid, error_msg = validate_ticker(ticker)
        if not is_valid:
            return jsonify({'error': error_msg}), 400
        
        # Validate limit
        if limit < 1 or limit > 50:
            return jsonify({'error': 'Limit must be between 1 and 50'}), 400
        
        # Validate days_back
        if days_back < 1 or days_back > 30:
            return jsonify({'error': 'Days back must be between 1 and 30'}), 400
        
        # Fetch news articles
        try:
            articles = get_news_for_ticker(
                ticker=ticker,
                limit=limit,
                days_back=days_back
            )
        except NewsAPIError as e:
            logger.error(f'NewsAPI error for {ticker}: {e}')
            return jsonify({
                'error': 'Failed to fetch news articles',
                'details': str(e)
            }), 500
        
        if not articles:
            return jsonify({
                'ticker': ticker,
                'per_article': [],
                'overall': {
                    'label': None,
                    'score': None
                },
                'message': 'No news articles found for this ticker'
            })
        
        # Analyze sentiment
        try:
            sentiment_result = analyze_headlines(articles, batch_size=16)
        except Exception as e:
            logger.exception(f'Sentiment analysis error for {ticker}: {e}')
            return jsonify({
                'error': 'Sentiment analysis failed',
                'details': str(e)
            }), 500
        
        return jsonify({
            'ticker': ticker,
            'per_article': sentiment_result['per_article'],
            'overall': sentiment_result['overall']
        })
        
    except ValueError as e:
        return jsonify({'error': f'Invalid parameter: {str(e)}'}), 400
    except Exception as e:
        logger.exception(f'Error in /api/sentiment: {e}')
        return jsonify({'error': 'Internal server error'}), 500


@app.route('/api/risk', methods=['GET'])
def risk():
    """
    Assess risk level and provide investment recommendation
    
    Query params:
        ticker (str): Stock symbol (e.g., AAPL, TSLA, GOOGL)
        days (int): Number of days of historical data to analyze (default: 30)
    
    Returns:
        JSON with volatility, risk level, short-term trend, and recommendation
    """
    try:
        ticker = request.args.get('ticker', '').upper().strip()
        days = int(request.args.get('days', 30))
        
        # Validate ticker
        is_valid, error_msg = validate_ticker(ticker)
        if not is_valid:
            return jsonify({'error': error_msg}), 400
        
        # Validate days
        if days < 7 or days > 365:
            return jsonify({'error': 'Days must be between 7 and 365'}), 400
        
        # Fetch historical price data
        chart_data = get_historical_for_chart(ticker, days=days)
        if chart_data is None or not chart_data.get('prices'):
            return jsonify({'error': f'Invalid ticker or insufficient data: {ticker}'}), 404
        
        historical_prices = chart_data['prices']
        
        # Get sentiment score for risk assessment
        overall_sentiment_score = None
        try:
            articles = get_news_for_ticker(ticker=ticker, limit=10, days_back=7)
            if articles:
                sentiment_result = analyze_headlines(articles, batch_size=16)
                overall_sentiment_score = sentiment_result['overall'].get('score')
        except Exception as e:
            logger.warning(f'Could not fetch sentiment for risk assessment: {e}')
            # Continue without sentiment - risk module handles None
        
        # Generate risk report
        risk_report = assemble_risk_report(historical_prices, overall_sentiment_score)
        
        # Add current price for context
        current_price = get_current_price(ticker)
        
        return jsonify({
            'ticker': ticker,
            'current_price': current_price,
            'volatility': risk_report['volatility'],
            'risk_level': risk_report['risk_level'],
            'short_term_trend': risk_report['short_term_trend'],
            'recommendation': risk_report['recommendation'],
            'sentiment_score_used': overall_sentiment_score
        })
        
    except ValueError as e:
        return jsonify({'error': f'Invalid parameter: {str(e)}'}), 400
    except Exception as e:
        logger.exception(f'Error in /api/risk: {e}')
        return jsonify({'error': 'Internal server error'}), 500


@app.route('/api/health', methods=['GET'])
def health():
    """
    Health check endpoint
    
    Returns:
        JSON with API status
    """
    return jsonify({
        'status': 'ok',
        'endpoints': {
            'predict': '/api/predict',
            'sentiment': '/api/sentiment',
            'risk': '/api/risk'
        }
    })


if __name__ == '__main__':
    app.run(debug=True, port=5000)
