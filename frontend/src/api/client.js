import axios from 'axios';

const client = axios.create({
  baseURL: '/api', // uses Vite proxy in dev
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

client.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

export const fetchPrediction = async (ticker, days = 7) => {
  const res = await client.get('/predict', { params: { ticker, days } });
  return res.data;
};

export const fetchSentiment = async (ticker, limit = 10, days_back = 7) => {
  const res = await client.get('/sentiment', { params: { ticker, limit, days_back } });
  return res.data;
};

export const fetchRisk = async (ticker, days = 30) => {
  const res = await client.get('/risk', { params: { ticker, days } });
  return res.data;
};

export default client;