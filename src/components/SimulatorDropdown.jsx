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
        className="text-text-secondary hover:text-text-primary text-sm font-medium whitespace-nowrap flex items-center gap-1"
      >
        Simulator Tools
        <span className={`text-xs transition-transform ${isOpen ? 'rotate-180' : ''}`}>▼</span>
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-bg-secondary border border-border rounded-lg shadow-lg overflow-hidden min-w-[200px] z-50">
          <Link
            to="/simulate/one-time"
            className="block px-4 py-2 text-sm text-text-primary hover:bg-bg-surface-hover transition"
            onClick={() => setIsOpen(false)}
          >
            📈 One-Time Investment Simulator
          </Link>
          <Link
            to="/simulate/dca"
            className="block px-4 py-2 text-sm text-text-primary hover:bg-bg-surface-hover transition border-t border-border"
            onClick={() => setIsOpen(false)}
          >
            📊 Regular Investment (DCA) Simulator
          </Link>
        </div>
      )}
    </div>
  );
};

export default SimulatorDropdown;