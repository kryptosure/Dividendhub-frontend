import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import { searchStocks } from '../services/api'; // Make sure to add this function to your api services!

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { market } = useStore();
  const navigate = useNavigate();
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  // Live Backend Search with Debouncing (Cleans up network spam and fetches EVERYTHING)
  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    const delayDebounce = setTimeout(async () => {
      try {
        // Calls the new backend endpoints we fixed earlier
        // Make sure your api service sends a GET request to `/api/stocks/search?q=${query}&market=${market}`
        const res = await searchStocks(query.trim(), market);
        if (Array.isArray(res)) {
          setSuggestions(res);
          setIsOpen(res.length > 0);
        }
      } catch (err) {
        console.error('Live database search failed:', err);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300); // 300ms delay protects your backend server

    return () => clearTimeout(delayDebounce);
  }, [query, market]);

  // Click outside to collapse menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (symbol) => {
    setQuery('');
    setSuggestions([]);
    setIsOpen(false);
    if (inputRef.current) inputRef.current.blur();
    navigate(`/?symbol=${encodeURIComponent(symbol.toUpperCase())}`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      handleSelect(query.trim());
    }
  };

  // Quick action collections
  const quickLinks = {
    us: {
      stocks: [
        { symbol: 'AAPL', name: 'Apple' },
        { symbol: 'MSFT', name: 'Microsoft' },
        { symbol: 'VZ', name: 'Verizon' },
        { symbol: 'JPM', name: 'JPMorgan' },
        { symbol: 'KO', name: 'Coca-Cola' },
      ],
      etfs: [
        { symbol: 'SPY', name: 'S&P 500' },
        { symbol: 'QQQ', name: 'Nasdaq 100' },
        { symbol: 'VTI', name: 'Total Stock' },
      ],
    },
    sg: {
      stocks: [
        { symbol: 'D05.SI', name: 'DBS' },
        { symbol: 'O39.SI', name: 'OCBC' },
        { symbol: 'U11.SI', name: 'UOB' },
        { symbol: 'C6L.SI', name: 'SIA' },
      ],
      etfs: [
        { symbol: 'ES3.SI', name: 'STI ETF' },
        { symbol: 'G3B.SI', name: 'Nikko AM' },
      ],
    },
  };

  const links = quickLinks[market] || quickLinks.us;

  return (
    <div ref={wrapperRef} className="relative w-full max-w-xl mx-auto mb-8 px-4 sm:px-0">
      {/* Search Input Container */}
      <form onSubmit={handleSubmit} className="relative group">
        <div className="absolute left-4 top-3.5 flex items-center pointer-events-none">
          <svg
            className="w-5 h-5 text-text-muted group-focus-within:text-accent-blue transition-colors duration-200"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="7" strokeWidth="2.5" />
            <path d="M21 21l-4.3-4.3" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search tickers, companies, REITs..."
          className="w-full pl-12 pr-12 py-3.5 bg-bg-surface border border-border/60 rounded-xl text-text-primary placeholder-text-muted/60 transition-all duration-200 ease-out focus:outline-none focus:bg-bg-primary focus:border-accent-blue focus:ring-4 focus:ring-accent-blue/10 text-base sm:text-sm font-medium shadow-sm"
          autoComplete="off"
        />

        {/* Loading Spinner */}
        {isLoading && (
          <div className="absolute right-4 top-4">
            <div className="animate-spin h-4 w-4 border-2 border-accent-blue border-t-transparent rounded-full"></div>
          </div>
        )}
      </form>

      {/* Modern Trending Badges */}
      <div className="flex flex-wrap gap-2 mt-3 items-center justify-start overflow-x-auto no-scrollbar py-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-text-muted/80 mr-1">Popular:</span>
        {links.stocks.map((item) => (
          <button
            key={item.symbol}
            onClick={() => handleSelect(item.symbol)}
            className="text-xs font-medium px-3.5 py-1.5 bg-bg-surface hover:bg-bg-surface-hover border border-border/40 rounded-lg text-text-secondary hover:text-text-primary active:scale-95 transition-all duration-150 ease-out shadow-sm"
          >
            {item.name}
          </button>
        ))}
        {links.etfs.map((item) => (
          <button
            key={item.symbol}
            onClick={() => handleSelect(item.symbol)}
            className="text-xs font-medium px-3.5 py-1.5 bg-accent-teal/5 hover:bg-accent-teal/10 border border-accent-teal/20 rounded-lg text-accent-teal active:scale-95 transition-all duration-150 ease-out"
          >
            {item.name}
          </button>
        ))}
      </div>

      {/* Floating Modern Suggestion Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <ul className="absolute z-50 w-full left-0 right-0 mt-2 bg-bg-secondary/95 backdrop-blur-md border border-border/80 rounded-xl shadow-xl overflow-hidden max-h-64 overflow-y-auto divide-y divide-border/40 animate-in fade-in slide-in-from-top-2 duration-200">
          {suggestions.map((item) => (
            <li
              key={item.symbol}
              onClick={() => handleSelect(item.symbol)}
              className="px-4 py-3.5 hover:bg-bg-surface-hover/80 cursor-pointer flex items-center justify-between transition-colors duration-150"
            >
              <div className="flex flex-col min-w-0 pr-4">
                <span className="text-text-primary font-semibold text-sm truncate">
                  {item.longname || item.shortname || item.symbol}
                </span>
                <span className="text-xs text-text-muted font-medium mt-0.5 tracking-wide uppercase">
                  {item.exchange || (market === 'sg' ? 'SGX' : 'NASDAQ')}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="font-mono bg-bg-surface border border-border/60 text-accent-teal text-xs px-2.5 py-1 rounded-md font-bold tracking-wider">
                  {item.symbol}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;
