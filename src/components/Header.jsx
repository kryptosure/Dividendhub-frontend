import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useStore from '../store/useStore';
import SimulatorDropdown from './SimulatorDropdown';

const Header = () => {
  const { token, user, logout, market, setMarket, currency, setCurrency, theme, toggleTheme } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
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
    <header className="bg-bg-secondary shadow-sm border-b border-border sticky top-0 z-50">
      <div className="w-full md:w-fit md:mx-auto px-2 md:px-3 py-2 md:py-3 flex items-center justify-between gap-2">
        
        {/* Logo */}
        <Link to="/" className="flex items-center flex-shrink-0">
          <img src="/images/logo.svg" alt="DividendBro" className="h-[50px] md:h-[65px] w-auto" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-3">

          {/* Market Toggle */}
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

          {/* Currency Toggle */}
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

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-full hover:bg-bg-surface-hover transition"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          {/* Nav items */}
          <Link to="/top" className="text-text-secondary hover:text-text-primary text-sm font-medium whitespace-nowrap">
            Top Dividend Stocks
          </Link>
          <Link to="/portfolio" className="text-text-secondary hover:text-text-primary text-sm font-medium whitespace-nowrap">
            My Portfolio
          </Link>

          {/* Simulator Dropdown */}
          <SimulatorDropdown />

          <Link to="/blog" className="text-text-secondary hover:text-text-primary text-sm font-medium whitespace-nowrap">
            Blog
          </Link>

          {/* Auth */}
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

        {/* Mobile Main Header: Market, Currency, Theme, Hamburger */}
        <div className="flex md:hidden items-center gap-1.5 ml-auto">
          
          {/* Market Toggle (Compact) */}
          <div className="flex items-center gap-0.5 border border-border rounded-full p-0.5">
            <button
              onClick={() => handleMarketChange('us')}
              className={`px-2 py-1 text-[10px] font-medium rounded-full transition ${
                market === 'us' ? 'bg-accent-blue text-white' : 'text-text-secondary'
              }`}
            >
              US
            </button>
            <button
              onClick={() => handleMarketChange('sg')}
              className={`px-2 py-1 text-[10px] font-medium rounded-full transition ${
                market === 'sg' ? 'bg-accent-blue text-white' : 'text-text-secondary'
              }`}
            >
              SGX
            </button>
          </div>

          {/* Currency Toggle (Compact) */}
          <div className="flex items-center gap-0.5 border border-border rounded-full p-0.5">
            <button
              onClick={() => setCurrency('usd')}
              className={`px-2 py-1 text-[10px] font-medium rounded-full transition ${
                currency === 'usd' ? 'bg-accent-blue text-white' : 'text-text-secondary'
              }`}
            >
              USD
            </button>
            <button
              onClick={() => setCurrency('sgd')}
              className={`px-2 py-1 text-[10px] font-medium rounded-full transition ${
                currency === 'sgd' ? 'bg-accent-blue text-white' : 'text-text-secondary'
              }`}
            >
              SGD
            </button>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-full hover:bg-bg-surface-hover transition text-sm"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          {/* Hamburger Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex flex-col justify-center items-center w-10 h-10 rounded-lg hover:bg-bg-surface-hover transition"
            aria-label="Toggle menu"
          >
            <div className={`w-6 h-0.5 bg-text-primary mb-1.5 transition-transform ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></div>
            <div className={`w-6 h-0.5 bg-text-primary mb-1.5 transition-opacity ${isMobileMenuOpen ? 'opacity-0' : ''}`}></div>
            <div className={`w-6 h-0.5 bg-text-primary transition-transform ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></div>
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu (Only Nav Links & Auth) */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-bg-secondary border-t border-border px-4 py-4 space-y-4 max-h-[calc(100vh-80px)] overflow-y-auto">
          
          {/* Nav Links */}
          <div className="flex flex-col gap-2 border-t border-border pt-4">
            <Link to="/top" className="text-text-primary text-base font-medium py-2 hover:text-accent-blue">
              📊 Top Dividend Stocks
            </Link>
            <Link to="/portfolio" className="text-text-primary text-base font-medium py-2 hover:text-accent-blue">
              💼 My Portfolio
            </Link>
            <Link to="/simulate/one-time" className="text-text-primary text-base font-medium py-2 hover:text-accent-blue">
              📈 One-Time Simulator
            </Link>
            <Link to="/simulate/dca" className="text-text-primary text-base font-medium py-2 hover:text-accent-blue">
              📊 DCA Simulator
            </Link>
            <Link to="/blog" className="text-text-primary text-base font-medium py-2 hover:text-accent-blue">
              📝 Blog
            </Link>
          </div>

          {/* Auth */}
          <div className="border-t border-border pt-4">
            {token ? (
              <div className="flex items-center justify-between">
                <span className="text-text-secondary font-medium truncate">
                  👤 {displayName}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium text-accent-red hover:underline"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link to="/login" className="block text-center w-full py-2 bg-accent-blue text-white font-semibold rounded-full hover:bg-accent-blue/90 transition">
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;