import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const BottomNav = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-bg-secondary/90 backdrop-blur-md border-t border-border/40 flex justify-around items-center py-2 px-3 md:hidden shadow-lg">
      <Link to="/" className={`flex flex-col items-center text-[10px] font-bold uppercase tracking-wider py-1.5 px-4 rounded-xl transition-all active:scale-95 ${isActive('/') ? 'text-accent-blue bg-accent-blue/5' : 'text-text-muted'}`}>
        <span className="text-lg mb-0.5">🔍</span>
        <span>Search</span>
      </Link>
      <Link to="/portfolio" className={`flex flex-col items-center text-[10px] font-bold uppercase tracking-wider py-1.5 px-4 rounded-xl transition-all active:scale-95 ${isActive('/portfolio') ? 'text-accent-blue bg-accent-blue/5' : 'text-text-muted'}`}>
        <span className="text-lg mb-0.5">📊</span>
        <span>Ledger</span>
      </Link>
      <Link to="/top" className={`flex flex-col items-center text-[10px] font-bold uppercase tracking-wider py-1.5 px-4 rounded-xl transition-all active:scale-95 ${isActive('/top') ? 'text-accent-blue bg-accent-blue/5' : 'text-text-muted'}`}>
        <span className="text-lg mb-0.5">🏆</span>
        <span>Boards</span>
      </Link>
      <Link to="/blog" className={`flex flex-col items-center text-[10px] font-bold uppercase tracking-wider py-1.5 px-4 rounded-xl transition-all active:scale-95 ${isActive('/blog') ? 'text-accent-blue bg-accent-blue/5' : 'text-text-muted'}`}>
        <span className="text-lg mb-0.5">📝</span>
        <span>Academy</span>
      </Link>
    </nav>
  );
};

export default BottomNav;
