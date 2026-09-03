import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import { getStockList } from '../services/api';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [stockList, setStockList] = useState([]);
  const { market } = useStore();
  const navigate = useNavigate();
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  // Fetch and cache stock list
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
    setSuggestions(filtered.slice(0, 10)); // limit to 10
    setIsOpen(filtered.length > 0);
  }, [query, stockList]);

  // Click outside
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
    navigate(`/?symbol=${encodeURIComponent(symbol)}`);
  };

  const handleQuickClick = (symbol) => {
    setSuggestions([]);
    setIsOpen(false);
    setQuery('');
    if (inputRef.current) inputRef.current.blur();
    navigate(`/?symbol=${encodeURIComponent(symbol)}`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      const exactMatch = suggestions.find(
        (s) => s.symbol.toUpperCase() === query.trim().toUpperCase()
      );
      if (exactMatch) {
        handleSelect(exactMatch.symbol);
      } else {
        // If not in local list, you could optionally fallback to searchStocks API
        setSuggestions([]);
        setIsOpen(false);
        if (inputRef.current) inputRef.current.blur();
        navigate(`/?symbol=${encodeURIComponent(query.trim())}`);
      }
    }
  };

  // Quick links (unchanged, but use market from store)
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
        { symbol: 'SPY', name: 'S&P 500 ETF' },
        { symbol: 'QQQ', name: 'Nasdaq 100 ETF' },
        { symbol: 'VTI', name: 'Total Stock ETF' },
        { symbol: 'BND', name: 'Total Bond ETF' },
      ],
    },
    sg: {
      stocks: [
        { symbol: 'D05.SI', name: 'DBS' },
        { symbol: 'O39.SI', name: 'OCBC' },
        { symbol: 'U11.SI', name: 'UOB' },
        { symbol: 'C6L.SI', name: 'Singapore Airlines' },
      ],
      etfs: [
        { symbol: 'ES3.SI', name: 'STI ETF' },
        { symbol: 'G3B.SI', name: 'Nikko AM STI ETF' },
        { symbol: 'CFA.SI', name: 'Corp Bond ETF' },
      ],
    },
  };

  const links = quickLinks[market] || quickLinks.us;

  return (
    <div ref={wrapperRef} className="relative w-full max-w-xl mx-auto mb-6">
      <form onSubmit={handleSubmit} className="relative">
        <svg
          className="absolute left-3 top-3 w-4 h-4 text-text-muted"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <circle cx="11" cy="11" r="7" strokeWidth="2" />
          <path d="M21 21l-4.3-4.3" strokeWidth="2" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => suggestions.length > 0 && setIsOpen(true)}
          placeholder="Search stocks or ETFs by name or symbol..."
          className="w-full pl-10 pr-4 py-3 bg-bg-surface border border-border rounded-full text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent"
          aria-label="Search stocks or ETFs"
          autoComplete="off"
        />
        {isLoading && (
          <div className="absolute right-4 top-3.5">
            <div className="animate-spin h-4 w-4 border-2 border-accent-blue border-t-transparent rounded-full"></div>
          </div>
        )}
      </form>

      <div className="flex flex-wrap gap-1.5 mt-2 justify-center">
        <span className="text-xs text-text-muted mr-1 self-center">Popular:</span>
        {links.stocks.map((item) => (
          <button
            key={item.symbol}
            onClick={() => handleQuickClick(item.symbol)}
            className="text-xs sm:text-sm px-3 py-1.5 sm:px-4 sm:py-2 min-h-[36px] sm:min-h-[40px] bg-bg-surface border border-border rounded-full hover:bg-bg-surface-hover transition touch-manipulation"
          >
            {item.name}
          </button>
        ))}
        {links.etfs.map((item) => (
          <button
            key={item.symbol}
            onClick={() => handleQuickClick(item.symbol)}
            className="text-xs sm:text-sm px-3 py-1.5 sm:px-4 sm:py-2 min-h-[36px] sm:min-h-[40px] bg-accent-teal/10 border border-accent-teal/20 rounded-full hover:bg-accent-teal/20 transition text-accent-teal touch-manipulation"
          >
            {item.name}
          </button>
        ))}
      </div>

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

export default SearchBar;