import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import useStore from '../store/useStore';
import { Sun, Moon } from 'lucide-react';

const Header = () => {
  const location = useLocation();
  const {
    theme,
    toggleTheme,
    market,
    setMarket,
    currency,
    setCurrency,
    user,
    logout,
  } = useStore();

  const isActive = (path) => location.pathname === path;

  const handleMarketChange = (newMarket) => {
    setMarket(newMarket);
    if (newMarket === 'us') {
      setCurrency('usd');
    } else if (newMarket === 'sg') {
      setCurrency('sgd');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-bg-primary/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between py-2 flex-wrap gap-2">
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <svg className="w-8 h-8" viewBox="0 0 100 100" fill="none">
              <defs>
                <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="50%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#34d399" />
                </linearGradient>
              </defs>
              <circle cx="50" cy="50" r="42" stroke="url(#logoGrad)" strokeWidth="6" strokeDasharray="10 6" />
              <path d="M35 58 V34 h14 c6 0 10 3 10 8 0 3-1.5 5-4 6.5 3 1 5 3.5 5 7 0 5.5-4.5 9.5-11 9.5H35z M42 42 h5 c2.5 0 4-1 4-3s-1.5-3-4-3h-5v6z M42 50 h7 c3 0 4.5-1.5 4.5-4s-1.5-4-4.5-4h-7v8z" fill="url(#logoGrad)" />
            </svg>
            <span className="font-extrabold text-lg bg-gradient-to-r from-accent-blue to-accent-teal bg-clip-text text-transparent hidden sm:block">
              DividendBro
            </span>
          </Link>

          <div className="flex items-center gap-1 flex-wrap">
            <div className="flex gap-0.5 bg-bg-surface rounded-full p-0.5 border border-border">
              <button
                className={`text-xs font-semibold px-3 py-1 rounded-full transition ${market === 'us' ? 'bg-accent-blue text-white' : 'text-text-muted hover:text-text-primary'}`}
                onClick={() => handleMarketChange('us')}
                aria-pressed={market === 'us'}
              >
                🇺🇸 US
              </button>
              <button
                className={`text-xs font-semibold px-3 py-1 rounded-full transition ${market === 'sg' ? 'bg-accent-blue text-white' : 'text-text-muted hover:text-text-primary'}`}
                onClick={() => handleMarketChange('sg')}
                aria-pressed={market === 'sg'}
              >
                🇸🇬 SGX
              </button>
            </div>

            <div className="flex gap-0.5 bg-bg-surface rounded-full p-0.5 border border-border">
              <button
                className={`text-xs font-semibold px-3 py-1 rounded-full transition ${currency === 'sgd' ? 'bg-accent-blue text-white' : 'text-text-muted hover:text-text-primary'}`}
                onClick={() => setCurrency('sgd')}
                aria-pressed={currency === 'sgd'}
              >
                S$
              </button>
              <button
                className={`text-xs font-semibold px-3 py-1 rounded-full transition ${currency === 'usd' ? 'bg-accent-blue text-white' : 'text-text-muted hover:text-text-primary'}`}
                onClick={() => setCurrency('usd')}
                aria-pressed={currency === 'usd'}
              >
                $
              </button>
            </div>

            <div className="flex items-center gap-1">
              {user ? (
                <>
                  <span className="text-xs text-text-secondary hidden sm:inline">👤 {user.email}</span>
                  <button onClick={logout} className="text-xs font-semibold px-3 py-1 rounded-full border border-border text-text-muted hover:bg-accent-red hover:text-white hover:border-accent-red transition">Logout</button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-xs font-semibold px-3 py-1 rounded-full border border-border text-text-muted hover:bg-accent-blue hover:text-white hover:border-accent-blue transition">Login</Link>
                  <Link to="/signup" className="text-xs font-semibold px-3 py-1 rounded-full bg-accent-blue text-white hover:bg-accent-teal transition">Sign Up</Link>
                </>
              )}
            </div>

            <button onClick={toggleTheme} className="p-1.5 rounded-full border border-border bg-bg-surface text-text-muted hover:text-text-primary transition" aria-label="Toggle theme">
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>

        <nav className="flex gap-1 border-t border-border pt-1 pb-0.5 overflow-x-auto scrollbar-hide">
          <Link to="/" className={`px-4 py-1.5 text-sm font-medium rounded-t-lg transition ${isActive('/') ? 'text-accent-blue border-b-2 border-accent-blue bg-bg-surface' : 'text-text-muted hover:text-text-primary hover:bg-bg-surface/50'}`}>🔍 Search</Link>
          <Link to="/portfolio" className={`px-4 py-1.5 text-sm font-medium rounded-t-lg transition ${isActive('/portfolio') ? 'text-accent-blue border-b-2 border-accent-blue bg-bg-surface' : 'text-text-muted hover:text-text-primary hover:bg-bg-surface/50'}`}>📊 Portfolio</Link>
          <Link to="/top" className={`px-4 py-1.5 text-sm font-medium rounded-t-lg transition ${isActive('/top') ? 'text-accent-blue border-b-2 border-accent-blue bg-bg-surface' : 'text-text-muted hover:text-text-primary hover:bg-bg-surface/50'}`}>🏆 Top Stocks</Link>
          <Link to="/blog" className={`px-4 py-1.5 text-sm font-medium rounded-t-lg transition ${isActive('/blog') ? 'text-accent-blue border-b-2 border-accent-blue bg-bg-surface' : 'text-text-muted hover:text-text-primary hover:bg-bg-surface/50'}`}>📝 Blog</Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;