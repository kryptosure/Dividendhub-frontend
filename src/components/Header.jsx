import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';

const Header = () => {
  const { token, user, logout, market, setMarket, currency, setCurrency, theme, toggleTheme } = useStore();
  const navigate = useNavigate();

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
    <header className="bg-bg-secondary shadow-sm border-b border-border sticky top-0 z-30">
      <div className="w-full md:w-fit md:mx-auto px-2 md:px-3 py-2 md:py-3 flex flex-wrap items-center gap-1 md:gap-3">
        
        <Link to="/" className="flex items-center flex-shrink-0 mr-auto md:mr-0">
          <img src="/images/logo.svg" alt="DividendBro" className="h-[50px] md:h-[65px] w-auto" />
        </Link>

        {/* Desktop Navigation – hidden on mobile */}
        <nav className="hidden md:flex items-center gap-3">

          <div className="flex items-center gap-0.5 border border-border rounded-full p-0.5">
            <button
              onClick={() => handleMarketChange('us')}
              className={`px-2.5 py-0.5 text-xs font-medium rounded-full transition ${
                market === 'us'
                  ? 'bg-accent-blue text-white'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              US
            </button>
            <button
              onClick={() => handleMarketChange('sg')}
              className={`px-2.5 py-0.5 text-xs font-medium rounded-full transition ${
                market === 'sg'
                  ? 'bg-accent-blue text-white'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              SGX
            </button>
          </div>

          <div className="flex items-center gap-0.5 border border-border rounded-full p-0.5">
            <button
              onClick={() => setCurrency('usd')}
              className={`px-2.5 py-0.5 text-xs font-medium rounded-full transition ${
                currency === 'usd'
                  ? 'bg-accent-blue text-white'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              USD
            </button>
            <button
              onClick={() => setCurrency('sgd')}
              className={`px-2.5 py-0.5 text-xs font-medium rounded-full transition ${
                currency === 'sgd'
                  ? 'bg-accent-blue text-white'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              SGD
            </button>
          </div>

          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-full hover:bg-bg-surface-hover transition"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          <Link to="/top" className="text-text-secondary hover:text-text-primary text-sm font-medium whitespace-nowrap">
            Top Stocks
          </Link>
          <Link to="/portfolio" className="text-text-secondary hover:text-text-primary text-sm font-medium whitespace-nowrap">
            Portfolio
          </Link>
          <Link to="/blog" className="text-text-secondary hover:text-text-primary text-sm font-medium whitespace-nowrap">
            Blog
          </Link>

          {/* NEW Simulator links */}
          <Link to="/simulate/one-time" className="text-text-secondary hover:text-text-primary text-sm font-medium whitespace-nowrap">
            One-Time Sim
          </Link>
          <Link to="/simulate/dca" className="text-text-secondary hover:text-text-primary text-sm font-medium whitespace-nowrap">
            DCA Sim
          </Link>

          {token ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-text-secondary font-medium max-w-[120px] truncate">
                👤 {displayName}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm font-medium text-accent-red hover:underline whitespace-nowrap"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login" className="text-sm font-medium text-accent-blue hover:underline whitespace-nowrap">
              Login
            </Link>
          )}
        </nav>

        {/* Mobile Menu */}
        <div className="flex md:hidden items-center gap-1 flex-wrap justify-end w-auto ml-auto">
          <div className="flex items-center gap-0.5 border border-border rounded-full p-0.5">
            <button
              onClick={() => handleMarketChange('us')}
              className={`px-1.5 py-0.5 text-[10px] font-medium rounded-full transition ${
                market === 'us' ? 'bg-accent-blue text-white' : 'text-text-secondary'
              }`}
            >
              US
            </button>
            <button
              onClick={() => handleMarketChange('sg')}
              className={`px-1.5 py-0.5 text-[10px] font-medium rounded-full transition ${
                market === 'sg' ? 'bg-accent-blue text-white' : 'text-text-secondary'
              }`}
            >
              SGX
            </button>
          </div>
          <div className="flex items-center gap-0.5 border border-border rounded-full p-0.5">
            <button
              onClick={() => setCurrency('usd')}
              className={`px-1.5 py-0.5 text-[10px] font-medium rounded-full transition ${
                currency === 'usd' ? 'bg-accent-blue text-white' : 'text-text-secondary'
              }`}
            >
              USD
            </button>
            <button
              onClick={() => setCurrency('sgd')}
              className={`px-1.5 py-0.5 text-[10px] font-medium rounded-full transition ${
                currency === 'sgd' ? 'bg-accent-blue text-white' : 'text-text-secondary'
              }`}
            >
              SGD
            </button>
          </div>
          <button onClick={toggleTheme} className="text-base" aria-label="Toggle theme">
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          {token ? (
            <div className="flex items-center gap-0.5 ml-0.5">
              <span className="text-[10px] text-text-secondary truncate max-w-[50px]">
                {displayName}
              </span>
              <button
                onClick={handleLogout}
                className="text-[10px] font-medium text-accent-red hover:underline"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login" className="text-[10px] font-medium text-accent-blue hover:underline">
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;