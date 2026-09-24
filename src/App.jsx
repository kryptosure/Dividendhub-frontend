import React, { lazy, Suspense, useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import useStore from './store/useStore';
import { trackPageView } from './services/tracker';

// ---------- Eager ----------
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import Footer from './components/Footer';
import AppErrorBoundary from './components/AppErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';

// ---------- Lazy: pages ----------
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

// ---------- Lazy: components-as-routes ----------
const PortfolioView = lazy(() => import('./components/PortfolioView'));
const TopStocks = lazy(() => import('./components/TopStocks'));

// ---------- Deferred ----------
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

const PageLoader = () => (
  <div className="py-20" style={{ minHeight: '60vh' }}>
    <LoadingSpinner />
  </div>
);

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

          {/* ============================================================
              Layout: row on lg+ (sidebar + content column),
              column on < lg (header stack + main + footer).
              ============================================================ */}
          <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col lg:flex-row font-sans antialiased selection:bg-accent-blue/20">

            {/* Sidebar — hidden below lg. Sticky full-height on lg+. */}
            <Sidebar />

            {/* Content column — flex-1 so it fills remaining width.
                min-w-0 is required so children (tables) can shrink. */}
            <div className="flex-1 flex flex-col min-w-0">
              <Header />

              <main className="flex-1 max-w-7xl mx-auto px-2 sm:px-4 py-8 w-full pb-24 md:pb-8">
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
            </div>

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