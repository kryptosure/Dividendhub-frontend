import axios from 'axios';

// Use environment variable – works for both CRA and Vite
const API_BASE =
  import.meta.env?.VITE_API_URL ||
  process.env.REACT_APP_API_URL ||
  'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000,
});

const sessionCache = { search: {}, stocks: {}, calculations: {} };

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.dispatchEvent(new CustomEvent('auth:logout'));
    }
    return Promise.reject(error);
  }
);

// ---------- Auth ----------
export const signup = async (email, password, country = '') => {
  const res = await api.post('/api/auth/signup', { email, password, country });
  return res.data;
};

export const login = async (email, password) => {
  const res = await api.post('/api/auth/login', { email, password });
  return res.data;
};

export const getMe = async () => {
  const res = await api.get('/api/auth/me');
  return res.data;
};

export const updatePortfolio = async (portfolio) => {
  const res = await api.put('/api/auth/portfolio', { portfolio });
  return res.data;
};

export const updateWatchlist = async (watchlist) => {
  const res = await api.put('/api/auth/watchlist', { watchlist });
  return res.data;
};

// ---------- Stocks ----------
export const searchStocks = async (q, market = 'us') => {
  const cacheKey = `${market}:${q.toLowerCase().trim()}`;
  if (sessionCache.search[cacheKey]) return sessionCache.search[cacheKey];
  const res = await api.get('/api/stocks/search', { params: { q, market } });
  sessionCache.search[cacheKey] = res.data;
  return res.data;
};

export const getStock = async (symbol, market = 'us') => {
  const cacheKey = `${market}:${symbol.toUpperCase().trim()}`;
  if (sessionCache.stocks[cacheKey]) return sessionCache.stocks[cacheKey];
  const res = await api.get(`/api/stocks/${encodeURIComponent(symbol)}`, { params: { market } });
  sessionCache.stocks[cacheKey] = res.data;
  return res.data;
};

export const getBatchStocks = async (symbols, market = 'us') => {
  const res = await api.post('/api/stocks/batch', { symbols, market });
  return res.data;
};

export const getTopStocks = async (market = 'us', type = 'stock') => {
  const res = await api.get(`/api/stocks/top/${market}`, { params: { type } });
  return res.data;
};

export const getStockList = async () => {
  const res = await api.get('/api/stocks-list');
  return res.data;
};

// ---------- Portfolio ----------
export const calculatePortfolio = async (symbol, purchaseDate, quantity, market = 'us') => {
  const cacheKey = `${market}:${symbol}:${purchaseDate}:${quantity}`;
  if (sessionCache.calculations[cacheKey]) return sessionCache.calculations[cacheKey];
  const res = await api.get('/api/portfolio/calculate', {
    params: { ticker: symbol, purchaseDate, quantity, market },
  });
  sessionCache.calculations[cacheKey] = res.data;
  return res.data;
};

// ---------- DCA Simulator ----------
export const simulateDCA = async (symbol, amount, startDate, market = 'us') => {
  const res = await api.get('/api/simulate/dca', {
    params: { ticker: symbol, amount, startDate, market }
  });
  return res.data;
};

export const getLongTermGrowth = async (symbol, market, amount = 1000) => {
  const res = await api.get('/api/stocks/long-term-growth', {
    params: { symbol, market, amount }
  });
  return res.data;
};

// ---------- AI Chat ----------
export const sendChatMessage = async (messages, context = null) => {
  const res = await api.post('/api/chat', { messages, context });
  return res.data;
};

// ---------- Health ----------
export const healthCheck = async () => {
  const res = await api.get('/api/health');
  return res.data;
};

export const handleApiError = (error) => {
  if (error.response) {
    return { message: error.response.data?.error || error.response.statusText || 'Server error', status: error.response.status };
  } else if (error.request) {
    return { message: 'Network error - please check your connection', status: 0 };
  } else {
    return { message: error.message || 'Unknown error', status: -1 };
  }
};

export default api;