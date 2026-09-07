import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useStore from '../store/useStore';
import SimulatorDropdown from './SimulatorDropdown';

const Header = () => {
  const { token, user, logout, market, setMarket, currency, setCurrency, theme, toggleTheme } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleMarketChange = (newMarket) => {
    setMarket(newMarket);
    setCurrency(newMarket === 'us' ? 'usd' : 'sgd');
  };

  const displayName = user?.email || 'User';

  return (
    <header className="bg-bg-secondary/80 backdrop-blur-md sticky top-0 z-50 border-b border-border/50 transition-all duration-200">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
        
        <Link to="/" className="flex items-center flex-shrink-0 active:scale-[0.98] transition-transform">
          <img src="/images/logo.svg" alt="DividendBro" className="h-12 sm:h-16 w-auto object-contain" />
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <div className="flex gap-4 border border-border/40 bg-bg-primary/40 rounded-xl p-1">
            <div className="flex items-center bg-bg-secondary rounded-lg border border-border/20 shadow-sm p-0.5">
              <button
                onClick={() => handleMarketChange('us')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${market === 'us' ? 'bg-accent-blue text-white shadow-sm' : 'text-text-muted hover:text-text-primary'}`}
              >
                US
              </button>
              <button
                onClick={() => handleMarketChange('sg')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${market === 'sg' ? 'bg-accent-blue text-white shadow-sm' : 'text-text-muted hover:text-text-primary'}`}
              >
                SGX
              </button>
            </div>

            <div className="flex items-center bg-bg-secondary rounded-lg border border-border/20 shadow-sm p-0.5">
              <button
                onClick={() => setCurrency('usd')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${currency === 'usd' ? 'bg-accent-teal text-white shadow-sm' : 'text-text-muted hover:text-text-primary'}`}
              >
                USD
              </button>
              <button
                onClick={() => setCurrency('sgd')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${currency === 'sgd' ? 'bg-accent-teal text-white shadow-sm' : 'text-text-muted hover:text-text-primary'}`}
              >
                SGD
              </button>
            </div>
          </div>

          <div className="flex items-center gap-5 text-sm font-semibold tracking-tight">
            <Link to="/top" className="text-text-secondary hover:text-accent-blue transition-colors">Top Dividend Stocks</Link>
            {/* Calendar Link Removed */}
            <Link to="/compare" className="text-text-secondary hover:text-accent-blue transition-colors">Compare</Link>
            <Link to="/watchlist" className="text-text-secondary hover:text-accent-blue transition-colors">Watchlist</Link>
            <Link to="/portfolio" className="text-text-secondary hover:text-accent-blue transition-colors">My Portfolio</Link>
            <SimulatorDropdown />
            <Link to="/blog" className="text-text-secondary hover:text-accent-blue transition-colors">Insights</Link>
          </div>

          <div className="h-4 w-[1px] bg-border/60" />

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-bg-surface border border-border/40 hover:bg-bg-surface-hover active:scale-95 transition-all text-sm"
              aria-label="Theme Controller"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>

            {token ? (
              <div className="flex items-center gap-3 bg-bg-surface/60 border border-border/40 pl-3 pr-2 py-1 rounded-xl text-xs font-bold text-text-secondary">
                <span className="truncate max-w-[100px]">👤 {displayName.split('@')[0]}</span>
                <button onClick={handleLogout} className="px-2.5 py-1 bg-accent-red/10 border border-accent-red/20 text-accent-red rounded-lg hover:bg-accent-red/20 transition-colors">
                  Signout
                </button>
              </div>
            ) : (
              <Link to="/login" className="px-4 py-2 bg-gradient-to-r from-accent-blue to-accent-teal text-white text-xs font-bold rounded-xl shadow-sm hover:opacity-95 active:scale-95 transition-all">
                Login
              </Link>
            )}
          </div>
        </nav>

        <div className="flex md:hidden items-center gap-2 ml-auto">
          <button
            onClick={toggleTheme}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-bg-surface border border-border/40 text-sm"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="w-9 h-9 flex flex-col justify-center items-center rounded-xl bg-bg-surface border border-border/40 transition-colors"
            aria-label="Navigation Drawer"
          >
            <div className={`w-4 h-0.5 bg-text-primary mb-1 transition-all ${isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
            <div className={`w-4 h-0.5 bg-text-primary mb-1 transition-all ${isMobileMenuOpen ? 'opacity-0' : ''}`} />
            <div className={`w-4 h-0.5 bg-text-primary transition-all ${isMobileMenuOpen ? '-rotate-45 -translate-y-1' : ''}`} />
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border/40 bg-bg-secondary px-4 py-4 space-y-4 animate-in slide-in-from-top duration-200">
          <div className="grid grid-cols-2 gap-2 bg-bg-primary/50 p-2 rounded-xl border border-border/30">
            <div className="flex flex-col gap-1">
              <span className="text-[9px] font-bold uppercase tracking-wider text-text-muted px-1">Region</span>
              <div className="flex bg-bg-secondary rounded-lg p-0.5 border border-border/20">
                <button onClick={() => handleMarketChange('us')} className={`flex-1 py-1.5 text-center text-xs font-bold rounded-md ${market === 'us' ? 'bg-accent-blue text-white' : 'text-text-muted'}`}>US</button>
                <button onClick={() => handleMarketChange('sg')} className={`flex-1 py-1.5 text-center text-xs font-bold rounded-md ${market === 'sg' ? 'bg-accent-blue text-white' : 'text-text-muted'}`}>SGX</button>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[9px] font-bold uppercase tracking-wider text-text-muted px-1">Currency</span>
              <div className="flex bg-bg-secondary rounded-lg p-0.5 border border-border/20">
                <button onClick={() => setCurrency('usd')} className={`flex-1 py-1.5 text-center text-xs font-bold rounded-md ${currency === 'usd' ? 'bg-accent-teal text-white' : 'text-text-muted'}`}>USD</button>
                <button onClick={() => setCurrency('sgd')} className={`flex-1 py-1.5 text-center text-xs font-bold rounded-md ${currency === 'sgd' ? 'bg-accent-teal text-white' : 'text-text-muted'}`}>SGD</button>
              </div>
            </div>
          </div>

          <div className="flex flex-col text-sm font-semibold divide-y divide-border/20">
            <Link to="/top" className="py-3 flex items-center text-text-primary">🏆 High Dividend Yield Board</Link>
            {/* Calendar Link Removed */}
            <Link to="/compare" className="py-3 flex items-center text-text-primary">📊 Compare Stocks</Link>
            <Link to="/watchlist" className="py-3 flex items-center text-text-primary">⭐ Watchlist</Link>
            <Link to="/portfolio" className="py-3 flex items-center text-text-primary">💼 My Portfolio</Link>
            <Link to="/simulate/one-time" className="py-3 flex items-center text-text-primary">📈 Single Purchase Engine</Link>
            <Link to="/simulate/dca" className="py-3 flex items-center text-text-primary">📊 Regular Investment DCA Simulator</Link>
            <Link to="/blog" className="py-3 flex items-center text-text-primary">📝 Financial Academy Hub</Link>
          </div>

          <div className="pt-2 border-t border-border/30">
            {token ? (
              <div className="flex items-center justify-between bg-bg-surface p-3 rounded-xl border border-border/40">
                <span className="text-xs font-bold text-text-secondary truncate">👤 {displayName}</span>
                <button onClick={handleLogout} className="text-xs font-bold text-accent-red bg-accent-red/5 px-3 py-1.5 rounded-lg border border-accent-red/20">Logout</button>
              </div>
            ) : (
              <Link to="/login" className="block text-center w-full py-3 bg-gradient-to-r from-accent-blue to-accent-teal text-white text-xs font-bold rounded-xl shadow-md">
                Login To My Account
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;