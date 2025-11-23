# FinSight AI 📈🤖

> **AI-Powered Financial Advisor & Risk Predictor**
>
> *Software Engineering Course Project*

**FinSight AI** is a full-stack web application that provides real-time stock analysis, future price predictions, and sentiment-based risk assessment. By leveraging machine learning models (Prophet) and Natural Language Processing (FinBERT), it offers users actionable insights into the stock market.

---

## 🚀 Features

* **Stock Price Prediction**: Forecasts future stock prices for upqp to 30 days using the **Prophet** time-series forecasting model.
* **Sentiment Analysis**: Analyzes recent financial news headlines using **FinBERT** (a finance-specific BERT model) to determine market sentiment (Positive, Neutral, Negative).
* **Risk Assessment**: Calculates risk levels based on historical volatility, short-term trends, and news sentiment to provide investment recommendations (Buy, Hold, Sell).
* **Interactive Dashboard**:
    * Dynamic charts visualizing historical and predicted data.
    * Search functionality for any valid stock ticker.
    * Dark/Light mode support.
    * Historical data tables.

---

## 🛠️ Tech Stack

### **Backend** (Python & Flask)
* **Framework**: Flask (REST API)
* **ML & Data**:
    * `Facebook Prophet`: Time-series forecasting.
    * `Transformers (Hugging Face)` & `Torch`: FinBERT for sentiment analysis.
    * `Pandas` & `Pmpy`: Data manipulation.
* **Data Sources**:
    * `yfinance`: Historical stock data.
    * `NewsAPI`: Real-time financial news.

### **Frontend** (React & Vite)
* **Framework**: React 19 (Vite)
* **Styling**: Tailwind CSS v4
* **State Management**: TanStack Query (React Query)
* **Visualization**: Chart.js (react-chartjs-2)
* **UI Components**: Framer Motion (animations), React Icons.

---

## ⚙️ Installation & Setup

### Prerequisites
* **Node.js** (v18+ recommended)
* **Python** (v3.9+ recommended)
* A free API key from [NewsAPI](httpswk://newsapi.org/)

### 1. Backend Setup

Navigate to the backend directory:
```bash
cd backend
````

Create and activate a virtual environment:

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

**Configuration**:
Create a `.env` file in the `backend/` directory and add your NewsAPI key:

```env
NEWS_API_KEY=your_news_api_key_here
```

Start the Flask server:

```bash
python app.py
```

*The backend will run on `http://localhost:5000`*

### 2\. Frontend Setup

Open a new terminal and navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

*The frontend will run on `http://localhost:3000`*

-----

## 📖 Usage

1.  Ensure both the Backend (port 5000) and Frontend (port 3000) are running.
2.  Open your browser to `http://localhost:3000`.
3.  **Search**: Enter a stock ticker (e.g., `AAPL`, `TSLA`, `NVDA`) in the search bar.
4.  **Analyze**:
      * **Price & Risk Tab**: View the price chart (historical + prediction) and risk report.
      * **Sentiment Tab**: Read recent news articles and their AI-classified sentiment.
      * **History Tab**: View raw historical price data.

-----

## 📡 API Reference

The backend exposes the following REST endpoints:

### Health Check

  * `GET /api/health`
      * Checks if the API is running.

### Prediction

  * `GET /api/predict?ticker={TF}&days={7}`
      * Returns historical data and predicted prices for the next `N` days.

### Sentiment

  * `GET /api/sentiment?ticker={TF}&limit={10}&days_back={7}`
      * Fetches news and returns per-article and overall sentiment scores.

### Risk

  * `GET /api/risk?ticker={TF}&days={30}`
      * Returns volatility metrics, risk level (Low/Med/High), and a "Buy/Hold/Sell" recommendation.

-----

## 📂 Project Structure

```text
se-project/
├── backend/
│   ├── models/           # ML Logic (predictor.py, sentiment.py, risk.py)
│   ├── utils/            # Data fetchers (news_fetcher.py, data_fetcher.py)
│   ├── app.py            # Flask Entry point
│   └── requirements.txt  # Python dependencies
│
└── frontend/
    ├── src/
    │   ├── api/          # Axios client
    │   ├── components/   # React components (Charts, Cards, Tables)
    │   ├── pages/        # Main Dashboard view
    │   └── App.jsx       # Root component
    ├── package.json      # Node dependencies
    └── vite.config.js    # Vite configuration
```

-----

## 🤝 Contributors

  * **Aaryan Rao**
  * **Anoop Ganesh**
  * **Chinmai S Naik**
  * **Kushagra Singhal**

-----

