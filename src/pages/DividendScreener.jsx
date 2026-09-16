import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getScreenerStocks } from '../services/api';
import { track } from '../services/tracker';
import LoadingSpinner from '../components/LoadingSpinner';

const FREQ_TABS = [
  { key: 'all', label: 'All' },
  { key: 'daily', label: 'Daily' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'bi-weekly', label: 'Bi-Weekly' },
  { key: 'monthly', label: 'Monthly' },
  { key: 'quarterly', label: 'Quarterly' },
  { key: 'semi-annual', label: 'Semi-Annual' },
  { key: 'annual', label: 'Annual' },
];

const ASSET_TABS = [
  { key: 'all', label: 'All' },
  { key: 'stock', label: 'Stocks' },
  { key: 'reit', label: 'REITs' },
  { key: 'etf', label: 'ETFs' },
  { key: 'bond-etf', label: 'Bond ETFs' },
];

const SAFETY_TABS = [
  { key: 'all', label: 'Any' },
  { key: 'safe', label: 'Safe' },
  { key: 'moderate', label: 'Moderate' },
  { key: 'caution', label: 'Caution' },
];

const SORT_OPTIONS = [
  { key: 'yield-desc', label: 'Highest Yield' },
  { key: 'yield-asc', label: 'Lowest Yield' },
  { key: 'frequency-asc', label: 'Most Frequent Payout' },
  { key: 'streak-desc', label: 'Longest Streak' },
  { key: 'cagr-desc', label: 'Highest Dividend Growth' },
  { key: 'safety-asc', label: 'Safest First' },
  { key: 'name-asc', label: 'Name (A–Z)' },
  { key: 'symbol-asc', label: 'Ticker (A–Z)' },
];

const ASSET_BADGE = {
  'Stock': 'bg-accent-blue/10 border-accent-blue/25 text-accent-blue',
  'REIT': 'bg-accent-purple/10 border-accent-purple/25 text-accent-purple',
  'ETF': 'bg-accent-teal/10 border-accent-teal/25 text-accent-teal',
  'Bond ETF': 'bg-accent-yellow/10 border-accent-yellow/25 text-accent-yellow',
};

const FREQ_BADGE = {
  'Daily': 'bg-accent-green/15 border-accent-green/30 text-accent-green',
  'Weekly': 'bg-accent-green/10 border-accent-green/25 text-accent-green',
  'Bi-Weekly': 'bg-accent-teal/10 border-accent-teal/25 text-accent-teal',
  'Monthly': 'bg-accent-teal/10 border-accent-teal/25 text-accent-teal',
  'Quarterly': 'bg-bg-primary border-border/40 text-text-secondary',
  'Semi-Annual': 'bg-bg-primary border-border/40 text-text-secondary',
  'Annual': 'bg-bg-primary border-border/40 text-text-muted',
};

const DividendScreener = () => {
  const [market, setMarket] = useState('both');
  const [frequency, setFrequency] = useState('all');
  const [assetType, setAssetType] = useState('all');
  const [safety, setSafety] = useState('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('yield-desc');
  const [page, setPage] = useState(0);
  const pageSize = 100;

  const queryParams = useMemo(() => ({
    market,
    frequency,
    assetType,
    safety,
    search: search.trim(),
    sort,
    limit: pageSize,
    offset: page * pageSize,
  }), [market, frequency, assetType, safety, search, sort, page]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['screener', queryParams],
    queryFn: () => getScreenerStocks(queryParams),
    staleTime: 5 * 60 * 1000,
    keepPreviousData: true,
  });

  // Reset page when any filter changes
  const handleFilterChange = (setter) => (value) => {
    track('screener_filter', { field: setter.name, value });
    setter(value);
    setPage(0);
  };

  const stocks = data?.stocks || [];
  const freqCounts = data?.frequencyCounts || {};
  const assetCounts = data?.assetTypeCounts || {};
  const total = data?.total || 0;

  const fmt = (n) => (n == null || isNaN(n) ? '—' : Number(n).toFixed(2));

  const renderFrequencyTab = (tab) => {
    const count = freqCounts[tab.key] ?? 0;
    const active = frequency === tab.key;
    return (
      <button
        key={tab.key}
        onClick={() => handleFilterChange(setFrequency)(tab.key)}
        className={`flex-shrink-0 px-3.5 py-2 rounded-lg text-xs font-bold border transition-all whitespace-nowrap ${
          active
            ? 'bg-accent-blue text-white border-accent-blue'
            : 'bg-bg-surface border-border/50 text-text-secondary hover:border-accent-blue/40'
        }`}
      >
        {tab.label}
        <span className={`ml-1.5 text-[10px] font-black ${active ? 'text-white/80' : 'text-text-muted'}`}>
          {count}
        </span>
      </button>
    );
  };

  return (
    <>
      <Helmet>
        <title>Dividend Stock Screener – Filter by Payout Frequency | DividendBro</title>
        <meta name="description" content="Browse every dividend-paying stock and ETF by payout frequency — daily, weekly, monthly, quarterly, semi-annual, or annual. US and SGX markets." />
        <link rel="canonical" href="https://dividendbro.com/screener" />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-5">

        {/* Header */}
        <div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-text-primary">
            Dividend <span className="bg-gradient-to-r from-accent-blue to-accent-teal bg-clip-text text-transparent">Screener</span>
          </h1>
          <p className="text-text-muted text-sm mt-2 max-w-3xl">
            Every dividend-paying stock, REIT, and ETF — filtered by how often they pay you.
          </p>
        </div>

        {/* Filter panel */}
        <div className="bg-bg-surface border border-border/50 rounded-2xl p-4 shadow-sm space-y-4">

          {/* Row 1 — Market + Search + Sort */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">

            {/* Market */}
            <div className="md:col-span-4">
              <label className="block text-[10px] uppercase text-text-muted font-bold tracking-widest mb-1.5">Market</label>
              <div className="flex bg-bg-primary border border-border/50 rounded-xl p-1">
                {[
                  { key: 'both', label: 'Both' },
                  { key: 'us', label: 'US' },
                  { key: 'sg', label: 'SGX' },
                ].map((m) => (
                  <button
                    key={m.key}
                    onClick={() => handleFilterChange(setMarket)(m.key)}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                      market === m.key ? 'bg-accent-blue text-white shadow-sm' : 'text-text-muted hover:text-text-primary'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Search */}
            <div className="md:col-span-5">
              <label className="block text-[10px] uppercase text-text-muted font-bold tracking-widest mb-1.5">Search</label>
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                placeholder="Ticker or company name..."
                className="w-full bg-bg-primary border border-border/50 rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder-text-muted/50 focus:outline-none focus:border-accent-blue"
              />
            </div>

            {/* Sort */}
            <div className="md:col-span-3">
              <label className="block text-[10px] uppercase text-text-muted font-bold tracking-widest mb-1.5">Sort By</label>
              <select
                value={sort}
                onChange={(e) => { setSort(e.target.value); setPage(0); }}
                className="w-full bg-bg-primary border border-border/50 rounded-xl px-3 py-2.5 text-sm font-medium text-text-primary focus:outline-none focus:border-accent-blue"
              >
                {SORT_OPTIONS.map((s) => (
                  <option key={s.key} value={s.key}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2 — Frequency tabs */}
          <div>
            <label className="block text-[10px] uppercase text-text-muted font-bold tracking-widest mb-1.5">
              Payout Frequency
            </label>
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
              {FREQ_TABS.map(renderFrequencyTab)}
            </div>
          </div>

          {/* Row 3 — Asset type + Safety */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

            <div>
              <label className="block text-[10px] uppercase text-text-muted font-bold tracking-widest mb-1.5">Asset Type</label>
              <div className="flex flex-wrap gap-1.5">
                {ASSET_TABS.map((tab) => {
                  const count = assetCounts[tab.key] ?? 0;
                  const active = assetType === tab.key;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => handleFilterChange(setAssetType)(tab.key)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                        active
                          ? 'bg-accent-teal text-white border-accent-teal'
                          : 'bg-bg-surface border-border/50 text-text-secondary hover:border-accent-teal/40'
                      }`}
                    >
                      {tab.label}
                      <span className={`ml-1.5 text-[10px] font-black ${active ? 'text-white/80' : 'text-text-muted'}`}>{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase text-text-muted font-bold tracking-widest mb-1.5">Risk Level</label>
              <div className="flex flex-wrap gap-1.5">
                {SAFETY_TABS.map((tab) => {
                  const active = safety === tab.key;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => handleFilterChange(setSafety)(tab.key)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                        active
                          ? 'bg-accent-purple text-white border-accent-purple'
                          : 'bg-bg-surface border-border/50 text-text-secondary hover:border-accent-purple/40'
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between flex-wrap gap-2 text-xs text-text-muted">
          <span>
            Showing <span className="font-bold text-text-primary">{stocks.length}</span> of{' '}
            <span className="font-bold text-text-primary">{total}</span> matching stocks
          </span>
          {search && (
            <button
              onClick={() => { setSearch(''); setPage(0); }}
              className="text-accent-blue font-bold hover:underline"
            >
              Clear search
            </button>
          )}
        </div>

        {/* Loading */}
        {isLoading && !data && <div className="py-16"><LoadingSpinner /></div>}

        {/* Error */}
        {error && (
          <div className="bg-accent-red/5 border border-accent-red/20 rounded-2xl p-5 text-center">
            <p className="text-sm font-bold text-accent-red">Could not load screener. Try again.</p>
          </div>
        )}

        {/* Empty */}
        {!isLoading && !error && stocks.length === 0 && (
          <div className="bg-bg-surface border border-dashed border-border/40 rounded-2xl p-12 text-center">
            <p className="text-sm font-bold text-text-primary">No stocks match your filters</p>
            <p className="text-xs text-text-muted mt-1">Try a different frequency, market, or asset type.</p>
          </div>
        )}

        {/* ===== Results — Mobile cards ===== */}
        {stocks.length > 0 && (
          <div className="md:hidden space-y-2">
            {stocks.map((s) => (
              <Link
                key={s.symbol}
                to={`/search?symbol=${s.symbol}`}
                className="block bg-bg-surface border border-border/50 rounded-2xl p-3 hover:border-accent-blue/40 active:scale-[0.99] transition-all"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-sm text-text-primary truncate">{s.name}</p>
                    <p className="font-mono text-[10px] text-accent-teal font-bold tracking-wider mt-0.5">{s.symbol}</p>
                  </div>
                  <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border flex-shrink-0 ${ASSET_BADGE[s.assetType] || ''}`}>
                    {s.assetType}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center mt-2 pt-2 border-t border-border/20">
                  <div>
                    <p className="text-[9px] uppercase text-text-muted font-bold tracking-wider">Yield</p>
                    <p className="text-sm font-black text-accent-green mt-0.5">{fmt(s.currentYield)}%</p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase text-text-muted font-bold tracking-wider">Pay</p>
                    <p className="text-[10px] font-black text-text-primary mt-1">{s.frequency}</p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase text-text-muted font-bold tracking-wider">Streak</p>
                    <p className="text-sm font-black text-accent-yellow mt-0.5">{s.dividendStreak || '—'}</p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase text-text-muted font-bold tracking-wider">Risk</p>
                    <p className={`text-[10px] font-black mt-1 ${
                      s.safetyScore === 'Safe' ? 'text-accent-green' :
                      s.safetyScore === 'Moderate' ? 'text-accent-yellow' : 'text-accent-red'
                    }`}>{s.safetyScore}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* ===== Results — Desktop table ===== */}
        {stocks.length > 0 && (
          <div className="hidden md:block bg-bg-surface border border-border/50 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-bg-primary/50 text-text-muted uppercase font-bold tracking-wider text-[10px]">
                  <tr>
                    <th className="px-4 py-3 text-left">Ticker</th>
                    <th className="px-4 py-3 text-left">Company</th>
                    <th className="px-4 py-3 text-center">Market</th>
                    <th className="px-4 py-3 text-center">Asset</th>
                    <th className="px-4 py-3 text-center">Payout</th>
                    <th className="px-4 py-3 text-right">Price</th>
                    <th className="px-4 py-3 text-right">Yield</th>
                    <th className="px-4 py-3 text-right">Payout Ratio</th>
                    <th className="px-4 py-3 text-right">Div CAGR</th>
                    <th className="px-4 py-3 text-right">Streak</th>
                    <th className="px-4 py-3 text-center">Risk</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/10">
                  {stocks.map((s) => (
                    <tr key={s.symbol} className="hover:bg-bg-primary/30 transition-colors">
                      <td className="px-4 py-2.5">
                        <Link to={`/search?symbol=${s.symbol}`} className="font-mono font-bold text-accent-teal hover:underline">
                          {s.symbol}
                        </Link>
                      </td>
                      <td className="px-4 py-2.5 text-text-primary truncate max-w-[200px]">{s.name}</td>
                      <td className="px-4 py-2.5 text-center">
                        <span className="text-[10px] font-bold uppercase text-text-muted tracking-wider">
                          {s.market === 'sg' ? 'SGX' : 'US'}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border ${ASSET_BADGE[s.assetType] || ''}`}>
                          {s.assetType}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border ${FREQ_BADGE[s.frequency] || 'bg-bg-primary border-border/40 text-text-muted'}`}>
                          {s.frequency}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono text-text-secondary text-xs">
                        {s.currentPrice ? `$${fmt(s.currentPrice)}` : '—'}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono font-bold text-accent-green">
                        {fmt(s.currentYield)}%
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono text-xs">
                        {s.payoutRatio != null ? (
                          <span className={
                            s.payoutRatio > 150 ? 'text-accent-red font-bold'
                              : s.payoutRatio > 100 ? 'text-accent-yellow font-bold'
                                : 'text-text-secondary'
                          }>
                            {fmt(s.payoutRatio)}%
                          </span>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono text-xs">
                        {s.dividendCAGR != null ? (
                          <span className={s.dividendCAGR >= 0 ? 'text-accent-teal' : 'text-accent-red'}>
                            {s.dividendCAGR >= 0 ? '+' : ''}{fmt(s.dividendCAGR)}%
                          </span>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono text-xs font-bold text-accent-yellow">
                        {s.dividendStreak || '—'}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border ${
                          s.safetyScore === 'Safe' ? 'bg-accent-green/10 border-accent-green/20 text-accent-green' :
                          s.safetyScore === 'Moderate' ? 'bg-accent-yellow/10 border-accent-yellow/20 text-accent-yellow' :
                          'bg-accent-red/10 border-accent-red/20 text-accent-red'
                        }`}>
                          {s.safetyScore}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        {total > pageSize && (
          <div className="flex items-center justify-between bg-bg-surface border border-border/50 rounded-2xl px-4 py-3">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="text-xs font-bold text-text-secondary hover:text-accent-blue disabled:opacity-30"
            >
              ← Previous
            </button>
            <span className="text-[10px] text-text-muted font-mono">
              {page * pageSize + 1}–{Math.min((page + 1) * pageSize, total)} of {total}
            </span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={(page + 1) * pageSize >= total}
              className="text-xs font-bold text-text-secondary hover:text-accent-blue disabled:opacity-30"
            >
              Next →
            </button>
          </div>
        )}

        {/* Footnote */}
        <p className="text-[10px] text-text-muted text-center leading-relaxed max-w-3xl mx-auto pt-2">
          Payout frequency is derived from the most recent complete year of dividend history. High payout ratios are shown without filtering — you decide what fits your strategy. This page is educational only and not investment advice.
        </p>
      </div>
    </>
  );
};

export default DividendScreener;