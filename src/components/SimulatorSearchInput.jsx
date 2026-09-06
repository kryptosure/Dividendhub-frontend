import React, { useState, useEffect, useRef } from 'react';
import { searchStocks } from '../services/api';

const SimulatorSearchInput = ({ symbol, setSymbol, market, placeholder = 'Search stocks...' }) => {
  const [query, setQuery] = useState(symbol || '');
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    const delayDebounce = setTimeout(async () => {
      try {
        const res = await searchStocks(query.trim(), market);
        if (Array.isArray(res)) {
          setSuggestions(res);
          setIsOpen(res.length > 0);
        }
      } catch (err) {
        console.error('Search input route layer failure:', err);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query, market]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (selectedSymbol) => {
    setQuery(selectedSymbol);
    setSuggestions([]);
    setIsOpen(false);
    setSymbol(selectedSymbol);
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSymbol(e.target.value.toUpperCase());
          }}
          onFocus={() => suggestions.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          className="w-full bg-bg-surface border border-border/60 rounded-xl px-4 py-3 text-sm font-medium text-text-primary placeholder-text-muted/60 focus:outline-none focus:border-accent-blue focus:ring-4 focus:ring-accent-blue/5 shadow-sm transition-all duration-200"
          autoComplete="off"
        />
        {isLoading && (
          <div className="absolute right-4 top-3.5">
            <div className="animate-spin h-4 w-4 border-2 border-accent-blue border-t-transparent rounded-full" />
          </div>
        )}
      </div>
      
      {isOpen && suggestions.length > 0 && (
        <ul className="search-dropdown-50 w-full mt-2 overflow-hidden max-h-60 overflow-y-auto divide-y divide-border/40 animate-in fade-in slide-in-from-top-2 duration-200">
          {suggestions.map((item) => (
            <li
              key={item.symbol}
              className="px-4 py-3 hover:bg-bg-surface-hover/80 cursor-pointer flex items-center justify-between transition-colors duration-150"
              onMouseDown={() => handleSelect(item.symbol)}
            >
              <div className="flex flex-col min-w-0 pr-4">
                <span className="text-text-primary font-semibold text-sm truncate">
                  {item.longname || item.shortname || item.symbol}
                </span>
                <span className="text-[10px] font-bold tracking-wider uppercase text-text-muted mt-0.5">
                  {item.exchange || (market === 'sg' ? 'SGX' : 'NASDAQ')}
                </span>
              </div>
              <span className="font-mono bg-bg-surface border border-border/60 text-accent-teal text-xs px-2.5 py-1 rounded-md font-bold tracking-wider flex-shrink-0">
                {item.symbol}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SimulatorSearchInput;