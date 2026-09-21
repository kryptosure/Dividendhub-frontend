import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import useStore from '../store/useStore';
import { getUpcomingDividends, searchStocks } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const SAFETY_OPTIONS = [
  { key: 'all',         label: 'All' },
  { key: 'recommended', label: 'Safe+Mod' },
  { key: 'safe',        label: 'Safe' },
  { key: 'moderate',    label: 'Moderate' },
  { key: 'caution',     label: 'Caution' },
];

const WINDOW_OPTIONS = [30, 60, 90];

const DividendCalendar = () => {
  const { market, currency, portfolio, watchlist } = useStore();
  const [days, setDays] = useState(30);
  const [safetyFilter, setSafetyFilter] = useState('recommended');
  const [sectionFilter, setSectionFilter] = useState('all');

  // ---------- Search state ----------
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSymbol, setSelectedSymbol] = useState(null);  // set when user picks from autocomplete
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const searchWrapperRef = useRef(null);

  const curSymbol = currency === 'sgd' ? 'S$' : currency === 'cad' ? 'C$' : '$';
  const marketLabel = market === 'sg' ? 'SGX' : market === 'ca' ? 'TSX' : 'US';

  const { data, isLoading, error } = useQuery({
    queryKey: ['upcoming-dividends', market, days],
    queryFn: () => getUpcomingDividends(market, days),
    staleTime: 30 * 60 * 1000,
  });

  const events = data?.events || [];

  // ---------- Portfolio / Watchlist symbol sets ----------
  const portfolioSymbols = useMemo(
    () => new Set((portfolio || []).map((p) => String(p.symbol).toUpperCase())),
    [portfolio]
  );
  const watchlistSymbols = useMemo(
    () => new Set((watchlist || []).map((w) => String(w.symbol).toUpperCase())),
    [watchlist]
  );

  // ---------- Close autocomplete on outside click ----------
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ---------- Debounced search against /api/stocks/search ----------
  // This handles both ticker AND company name lookups because the backend
  // uses Yahoo search + DB fallback + curated FALLBACK_MAP.
  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 2 || selectedSymbol) {
      setSuggestions([]);
      return;
    }
    setIsSearching(true);
    const t = setTimeout(async () => {
      try {
        const res = await searchStocks(q, market);
        setSuggestions(Array.isArray(res) ? res.slice(0, 8) : []);
      } catch (e) {
        console.warn('Calendar autocomplete failed:', e.message);
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [searchQuery, market, selectedSymbol]);

  // ---------- Apply all filters ----------
  const filtered = useMemo(() => {
    let result = events;

    // Safety
    if (safetyFilter === 'recommended') {
      result = result.filter((e) => e.safetyScore === 'Safe' || e.safetyScore === 'Moderate');
    } else if (safetyFilter === 'safe') {
      result = result.filter((e) => e.safetyScore === 'Safe');
    } else if (safetyFilter === 'moderate') {
      result = result.filter((e) => e.safetyScore === 'Moderate');
    } else if (safetyFilter === 'caution') {
      result = result.filter((e) => e.safetyScore === 'Caution');
    }

    // Section
    if (sectionFilter === 'portfolio') {
      result = result.filter((e) => portfolioSymbols.has(e.symbol.toUpperCase()));
    } else if (sectionFilter === 'watchlist') {
      result = result.filter((e) => watchlistSymbols.has(e.symbol.toUpperCase()));
    }

    // Search: prefer selected symbol, fall back to substring match
    if (selectedSymbol) {
      result = result.filter((e) => e.symbol.toUpperCase() === selectedSymbol.toUpperCase());
    } else {
      const q = searchQuery.trim().toLowerCase();
      if (q.length >= 2) {
        result = result.filter((e) =>
          e.symbol.toLowerCase().includes(q) ||
          (e.name || '').toLowerCase().includes(q)
        );
      }
    }

    return result;
  }, [events, safetyFilter, sectionFilter, selectedSymbol, searchQuery, portfolioSymbols, watchlistSymbols]);

  // ---------- Group by month → date ----------
  const grouped = useMemo(() => {
    const map = {};
    for (const e of filtered) {
      const month = e.exDate.slice(0, 7);
      if (!map[month]) map[month] = [];
      map[month].push(e);
    }
    return map;
  }, [filtered]);

  const groupByDate = (list) => {
    const map = {};
    for (const e of list) {
      if (!map[e.exDate]) map[e.exDate] = [];
      map[e.exDate].push(e);
    }
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  };

  const fmtDate = (iso) => {
    const d = new Date(iso + 'T00:00:00Z');
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' });
  };

  const fmtMonth = (ym) => {
    const [y, m] = ym.split('-');
    const d = new Date(Date.UTC(parseInt(y), parseInt(m) - 1, 1));
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
  };

  const anyFilterActive =
    safetyFilter !== 'recommended' ||
    sectionFilter !== 'all' ||
    searchQuery.trim().length > 0 ||
    !!selectedSymbol;

  const resetFilters = () => {
    setSafetyFilter('recommended');
    setSectionFilter('all');
    setSearchQuery('');
    setSelectedSymbol(null);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleSelectSuggestion = (stock) => {
    setSelectedSymbol(stock.symbol);
    setSearchQuery(stock.longname || stock.shortname || stock.symbol);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSelectedSymbol(null);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  // Are we searching a stock that isn't in the current calendar window?
  const searchMissedWindow =
    selectedSymbol &&
    filtered.length === 0 &&
    events.length > 0 &&
    !events.some((e) => e.symbol.toUpperCase() === selectedSymbol.toUpperCase());

  return (
    <>
      <Helmet>
        <title>{marketLabel} Dividend Calendar — Upcoming Ex-Dividend Dates | DividendBro</title>
        <meta name="description" content={`Upcoming dividend payout dates for ${marketLabel} stocks over the next ${days} days. Filter by safety, portfolio, watchlist, or search a specific ticker.`} />
        <link rel="canonical" href="https://dividendbro.com/calendar" />
      </Helmet>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* ---------- Header ---------- */}
        <div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-text-primary">
            Dividend <span className="bg-gradient-to-r from-accent-blue to-accent-teal bg-clip-text text-transparent">Calendar</span>
          </h1>
          <p className="text-text-muted text-sm mt-2 max-w-3xl">
            Upcoming ex-dividend dates for <strong className="text-text-secondary">{marketLabel}</strong> stocks.
            Switch market in the header to see US, Canada, or SGX.
          </p>
        </div>

        {/* ---------- Info banner ---------- */}
        <div className="bg-amber-500/10 border border-amber-400/30 rounded-2xl p-4">
          <p className="text-[11px] text-amber-300 font-bold uppercase tracking-wider mb-1">
            Estimated dates — verify before trading
          </p>
          <p className="text-[11px] text-text-secondary leading-relaxed">
            These dates are projected from each stock's historical payout pattern (median gap between the last 8 payouts).
            Actual ex-dividend dates are confirmed by the company typically 2–4 weeks in advance.
          </p>
        </div>

        {/* ---------- Filter panel ---------- */}
        <div className="bg-bg-surface border border-border/50 rounded-2xl p-4 space-y-3">
          {/* Search with autocomplete */}
          <div ref={searchWrapperRef} className="relative">
            <label htmlFor="calendar-search" className="sr-only">Search stocks in the calendar</label>
            <div className="relative">
              <svg
                className="absolute left-3 top-2.5 w-4 h-4 text-text-muted pointer-events-none"
                fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" strokeWidth="2.5" />
                <path d="M21 21l-4.3-4.3" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
              <input
                id="calendar-search"
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setSelectedSymbol(null); setShowSuggestions(true); }}
                onFocus={() => { if (searchQuery.trim()) setShowSuggestions(true); }}
                placeholder="Search a ticker or company name (e.g. Apple, JNJ, Royal Bank)…"
                autoComplete="off"
                className="w-full pl-9 pr-9 py-2 bg-bg-primary border border-border/50 rounded-xl text-sm text-text-primary placeholder-text-muted/60 focus:outline-none focus:border-accent transition-colors"
              />
              {isSearching && (
                <div className="absolute right-3 top-2.5" aria-hidden="true">
                  <div className="animate-spin h-4 w-4 border-2 border-accent border-t-transparent rounded-full"></div>
                </div>
              )}
              {!isSearching && searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  aria-label="Clear search"
                  className="absolute right-3 top-2 text-text-muted hover:text-text-primary transition-colors"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Autocomplete dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <ul className="search-dropdown-50 mt-2 max-h-64 overflow-y-auto divide-y divide-border/40">
                {suggestions.map((s) => (
                  <li
                    key={s.symbol}
                    onClick={() => handleSelectSuggestion(s)}
                    className="px-3 py-2.5 cursor-pointer flex items-center justify-between gap-3 hover:bg-bg-surface-hover transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-text-primary truncate">
                        {s.longname || s.shortname || s.symbol}
                      </p>
                      <p className="text-[10px] text-text-muted font-mono uppercase tracking-wider mt-0.5">
                        {s.symbol}
                      </p>
                    </div>
                    <span className="font-mono bg-bg-surface border border-border/60 text-accent-teal text-[10px] px-2 py-1 rounded-md font-bold tracking-wider flex-shrink-0">
                      {s.symbol}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            {showSuggestions && !isSearching && searchQuery.trim().length >= 2 && suggestions.length === 0 && (
              <div className="search-dropdown-50 mt-2 px-3 py-3 text-center">
                <p className="text-[11px] text-text-muted">No matches. Try a different name or ticker.</p>
              </div>
            )}
          </div>

          {/* Active search chip */}
          {selectedSymbol && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Filtering:</span>
              <button
                onClick={clearSearch}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-accent-teal/10 border border-accent-teal/30 text-accent-teal text-[11px] font-bold hover:bg-accent-teal/20 transition-colors"
              >
                {selectedSymbol}
                <span aria-hidden="true">✕</span>
              </button>
            </div>
          )}

          {/* Filter rows */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            {/* Safety */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Safety:</span>
              {SAFETY_OPTIONS.map((opt) => {
                const active = safetyFilter === opt.key;
                return (
                  <button
                    key={opt.key}
                    onClick={() => setSafetyFilter(opt.key)}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-all ${
                      active
                        ? 'bg-accent text-white border-accent glow-accent'
                        : 'bg-bg-primary border-border/50 text-text-secondary hover:border-accent/40'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>

            {/* Section */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Show:</span>
              <button
                onClick={() => setSectionFilter('all')}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-all ${
                  sectionFilter === 'all'
                    ? 'bg-accent-teal text-white border-accent-teal'
                    : 'bg-bg-primary border-border/50 text-text-secondary hover:border-accent-teal/40'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSectionFilter('portfolio')}
                disabled={portfolioSymbols.size === 0}
                title={portfolioSymbols.size === 0 ? 'Add stocks to your portfolio first' : ''}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                  sectionFilter === 'portfolio'
                    ? 'bg-accent-teal text-white border-accent-teal'
                    : 'bg-bg-primary border-border/50 text-text-secondary hover:border-accent-teal/40'
                }`}
              >
                Portfolio {portfolioSymbols.size > 0 && `(${portfolioSymbols.size})`}
              </button>
              <button
                onClick={() => setSectionFilter('watchlist')}
                disabled={watchlistSymbols.size === 0}
                title={watchlistSymbols.size === 0 ? 'Add stocks to your watchlist first' : ''}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                  sectionFilter === 'watchlist'
                    ? 'bg-accent-teal text-white border-accent-teal'
                    : 'bg-bg-primary border-border/50 text-text-secondary hover:border-accent-teal/40'
                }`}
              >
                Watchlist {watchlistSymbols.size > 0 && `(${watchlistSymbols.size})`}
              </button>
            </div>

            {/* Window */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Window:</span>
              {WINDOW_OPTIONS.map((d) => {
                const active = days === d;
                return (
                  <button
                    key={d}
                    onClick={() => setDays(d)}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-all ${
                      active
                        ? 'bg-accent-blue text-white border-accent-blue'
                        : 'bg-bg-primary border-border/50 text-text-secondary hover:border-accent-blue/40'
                    }`}
                  >
                    {d}d
                  </button>
                );
              })}
            </div>

            {anyFilterActive && (
              <button
                onClick={resetFilters}
                className="text-[10px] font-bold text-accent-blue hover:underline ml-auto"
              >
                Reset filters
              </button>
            )}
          </div>
        </div>

        {/* ---------- Summary strip ---------- */}
        {!isLoading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-3 gap-3 bg-bg-surface border border-border/50 rounded-2xl p-4">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-text-muted font-bold">Events</p>
              <p className="text-2xl font-black text-text-primary font-mono mt-1">{filtered.length}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-text-muted font-bold">Unique Stocks</p>
              <p className="text-2xl font-black text-accent-teal font-mono mt-1">
                {new Set(filtered.map((e) => e.symbol)).size}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-text-muted font-bold">Window</p>
              <p className="text-2xl font-black text-accent-blue font-mono mt-1">{days}d</p>
            </div>
          </div>
        )}

        {isLoading && <div className="py-16"><LoadingSpinner /></div>}

        {error && (
          <div className="bg-accent-red/5 border border-accent-red/20 rounded-2xl p-5 text-center">
            <p className="text-sm font-bold text-accent-red">Could not load calendar. Try again.</p>
          </div>
        )}

        {/* No events at all */}
        {!isLoading && !error && events.length === 0 && (
          <div className="bg-bg-surface border border-dashed border-border/40 rounded-2xl p-12 text-center">
            <p className="text-sm font-bold text-text-primary">No upcoming dividends in this window</p>
            <p className="text-xs text-text-muted mt-1">Try a wider window or switch market in the header.</p>
          </div>
        )}

        {/* Searched stock has no event in the current window */}
        {!isLoading && !error && searchMissedWindow && (
          <div className="bg-bg-surface border border-dashed border-border/40 rounded-2xl p-12 text-center">
            <p className="text-sm font-bold text-text-primary">
              {selectedSymbol} has no estimated dividends in the next {days} days
            </p>
            <p className="text-xs text-text-muted mt-1">
              Try a wider window, or check the stock's detail page for its full payout history.
            </p>
            <div className="flex justify-center gap-3 mt-4">
              <button
                onClick={() => setDays(90)}
                className="px-4 py-2 text-xs font-bold rounded-lg bg-accent text-white glow-accent hover:bg-accent-hover transition-all"
              >
                Switch to 90 days
              </button>
              <Link
                to={`/search?symbol=${selectedSymbol}`}
                className="px-4 py-2 text-xs font-bold rounded-lg bg-bg-primary border border-border/50 text-text-secondary hover:border-accent/40 transition-all"
              >
                View {selectedSymbol} details
              </Link>
            </div>
          </div>
        )}

        {/* Events exist but filters exclude all (not the missed-window case) */}
        {!isLoading && !error && events.length > 0 && filtered.length === 0 && !searchMissedWindow && (
          <div className="bg-bg-surface border border-dashed border-border/40 rounded-2xl p-12 text-center">
            <p className="text-sm font-bold text-text-primary">No matches for your filters</p>
            <p className="text-xs text-text-muted mt-1">Try relaxing a filter or searching a different ticker.</p>
            <button
              onClick={resetFilters}
              className="mt-4 px-4 py-2 text-xs font-bold rounded-lg bg-accent text-white glow-accent hover:bg-accent-hover transition-all"
            >
              Reset filters
            </button>
          </div>
        )}

        {/* ---------- Calendar groups ---------- */}
        {!isLoading && !error && Object.keys(grouped).sort().map((month) => (
          <div key={month} className="space-y-3">
            <h2 className="text-xl font-black tracking-tight text-text-primary">
              {fmtMonth(month)}
              <span className="text-text-muted text-sm font-normal ml-2">
                ({grouped[month].length} {grouped[month].length === 1 ? 'event' : 'events'})
              </span>
            </h2>

            <div className="bg-bg-surface border border-border/50 rounded-2xl overflow-hidden shadow-sm">
              {groupByDate(grouped[month]).map(([date, list], idx) => (
                <div key={date} className={idx > 0 ? 'border-t border-border/40' : ''}>
                  <div className="px-4 py-2.5 bg-bg-primary/50 flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-accent-blue tracking-wider">
                      {fmtDate(date)}
                    </span>
                    <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">
                      {list.length} {list.length === 1 ? 'stock' : 'stocks'}
                    </span>
                  </div>

                  <div className="divide-y divide-border/20">
                    {list.map((e, i) => (
                      <Link
                        key={`${e.symbol}-${i}`}
                        to={`/search?symbol=${e.symbol}`}
                        className="flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-bg-surface-hover transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono font-bold text-accent-teal text-xs">{e.symbol}</span>
                            <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border bg-bg-primary border-border/40 text-text-muted">
                              {e.frequency}
                            </span>
                            {e.safetyScore === 'Safe' && (
                              <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border bg-accent-green/10 border-accent-green/20 text-accent-green">
                                Safe
                              </span>
                            )}
                            {e.safetyScore === 'Caution' && (
                              <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border bg-accent-red/10 border-accent-red/20 text-accent-red">
                                Caution
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-text-primary truncate mt-0.5">{e.name}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-mono font-bold text-text-primary text-xs">
                            {curSymbol}{e.estimatedAmount.toFixed(2)}
                          </p>
                          <p className="text-[10px] text-text-muted">est. /share</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {!isLoading && filtered.length > 0 && (
          <p className="text-[10px] text-text-muted text-center leading-relaxed max-w-2xl mx-auto pt-4">
            Ex-dividend dates are estimated using the median gap between the stock's last 8 payouts.
            Actual dates are typically confirmed 2–4 weeks in advance by the issuer.
            Payment dates usually follow 2–4 weeks after ex-dates. Educational only, not investment advice.
          </p>
        )}
      </div>
    </>
  );
};

export default DividendCalendar;