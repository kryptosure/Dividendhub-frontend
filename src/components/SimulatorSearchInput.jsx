import React, { useState, useEffect, useRef } from 'react';
import { getStockList } from '../services/api';

const SimulatorSearchInput = ({ symbol, setSymbol, market, placeholder = 'Search stocks...' }) => {
  const [query, setQuery] = useState(symbol || '');
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [stockList, setStockList] = useState([]);
  const wrapperRef = useRef(null);

  // Fetch and cache stock list (same as SearchBar)
  useEffect(() => {
    const fetchStockList = async () => {
      const cached = localStorage.getItem('stockList');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setStockList(parsed);
          return;
        } catch (e) {}
      }
      try {
        const data = await getStockList();
        setStockList(data);
        localStorage.setItem('stockList', JSON.stringify(data));
      } catch (error) {
        console.error('Failed to fetch stock list:', error);
      }
    };
    fetchStockList();
  }, []);

  // Filter suggestions from local cache
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }
    const q = query.toLowerCase();
    const filtered = stockList.filter(
      (item) =>
        item.symbol.toLowerCase().includes(q) ||
        (item.name && item.name.toLowerCase().includes(q))
    );
    setSuggestions(filtered.slice(0, 10));
    setIsOpen(filtered.length > 0);
  }, [query, stockList]);

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
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setSymbol(e.target.value.toUpperCase());
        }}
        onFocus={() => suggestions.length > 0 && setIsOpen(true)}
        placeholder={placeholder}
        className="w-full bg-bg-surface border border-border rounded-lg px-4 py-2 text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-blue"
        autoComplete="off"
      />
      {isOpen && suggestions.length > 0 && (
        <ul className="absolute z-10 w-full mt-1 bg-bg-secondary border border-border rounded-lg shadow-lg overflow-hidden max-h-60 overflow-y-auto">
          {suggestions.map((item) => (
            <li
              key={item.symbol}
              className="px-4 py-2 hover:bg-bg-surface-hover cursor-pointer flex flex-col border-b border-border last:border-b-0"
              onMouseDown={() => handleSelect(item.symbol)}
            >
              <div className="flex items-center justify-between">
                <span className="text-text-primary font-medium">
                  {item.name || item.symbol}
                </span>
                <span className="font-mono text-accent-teal text-sm ml-2 flex-shrink-0">
                  {item.symbol}
                </span>
              </div>
              <div className="text-xs text-text-muted mt-0.5">
                {item.market === 'sg' ? 'SGX' : 'NASDAQ'}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SimulatorSearchInput;