import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const BottomNav = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-bg-primary/90 backdrop-blur-md border-t border-border flex justify-around items-center py-1 px-2 md:hidden">
      <Link to="/" className={`flex flex-col items-center text-xs font-medium py-1 px-3 rounded-lg transition ${isActive('/') ? 'text-accent-teal bg-accent-teal/10' : 'text-text-muted hover:text-text-primary'}`}>
        <span className="text-xl">🔍</span>
        <span>Search</span>
      </Link>
      <Link to="/portfolio" className={`flex flex-col items-center text-xs font-medium py-1 px-3 rounded-lg transition ${isActive('/portfolio') ? 'text-accent-teal bg-accent-teal/10' : 'text-text-muted hover:text-text-primary'}`}>
        <span className="text-xl">📊</span>
        <span>Portfolio</span>
      </Link>
      <Link to="/top" className={`flex flex-col items-center text-xs font-medium py-1 px-3 rounded-lg transition ${isActive('/top') ? 'text-accent-teal bg-accent-teal/10' : 'text-text-muted hover:text-text-primary'}`}>
        <span className="text-xl">🏆</span>
        <span>Top Stocks</span>
      </Link>
      <Link to="/blog" className={`flex flex-col items-center text-xs font-medium py-1 px-3 rounded-lg transition ${isActive('/blog') ? 'text-accent-teal bg-accent-teal/10' : 'text-text-muted hover:text-text-primary'}`}>
        <span className="text-xl">📝</span>
        <span>Blog</span>
      </Link>
    </nav>
  );
};

export default BottomNav;