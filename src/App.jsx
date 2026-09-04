import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import useStore from './store/useStore';

import Header from './components/Header';
import BottomNav from './components/BottomNav';
import SearchBar from './components/SearchBar';
import Results from './components/Results';
import PortfolioView from './components/PortfolioView';
import TopStocks from './components/TopStocks';
import Footer from './components/Footer';
import AppErrorBoundary from './components/AppErrorBoundary';
import Login from './pages/Login';
import Signup from './pages/Signup';
import BackToTop from './components/BackToTop';
import Blog from './pages/Blog';
import Article from './pages/Article';
// New imports for simulator pages
import SimulatorSingle from './pages/SimulatorSingle';
import SimulatorDCA from './pages/SimulatorDCA';

import { getMe } from './services/api';

const queryClient = new QueryClient();

// ⚠️ CHANGE THIS TO YOUR REAL DOMAIN (no trailing slash)
const SITE_URL = "https://dividendbro.com"; 
const DEFAULT_IMAGE = `${SITE_URL}/images/cover.png`;

function App() {
  const { theme, token, setUser, setToken, setPortfolio, logout } = useStore();

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
          setUser({ email: userData.email });
          setPortfolio(userData.portfolio || []);
        } catch (e) {
          logout();
        }
      }
    };
    initAuth();
  }, []);

  return (
    <AppErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          {/* Global Meta Tags for WhatsApp / Social Media */}
          <Helmet>
            <meta property="og:type" content="website" />
            <meta property="og:site_name" content="DividendBro" />
            <meta property="og:url" content={window.location.href} />
            <meta property="og:image" content={DEFAULT_IMAGE} />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:image" content={DEFAULT_IMAGE} />
            
            {/* Fallback text if page doesn't have specific tags */}
            <meta property="og:title" content="DividendBro – Best Dividend Analysis & Management Tool" />
            <meta property="og:description" content="Analyse dividends, track yields, and manage your portfolio for US and SGX stocks." />
          </Helmet>

          <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col">
            <Header />
            <main className="flex-1 max-w-7xl mx-auto px-4 py-6 w-full pb-20 md:pb-6">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/portfolio" element={<PortfolioView />} />
                <Route path="/top" element={<TopStocks />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<Article />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                {/* New simulator routes */}
                <Route path="/simulate/one-time" element={<SimulatorSingle />} />
                <Route path="/simulate/dca" element={<SimulatorDCA />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </main>
            <Footer />
            <BottomNav />
            <BackToTop />
          </div>
        </BrowserRouter>
      </QueryClientProvider>
    </AppErrorBoundary>
  );
}

function Home() {
  const [searchParams] = useSearchParams();
  const symbol = searchParams.get('symbol') || '';

  const pageTitle = symbol
    ? `${symbol} Dividend History – Yield, Ex‑Dates & Safety`
    : 'DividendBro – Best Dividend Analysis & Management Tool for US & SGX Stocks';

  const pageDescription = symbol
    ? `View dividend history, current yield, safety score, and ex‑dates for ${symbol}. Track your portfolio and passive income.`
    : 'Analyse dividends, track yields, and manage your portfolio for US and SGX stocks. The ultimate tool for passive income investors.';

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={window.location.href} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
      </Helmet>

      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold gradient-text">
          The Best Dividend Analysis & Management Tool
        </h1>
        <p className="text-text-secondary text-base md:text-lg mt-2 max-w-2xl mx-auto">
          For US and SGX stocks. Track dividends, yields, safety, and build your passive income portfolio.
        </p>
        <div className="flex flex-wrap justify-center gap-2 mt-4">
          <span className="bg-accent-blue/10 text-accent-blue text-xs font-semibold px-3 py-1 rounded-full border border-accent-blue/20">
            🇺🇸 US Stocks
          </span>
          <span className="bg-accent-teal/10 text-accent-teal text-xs font-semibold px-3 py-1 rounded-full border border-accent-teal/20">
            🇸🇬 SGX Stocks
          </span>
          <span className="bg-accent-green/10 text-accent-green text-xs font-semibold px-3 py-1 rounded-full border border-accent-green/20">
            📊 REITs & ETFs
          </span>
        </div>
      </div>

      <SearchBar />
      <Results symbol={symbol} />
    </>
  );
}

export default App;