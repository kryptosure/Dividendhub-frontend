import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from '../hooks/useDebounce';
import { searchStocks } from '../services/api';
import useStore from '../store/useStore';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const { market, setMarket } = useStore();
  const navigate = useNavigate();
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  // Quick links with display names (short names for buttons)
  const quickLinks = {
    us: {
      stocks: [
        { symbol: 'AAPL', name: 'Apple', fullName: 'Apple Inc.' },
        { symbol: 'MSFT', name: 'Microsoft', fullName: 'Microsoft Corp.' },
        { symbol: 'VZ', name: 'Verizon', fullName: 'Verizon Communications' },
        { symbol: 'JPM', name: 'JPMorgan', fullName: 'JPMorgan Chase' },
        { symbol: 'KO', name: 'Coca-Cola', fullName: 'Coca-Cola Co.' },
      ],
      etfs: [
        { symbol: 'SPY', name: 'S&P 500 ETF', fullName: 'SPDR S&P 500 ETF' },
        { symbol: 'QQQ', name: 'Nasdaq 100 ETF', fullName: 'Invesco QQQ Trust' },
        { symbol: 'VTI', name: 'Total Stock ETF', fullName: 'Vanguard Total Stock Market ETF' },
        { symbol: 'BND', name: 'Total Bond ETF', fullName: 'Vanguard Total Bond Market ETF' },
      ],
    },
    sg: {
      stocks: [
        { symbol: 'D05.SI', name: 'DBS', fullName: 'DBS Group Holdings' },
        { symbol: 'O39.SI', name: 'OCBC', fullName: 'OCBC Bank' },
        { symbol: 'U11.SI', name: 'UOB', fullName: 'United Overseas Bank' },
        { symbol: 'C6L.SI', name: 'Singapore Airlines', fullName: 'Singapore Airlines' },
      ],
      etfs: [
        { symbol: 'ES3.SI', name: 'STI ETF', fullName: 'SPDR Straits Times Index ETF' },
        { symbol: 'G3B.SI', name: 'Nikko AM STI ETF', fullName: 'Nikko AM Singapore STI ETF' },
        { symbol: 'CFA.SI', name: 'Corp Bond ETF', fullName: 'Nikko AM SGD Investment Grade Corp Bond ETF' },
      ],
    },
  };

  // Fetch suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedQuery.length < 2) {
        setSuggestions([]);
        setIsOpen(false);
        return;
      }
      setIsLoading(true);
      try {
        const results = await searchStocks(debouncedQuery, market);
        setSuggestions(results);
        setIsOpen(results.length > 0);
      } catch (error) {
        console.error('Search error:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSuggestions();
  }, [debouncedQuery, market]);

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
        setSuggestions([]);
        setIsOpen(false);
        if (inputRef.current) inputRef.current.blur();
        navigate(`/?symbol=${encodeURIComponent(query.trim())}`);
      }
    }
  };

  const links = quickLinks[market] || quickLinks.us;

  return (
    <div ref={wrapperRef} className="relative w-full max-w-xl mx-auto mb-6">
      {/* Market Toggle */}
      <div className="flex justify-center gap-3 mb-4">
        <button
          onClick={() => setMarket('us')}
          className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${
            market === 'us'
              ? 'bg-accent-blue text-white'
              : 'bg-bg-surface text-text-muted hover:text-text-primary'
          }`}
        >
          🇺🇸 US Stocks
        </button>
        <button
          onClick={() => setMarket('sg')}
          className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${
            market === 'sg'
              ? 'bg-accent-blue text-white'
              : 'bg-bg-surface text-text-muted hover:text-text-primary'
          }`}
        >
          🇸🇬 SGX Stocks
        </button>
      </div>

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

      {/* Quick Links */}
      <div className="flex flex-wrap gap-1.5 mt-2 justify-center">
        <span className="text-xs text-text-muted mr-1 self-center">Popular:</span>
        {links.stocks.map((item) => (
          <button
            key={item.symbol}
            onClick={() => handleQuickClick(item.symbol)}
            title={`${item.fullName} (${item.symbol})`}
            className="text-xs sm:text-sm px-3 py-1.5 sm:px-4 sm:py-2 min-h-[36px] sm:min-h-[40px] bg-bg-surface border border-border rounded-full hover:bg-bg-surface-hover transition touch-manipulation"
          >
            {item.name}
          </button>
        ))}
        {links.etfs.map((item) => (
          <button
            key={item.symbol}
            onClick={() => handleQuickClick(item.symbol)}
            title={`${item.fullName} (${item.symbol})`}
            className="text-xs sm:text-sm px-3 py-1.5 sm:px-4 sm:py-2 min-h-[36px] sm:min-h-[40px] bg-accent-teal/10 border border-accent-teal/20 rounded-full hover:bg-accent-teal/20 transition text-accent-teal touch-manipulation"
          >
            {item.name}
          </button>
        ))}
      </div>

      {/* Suggestions Dropdown */}
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
                  {item.longname || item.shortname || item.symbol}
                </span>
                <span className="font-mono text-accent-teal text-sm ml-2 flex-shrink-0">
                  {item.symbol}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-text-muted mt-0.5">
                <span>{item.exchange || (market === 'sg' ? 'SGX' : 'NASDAQ')}</span>
                {item.longname && item.shortname && item.longname !== item.shortname && (
                  <span className="text-text-muted/60">{item.shortname}</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;