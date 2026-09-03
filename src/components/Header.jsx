import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';

const Header = () => {
  const { token, logout } = useStore();
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

        {/* Desktop Navigation (hidden on mobile) */}
        <nav className="hidden md:flex items-center space-x-6">
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
            <>
              <button
                onClick={handleLogout}
                className="text-sm font-medium text-accent-red hover:underline"
              >
                Logout
              </button>
            </>
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

        {/* Mobile Menu Button (optional – you can add a hamburger here) */}
        <div className="md:hidden">
          {/* You can add a hamburger icon if you want */}
        </div>
      </div>
    </header>
  );
};

export default Header;