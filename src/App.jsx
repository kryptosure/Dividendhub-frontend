import React, { lazy, Suspense, useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import useStore from './store/useStore';
import { trackPageView } from './services/tracker';

// ---------- Eager: loaded on every page ----------
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import Footer from './components/Footer';
import AppErrorBoundary from './components/AppErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';

// ---------- Lazy: only loaded when the route is visited ----------

// Pages (in ./pages)
const TargetIncome = lazy(() => import('./pages/TargetIncome'));
const SearchStocks = lazy(() => import('./pages/SearchStocks'));
const DividendScreener = lazy(() => import('./pages/DividendScreener'));
const WeeklyDividendETFs = lazy(() => import('./pages/WeeklyDividendETFs'));
const MonthlyDividendStocks = lazy(() => import('./pages/MonthlyDividendStocks'));
const DailyDividendStocks = lazy(() => import('./pages/DailyDividendStocks'));
const ReitsThatPayMonthly = lazy(() => import('./pages/ReitsThatPayMonthly'));
const Watchlist = lazy(() => import('./pages/Watchlist'));
const StockComparison = lazy(() => import('./pages/StockComparison'));
const Blog = lazy(() => import('./pages/Blog'));
const Article = lazy(() => import('./pages/Article'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const SimulatorSingle = lazy(() => import('./pages/SimulatorSingle'));
const SimulatorDCA = lazy(() => import('./pages/SimulatorDCA'));
const MillionaireSimulator = lazy(() => import('./pages/MillionaireSimulator'));
const Admin = lazy(() => import('./pages/Admin'));
const DividendCalendar = lazy(() => import('./pages/DividendCalendar'));

// Components that are treated as full-page routes (in ./components)
const PortfolioView = lazy(() => import('./components/PortfolioView'));
const TopStocks = lazy(() => import('./components/TopStocks'));

// Deferred (loaded 3s after mount)
const ChatWidget = lazy(() => import('./components/ChatWidget'));
const BackToTop = lazy(() => import('./components/BackToTop'));

import { getMe } from './services/api';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

const SITE_URL = "https://dividendbro.com";
const DEFAULT_IMAGE = `${SITE_URL}/images/cover.png`;

function RouteTracker() {
  const location = useLocation();
  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location.pathname, location.search]);
  return null;
}

// ✅ CLS FIX: reserve vertical space so the footer doesn't jump when
// the real route content mounts.
const PageLoader = () => (
  <div className="py-20" style={{ minHeight: '60vh' }}>
    <LoadingSpinner />
  </div>
);

// Defer the chat widget so it doesn't compete with LCP
function DeferredChatWidget() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShow(true), 3000);
    return () => clearTimeout(t);
  }, []);
  if (!show) return null;
  return <ChatWidget />;
}

function App() {
  const { theme, token, setUser, setToken, setPortfolio, setWatchlist, logout } = useStore();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken);
        try {
          const userData = await getMe();
          setUser({ email: userData.email, isAdmin: userData.isAdmin });
          setPortfolio(userData.portfolio || []);
          setWatchlist(userData.watchlist || []);
        } catch (e) {
          logout();
        }
      }
    };
    initAuth();
  }, [setToken, setUser, setPortfolio, setWatchlist, logout]);

  return (
    <AppErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <RouteTracker />
          <Helmet>
            <meta property="og:type" content="website" />
            <meta property="og:site_name" content="DividendBro" />
            <meta property="og:url" content={SITE_URL} />
            <meta property="og:image" content={DEFAULT_IMAGE} />
            <meta name="twitter:card" content="summary_large_image" />
            <meta property="og:title" content="DividendBro – Monthly Dividend Income Planner" />
            <meta property="og:description" content="See what a sample dividend portfolio could look like for your monthly income goal. Free for US & SGX stocks." />
          </Helmet>

          <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col font-sans antialiased selection:bg-accent-blue/20">
            <Header />
            {/* ✅ CLS FIX: removed `animate-in fade-in` — during the fade
                transition, some browsers measure layout mid-animation,
                which compounds CLS from the route swap. */}
            <main className="flex-1 max-w-6xl mx-auto px-2 sm:px-4 py-8 w-full pb-24 md:pb-8">
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<TargetIncome />} />
                  <Route path="/search" element={<SearchStocks />} />
                  <Route path="/screener" element={<DividendScreener />} />
                  <Route path="/calendar" element={<DividendCalendar />} />
                  <Route path="/weekly-dividend-etfs" element={<WeeklyDividendETFs />} />
                  <Route path="/monthly-dividend-stocks" element={<MonthlyDividendStocks />} />
                  <Route path="/daily-dividend-stocks" element={<DailyDividendStocks />} />
                  <Route path="/reits-that-pay-monthly" element={<ReitsThatPayMonthly />} />
                  <Route path="/income-planner" element={<Navigate to="/" replace />} />

                  <Route path="/portfolio" element={<PortfolioView />} />
                  <Route path="/watchlist" element={<Watchlist />} />
                  <Route path="/compare" element={<StockComparison />} />
                  <Route path="/top" element={<TopStocks />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/blog/:slug" element={<Article />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/simulate/one-time" element={<SimulatorSingle />} />
                  <Route path="/simulate/dca" element={<SimulatorDCA />} />
                  <Route path="/millionaire" element={<MillionaireSimulator />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </main>
            <Footer />
            <BottomNav />
            <Suspense fallback={null}>
              <BackToTop />
              <DeferredChatWidget />
            </Suspense>
          </div>
        </BrowserRouter>
      </QueryClientProvider>
    </AppErrorBoundary>
  );
}

export default App;