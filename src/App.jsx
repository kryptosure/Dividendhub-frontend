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
import SimulatorSingle from './pages/SimulatorSingle';
import SimulatorDCA from './pages/SimulatorDCA';
import Watchlist from './pages/Watchlist'; 
import StockComparison from './pages/StockComparison';

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
          setUser({ email: userData.email });
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
          <Helmet>
            <meta property="og:type" content="website" />
            <meta property="og:site_name" content="DividendBro" />
            <meta property="og:url" content={window.location.href} />
            <meta property="og:image" content={DEFAULT_IMAGE} />
            <meta name="twitter:card" content="summary_large_image" />
            <meta property="og:title" content="DividendBro – Premium Dividend Analysis & Management Hub" />
            <meta property="og:description" content="Track yields, compound simulations, and manage income assets cleanly for US & SGX stock markets." />
          </Helmet>

          <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col font-sans antialiased selection:bg-accent-blue/20">
            <Header />
            <main className="flex-1 max-w-6xl mx-auto px-4 py-8 w-full pb-24 md:pb-8 animate-in fade-in duration-300">
              <Routes>
                <Route path="/" element={<Home />} />
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
    ? `${symbol} Dividend History – Yield, Ex‑Dates & Risk Assessment`
    : 'DividendBro – Best Dividend Analysis & Management Tool for US & SGX Stocks';

  const pageDescription = symbol
    ? `View complete payout histories, current yields metrics, capital safety scores, and ex‑dividend dates for ${symbol}.`
    : 'Analyze distributions records, verify trailing yield positions, and manage portfolio assets cleanly.';

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={window.location.href} />
      </Helmet>

      <div className="text-center mb-10 max-w-2xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-text-primary leading-tight">
          Smart Dividend Tracking <br />
          For <span className="bg-gradient-to-r from-accent-blue to-accent-teal bg-clip-text text-transparent">Modern Investors</span>
        </h1>
        <p className="text-text-secondary text-sm mt-3 font-medium">
          Analyse cash flows, calculate asset growth caps, and track passive dividend revenue across US and SGX channels seamlessly.
        </p>
        <div className="flex flex-wrap justify-center gap-1.5 mt-4 text-[10px] font-bold uppercase tracking-wider">
          <span className="bg-accent-blue/5 text-accent-blue px-3 py-1 rounded-md border border-accent-blue/10">🇺🇸 US Equities</span>
          <span className="bg-accent-teal/5 text-accent-teal px-3 py-1 rounded-md border border-accent-teal/10">🇸🇬 SGX Vectors</span>
          <span className="bg-accent-purple/5 text-accent-purple px-3 py-1 rounded-md border border-accent-purple/10">📊 REIT Frameworks</span>
        </div>
      </div>

      <SearchBar />
      <Results symbol={symbol} />
    </>
  );
}

export default App;