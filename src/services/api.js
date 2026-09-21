/* src/services/api.js
 * Fetch-based API client — replaces axios to save ~150 KB from the initial bundle.
 */

const API_BASE =
  import.meta.env?.VITE_API_URL ||
  process.env.REACT_APP_API_URL ||
  'http://localhost:8000';

const DEFAULT_TIMEOUT = 60000;

async function request(method, path, { params, body, headers = {}, timeout = DEFAULT_TIMEOUT } = {}) {
  // Build URL with query params
  const url = new URL(path.startsWith('http') ? path : `${API_BASE}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v != null && v !== '') url.searchParams.append(k, String(v));
    });
  }

  // Auth header
  const token = localStorage.getItem('token');
  const finalHeaders = { 'Content-Type': 'application/json', ...headers };
  if (token) finalHeaders.Authorization = `Bearer ${token}`;

  // Timeout via AbortController
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(url.toString(), {
      method,
      headers: finalHeaders,
      body: body != null ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timer);

    // Parse response (JSON preferred, text fallback)
    const text = await res.text();
    let data = null;
    if (text) {
      try { data = JSON.parse(text); } catch { data = text; }
    }

    if (!res.ok) {
      if (res.status === 401) {
        localStorage.removeItem('token');
        window.dispatchEvent(new CustomEvent('auth:logout'));
      }
      const err = new Error(data?.error || res.statusText || 'Request failed');
      err.response = { status: res.status, data };
      throw err;
    }

    return { data };
  } catch (err) {
    clearTimeout(timer);
    if (err.name === 'AbortError') {
      const e = new Error('Request timeout');
      e.request = {};
      throw e;
    }
    if (!err.response) err.request = {};
    throw err;
  }
}

const api = {
  get: (path, opts) => request('GET', path, opts),
  post: (path, body, opts) => request('POST', path, { ...opts, body }),
  put: (path, body, opts) => request('PUT', path, { ...opts, body }),
  delete: (path, opts) => request('DELETE', path, opts),
};

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
const sessionCache = { search: {}, stocks: {}, calculations: {} };

export const searchStocks = async (q, market = 'us') => {
  const key = `${market}:${q.toLowerCase().trim()}`;
  if (sessionCache.search[key]) return sessionCache.search[key];
  const res = await api.get('/api/stocks/search', { params: { q, market } });
  sessionCache.search[key] = res.data;
  return res.data;
};

export const getStock = async (symbol, market = 'us') => {
  const key = `${market}:${symbol.toUpperCase().trim()}`;
  if (sessionCache.stocks[key]) return sessionCache.stocks[key];
  const res = await api.get(`/api/stocks/${encodeURIComponent(symbol)}`, { params: { market } });
  sessionCache.stocks[key] = res.data;
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

export const getScreenerStocks = async (params = {}) => {
  const res = await api.get('/api/stocks/screener', { params });
  return res.data;
};

// ✅ NEW: Upcoming ex-dividend calendar
export const getUpcomingDividends = async (market = 'us', days = 60) => {
  const res = await api.get('/api/stocks/upcoming-dividends', { params: { market, days } });
  return res.data;
};

// ---------- Portfolio ----------
export const calculatePortfolio = async (symbol, purchaseDate, quantity, market = 'us') => {
  const key = `${market}:${symbol}:${purchaseDate}:${quantity}`;
  if (sessionCache.calculations[key]) return sessionCache.calculations[key];
  const res = await api.get('/api/portfolio/calculate', {
    params: { ticker: symbol, purchaseDate, quantity, market },
  });
  sessionCache.calculations[key] = res.data;
  return res.data;
};

// ---------- Simulators ----------
export const simulateDCA = async (symbol, amount, startDate, market = 'us') => {
  const res = await api.get('/api/simulate/dca', {
    params: { ticker: symbol, amount, startDate, market },
  });
  return res.data;
};

export const getLongTermGrowth = async (symbol, market, amount = 1000) => {
  const res = await api.get('/api/stocks/long-term-growth', {
    params: { symbol, market, amount },
  });
  return res.data;
};

// ---------- AI Chat ----------
export const sendChatMessage = async (messages, context = null) => {
  const res = await api.post('/api/chat', { messages, context });
  return res.data;
};

// ---------- Analytics Events ----------
export const logEvent = async (events) => {
  try {
    const res = await api.post('/api/events', { events });
    return res.data;
  } catch (e) {
    return null;
  }
};

// ---------- Admin ----------
export const getAnalyticsDashboard = async () => {
  const res = await api.get('/api/analytics/dashboard');
  return res.data;
};

export const getAdminUsers = async ({ limit = 100, offset = 0, search = '' } = {}) => {
  const res = await api.get('/api/analytics/users', { params: { limit, offset, search } });
  return res.data;
};

// ---------- Income Planner ----------
export const getRiskProfiles = async () => {
  const res = await api.get('/api/income-planner/profiles');
  return res.data;
};

export const generateIncomeAllocation = async ({ targetMonthly, capital, location, riskProfile }) => {
  const res = await api.post('/api/income-planner/generate', {
    targetMonthly, capital, location, riskProfile,
  });
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