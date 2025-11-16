# Frontend Integration Guide

## 1. Run Backend (Test First!)

cd backend
pip install -r requirements.txt
python app.py

text

Backend: [**http://localhost:5000**](http://localhost:5000)

---

## 2. Test in Postman

**Health Check:**
GET http://localhost:5000/api/health

text

**Prediction:**
GET http://localhost:5000/api/predict?ticker=AAPL&days=7

text

**Sentiment:**
GET http://localhost:5000/api/sentiment?ticker=AAPL

text

**Risk:**
GET http://localhost:5000/api/risk?ticker=AAPL

text

---

## 3. Frontend Setup

cd frontend
npm install axios
npm run dev

text

**vite.config.js:**
export default defineConfig({
plugins: [react()],
server: {
port: 3000,
proxy: { '/api': { target: 'http://127.0.0.1:5000' } }
}
})

text

---

## 4. API Client

**src/api/client.js:**
import axios from 'axios';

export const fetchPrediction = async (ticker) => {
const res = await axios.get('/api/predict', { params: { ticker } });
return res.data;
};

export const fetchSentiment = async (ticker) => {
const res = await axios.get('/api/sentiment', { params: { ticker } });
return res.data;
};

export const fetchRisk = async (ticker) => {
const res = await axios.get('/api/risk', { params: { ticker } });
return res.data;
};

text

---

## Done! 

Test tickers: **AAPL, TSLA, GOOGL, MSFT**