import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';

const Header = () => {
  const { token, logout, currency, setCurrency, theme, toggleTheme } = useStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-bg-secondary shadow-sm border-b border-border sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-xl font-bold gradient-text">
          DividendBro
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-4">
          {/* Currency Toggle – both options visible */}
          <div className="flex items-center gap-1 border border-border rounded-full p-0.5">
            <button
              onClick={() => setCurrency('usd')}
              className={`px-3 py-1 text-xs font-medium rounded-full transition ${
                currency === 'usd'
                  ? 'bg-accent-blue text-white'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              USD
            </button>
            <button
              onClick={() => setCurrency('sgd')}
              className={`px-3 py-1 text-xs font-medium rounded-full transition ${
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
            className="p-2 rounded-full hover:bg-bg-surface-hover transition"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          <Link to="/top" className="text-text-secondary hover:text-text-primary text-sm font-medium">
            Top Stocks
          </Link>
          <Link to="/portfolio" className="text-text-secondary hover:text-text-primary text-sm font-medium">
            Portfolio
          </Link>
          <Link to="/blog" className="text-text-secondary hover:text-text-primary text-sm font-medium">
            Blog
          </Link>
          {token ? (
            <button
              onClick={handleLogout}
              className="text-sm font-medium text-accent-red hover:underline"
            >
              Logout
            </button>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-accent-blue hover:underline">
                Login
              </Link>
              <Link
                to="/signup"
                className="text-sm font-medium bg-accent-blue text-white px-4 py-1 rounded-full hover:bg-accent-blue/90 transition"
              >
                Sign Up
              </Link>
            </>
          )}
        </nav>

        {/* Mobile Menu – compact version */}
        <div className="md:hidden flex items-center gap-2">
          {/* Currency buttons (small) */}
          <div className="flex items-center gap-0.5 border border-border rounded-full p-0.5">
            <button
              onClick={() => setCurrency('usd')}
              className={`px-2 py-0.5 text-[10px] font-medium rounded-full transition ${
                currency === 'usd'
                  ? 'bg-accent-blue text-white'
                  : 'text-text-secondary'
              }`}
            >
              USD
            </button>
            <button
              onClick={() => setCurrency('sgd')}
              className={`px-2 py-0.5 text-[10px] font-medium rounded-full transition ${
                currency === 'sgd'
                  ? 'bg-accent-blue text-white'
                  : 'text-text-secondary'
              }`}
            >
              SGD
            </button>
          </div>
          {/* Theme toggle (small) */}
          <button
            onClick={toggleTheme}
            className="text-lg"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;