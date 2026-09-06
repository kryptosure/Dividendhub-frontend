import axios from 'axios';

const api = axios.create({
  baseURL: 'https://onrender.com',
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000,
});

// Cache map to save server bandwidth and give users instant 0ms response times
const sessionCache = {
  search: {},
  stocks: {},
  calculations: {}
};

// Interceptors (unchanged)
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

// Auth
export const signup = async (email, password, country = '') => {
  const res = await api.post('/auth/signup', { email, password, country });
  return res.data;
};

export const login = async (email, password) => {
  const res = await api.post('/auth/login', { email, password });
  return res.data;
};

export const getMe = async () => {
  const res = await api.get('/auth/me');
  return res.data;
};

export const updatePortfolio = async (portfolio) => {
  const res = await api.put('/auth/portfolio', { portfolio });
  return res.data;
};

// Stocks (Optimized with live dynamic session caching for premium snappiness)
export const searchStocks = async (q, market = 'us') => {
  const cacheKey = `${market}:${q.toLowerCase().trim()}`;
  if (sessionCache.search[cacheKey]) {
    return sessionCache.search[cacheKey];
  }
  
  const res = await api.get('/stocks/search', { params: { q, market } });
  sessionCache.search[cacheKey] = res.data;
  return res.data;
};

export const getStock = async (symbol, market = 'us') => {
  const cacheKey = `${market}:${symbol.toUpperCase().trim()}`;
  if (sessionCache.stocks[cacheKey]) {
    return sessionCache.stocks[cacheKey];
  }

  const res = await api.get(`/stocks/${encodeURIComponent(symbol)}`, { params: { market } });
  sessionCache.stocks[cacheKey] = res.data;
  return res.data;
};

export const getBatchStocks = async (symbols, market = 'us') => {
  const res = await api.post('/stocks/batch', { symbols, market });
  return res.data;
};

export const getTopStocks = async (market = 'us', type = 'stock') => {
  const res = await api.get(`/stocks/top/${market}`, { params: { type } });
  return res.data;
};

// Fallback legacy link support
export const getStockList = async () => {
  const res = await api.get('/stocks-list');
  return res.data;
};

// Portfolio Calculator (Cached to handle instant adjustments safely)
export const calculatePortfolio = async (symbol, purchaseDate, quantity, market = 'us') => {
  const cacheKey = `${market}:${symbol}:${purchaseDate}:${quantity}`;
  if (sessionCache.calculations[cacheKey]) {
    return sessionCache.calculations[cacheKey];
  }

  const res = await api.get('/portfolio/calculate', {
    params: { ticker: symbol, purchaseDate, quantity, market },
  });
  sessionCache.calculations[cacheKey] = res.data;
  return res.data;
};

// DCA Simulator
export const simulateDCA = async (symbol, amount, startDate, market = 'us') => {
  const res = await api.get('/simulate/dca', {
    params: { ticker: symbol, amount, startDate, market }
  });
  return res.data;
};

// Health
export const healthCheck = async () => {
  const res = await api.get('/health');
  return res.data;
};

export const handleApiError = (error) => {
  if (error.response) {
    const message = error.response.data?.error || error.response.statusText || 'Server error';
    return { message, status: error.response.status };
  } else if (error.request) {
    return { message: 'Network error - please check your connection', status: 0 };
  } else {
    return { message: error.message || 'Unknown error', status: -1 };
  }
};

export default api;
