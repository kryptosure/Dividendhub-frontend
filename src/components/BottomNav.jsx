import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const BottomNav = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-bg-secondary/90 backdrop-blur-md border-t border-border/40 flex justify-around items-center py-1.5 px-2 md:hidden shadow-lg pb-safe">
      <Link to="/" className={`flex flex-col items-center text-[9px] font-bold uppercase tracking-wider py-1.5 px-3 rounded-lg transition-all active:scale-95 ${isActive('/') ? 'text-accent-blue bg-accent-blue/5' : 'text-text-muted'}`}>
        <span className="text-base mb-0.5">🔍</span>
        <span>Search</span>
      </Link>
      <Link to="/portfolio" className={`flex flex-col items-center text-[9px] font-bold uppercase tracking-wider py-1.5 px-3 rounded-lg transition-all active:scale-95 ${isActive('/portfolio') ? 'text-accent-blue bg-accent-blue/5' : 'text-text-muted'}`}>
        <span className="text-base mb-0.5">📊</span>
        <span>PORTFOLIO</span>
      </Link>
      <Link to="/top" className={`flex flex-col items-center text-[9px] font-bold uppercase tracking-wider py-1.5 px-3 rounded-lg transition-all active:scale-95 ${isActive('/top') ? 'text-accent-blue bg-accent-blue/5' : 'text-text-muted'}`}>
        <span className="text-base mb-0.5">🏆</span>
        <span>TOP DIV STOCKS</span>
      </Link>
      <Link to="/blog" className={`flex flex-col items-center text-[9px] font-bold uppercase tracking-wider py-1.5 px-3 rounded-lg transition-all active:scale-95 ${isActive('/blog') ? 'text-accent-blue bg-accent-blue/5' : 'text-text-muted'}`}>
        <span className="text-base mb-0.5">📝</span>
        <span>LEARNING</span>
      </Link>
    </nav>
  );
};

export default BottomNav;