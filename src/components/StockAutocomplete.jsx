import React, { useState, useEffect, useRef } from 'react';
import { searchStocks } from '../services/api';

const StockAutocomplete = ({
  value,
  onChange,
  onSelect,
  market = 'us',
  placeholder = 'Search stock name or ticker...',
}) => {
  const [query, setQuery] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  // ✅ Flag to skip the search right after a programmatic value change
  const skipNextSearchRef = useRef(false);

  // Sync external value when it changes from OUTSIDE (leaderboard click, etc.)
  useEffect(() => {
    if (value !== undefined && value !== query) {
      skipNextSearchRef.current = true;
      setQuery(value || '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // ✅ Debounced search — depends ONLY on query and market (not value)
  useEffect(() => {
    // Skip if the query change came from a selection
    if (skipNextSearchRef.current) {
      skipNextSearchRef.current = false;
      return;
    }

    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await searchStocks(trimmed, market);
        if (Array.isArray(res)) {
          setSuggestions(res.slice(0, 8));
          setIsOpen(res.length > 0);
          setHighlightIdx(-1);
        }
      } catch (err) {
        console.error('Autocomplete search failed:', err);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query, market]);

  // Click outside → close
  useEffect(() => {
    const handleClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSelect = (item) => {
    const symbol = String(item.symbol || '').toUpperCase();
    // ✅ Set flag BEFORE updating query to prevent re-search
    skipNextSearchRef.current = true;
    setQuery(item.symbol);
    setSuggestions([]);
    setIsOpen(false);
    setHighlightIdx(-1);
    if (inputRef.current) inputRef.current.blur();
    if (onSelect) onSelect({ symbol, name: item.longname || item.shortname || symbol });
    else if (onChange) onChange(symbol);
  };

  const handleKeyDown = (e) => {
    if (!isOpen || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIdx((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIdx((prev) => (prev - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === 'Enter' && highlightIdx >= 0) {
      e.preventDefault();
      handleSelect(suggestions[highlightIdx]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (onChange) onChange(e.target.value);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          className="w-full bg-bg-primary border border-border/60 rounded-xl px-4 py-2.5 text-sm font-medium text-text-primary placeholder-text-muted/50 focus:outline-none focus:border-accent-blue focus:ring-4 focus:ring-accent-blue/5 transition-all"
          autoComplete="off"
        />
        {isLoading && (
          <div className="absolute right-3 top-3">
            <div className="animate-spin h-4 w-4 border-2 border-accent-blue border-t-transparent rounded-full" />
          </div>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <ul className="absolute z-50 left-0 right-0 mt-2 bg-bg-secondary border border-border/60 rounded-xl shadow-xl overflow-hidden max-h-72 overflow-y-auto">
          {suggestions.map((item, idx) => (
            <li
              key={item.symbol}
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(item);
              }}
              onMouseEnter={() => setHighlightIdx(idx)}
              className={`px-4 py-2.5 cursor-pointer flex items-center justify-between gap-3 transition-colors ${
                highlightIdx === idx ? 'bg-bg-surface-hover' : 'hover:bg-bg-surface-hover/60'
              }`}
            >
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold text-text-primary truncate">
                  {item.longname || item.shortname || item.symbol}
                </span>
                <span className="text-[10px] text-text-muted font-medium mt-0.5 tracking-wide uppercase">
                  {item.exchange || (market === 'sg' ? 'SGX' : 'NASDAQ')}
                </span>
              </div>
              <span className="font-mono bg-bg-primary border border-border/60 text-accent-teal text-xs px-2.5 py-1 rounded-md font-bold tracking-wider flex-shrink-0">
                {item.symbol}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default StockAutocomplete;