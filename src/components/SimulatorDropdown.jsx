import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

const SimulatorDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-text-secondary hover:text-text-primary text-sm font-semibold whitespace-nowrap flex items-center gap-1 transition-colors duration-200"
      >
        Simulations
        <span className={`text-[10px] text-text-muted transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-bg-secondary/95 backdrop-blur-md border border-border/80 rounded-xl shadow-xl overflow-hidden min-w-[220px] z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <Link
            to="/simulate/one-time"
            className="block px-4 py-3 text-xs uppercase font-bold tracking-wider text-text-primary hover:bg-bg-surface-hover/80 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            📈 Single Purchase
          </Link>
          <Link
            to="/simulate/dca"
            className="block px-4 py-3 text-xs uppercase font-bold tracking-wider text-text-primary hover:bg-bg-surface-hover/80 transition-colors border-t border-border/40"
            onClick={() => setIsOpen(false)}
          >
            📊 Periodic (DCA)
          </Link>
        </div>
      )}
    </div>
  );
};

export default SimulatorDropdown;
