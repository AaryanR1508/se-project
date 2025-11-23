================================================================================
AI-POWERED FINANCIAL ADVISOR & RISK PREDICTOR
================================================================================

## 1. OVERVIEW

This project is a comprehensive full-stack application designed to
provide data-driven insights for stock investment decisions. It combines
a robust Python backend for quantitative analysis with a modern React
frontend for dynamic data visualization.

The application processes real-time and historical stock data to deliver
three core services: 1. Price Forecasting: Predicting future stock
prices using a time-series model. 2. Sentiment Analysis: Gauging market
sentiment from recent financial news. 3. Risk Assessment: Calculating
volatility and generating an investment recommendation.

## 2. KEY FEATURES

-   Stock Price Prediction: Leverages the Prophet model to forecast
    stock closing prices for periods up to 30 days.

-   Financial News Sentiment: Utilizes a finance-tuned BERT model
    ("ProsusAI/finbert") to analyze news headlines and descriptions,
    providing both per-article and aggregate market sentiment scores.

-   Risk Reporting and Recommendation: Calculates price volatility and
    short-term trend, classifying the stock risk as "Low", "Medium", or
    "High", and issuing an actionable "Buy", "Hold", or "Sell"
    recommendation.

-   Dynamic UI: The frontend uses React Query for efficient data
    fetching, caching, and state management, ensuring a responsive user
    experience.

## 3. TECHNOLOGY STACK

BACKEND: \* Technology: Python (Flask) \* Role: REST API, Data
Processing, ML Model Execution \* Key Libraries: Flask, prophet,
yfinance, transformers, torch

FRONTEND: \* Technology: React (Vite) \* Role: Interactive Dashboard,
Visualization \* Key Libraries: React Query, Chart.js, Tailwind CSS,
framer-motion

## 4. INSTALLATION AND SETUP

Prerequisites: \* Python (3.x) and pip \* Node.js and a package manager
(npm recommended)

Configuration: The sentiment analysis functionality requires a NewsAPI
key. Create a file named ".env" in the "backend/" directory to store
your API key:

NEWS_API_KEY="YOUR_NEWS_API_KEY_HERE"

Running the Application: The project is structured as a mono-repo. The
backend runs on port 5000, and the frontend on port 3000, with the
frontend configured to proxy API requests.

Step 1: Backend (API Server) 1. Navigate to the backend directory: cd
backend 2. Install dependencies: pip install -r requirements.txt 3.
Start the Flask API server: python app.py (Server will run at
http://127.0.0.1:5000)

Step 2: Frontend (Web Client) 1. Navigate to the frontend directory: cd
frontend 2. Install dependencies: npm install 3. Start the development
server: npm run dev (Application will be available at
http://localhost:3000)

## 5. API ENDPOINTS

The Flask application provides the following endpoints under the "/api"
prefix:

GET /api/health \* Description: API status check. \* Parameters: None

GET /api/predict \* Description: Predicts stock prices. \* Required
Param: ticker (string) \* Default Param: days (7)

GET /api/sentiment \* Description: Analyzes financial news sentiment. \*
Required Param: ticker (string) \* Default Params: limit (10), days_back
(7)

GET /api/risk \* Description: Performs risk assessment and
recommendation. \* Required Param: ticker (string) \* Default Param:
days (30)

================================================================================
