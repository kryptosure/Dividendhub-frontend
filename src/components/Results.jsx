// Replacement for src/components/Results.jsx
import React, { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getStock, handleApiError } from '../services/api';
import useStore from '../store/useStore';
import KPIList from './KPIList';
import DividendChart from './DividendChart';
import YearBreakdown from './YearBreakdown';
import DividendTable from './DividendTable';
import SafetyScore from './SafetyScore';
import PortfolioCalculator from './PortfolioCalculator';
import DCASimulator from './DCASimulator';
import LongTermValueChart from './LongTermValueChart';
import ExportButtons from './ExportButtons';
import AddToPortfolioModal from './AddToPortfolioModal';

const Results = ({ symbol, market = 'us' }) => {
  const resultsRef = useRef(null);
  const {
    addToPortfolio,
    portfolio,
    isInWatchlist,
    addToWatchlist,
    removeFromWatchlist,
    isInCompare,
    addToCompare,
    removeFromCompare,
    setChatContext, // ✅ NEW
  } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['stock', symbol, market],
    queryFn: () => getStock(symbol, market),
    enabled: !!symbol,
    retry: 1,
  });

  useEffect(() => {
    if (data && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [data]);

  const isInPortfolio = symbol && portfolio.some(item => item.symbol.toUpperCase() === symbol.toUpperCase());

  const handleModalAdd = (item) => {
    if (!data) return;
    addToPortfolio({
      symbol: data.symbol,
      name: data.name || data.symbol,
      market: data.market || market,
      shares: item.shares,
      purchaseDate: item.purchaseDate,
      purchasePrice: item.purchasePrice,
    });
    setIsModalOpen(false);
  };

  // ✅ NEW: Open chat with this stock's context
  const handleExplainThis = () => {
    if (!data) return;
    setChatContext({
      symbol: data.symbol,
      name: data.name || data.symbol,
      market: market,
      price: data.currentPrice,
      yield: data.currentYield,
      totalDividend: data.totalDividend,
      payoutCount: data.payoutCount,
      payoutRatio: data.payoutRatio,
      dividendCAGR: data.dividendCAGR,
      safetyScore: data.safetyScore,
      lastExDate: data.lastExDate,
      currencySymbol: data.currencySymbol,
    });
  };

  if (!symbol) {
    return (
      <div className="text-center py-16 bg-bg-surface/30 border border-dashed border-border/50 rounded-2xl p-8 max-w-xl mx-auto mt-8">
        <div className="text-4xl mb-3">🔍</div>
        <h4 className="text-base font-bold text-text-primary">Awaiting Your Input Parameters</h4>
        <p className="text-text-muted text-xs font-medium mt-1">Search for an active tracking ticker position to render cash flow histories.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-accent-blue border-t-transparent" />
        <span className="text-xs font-bold uppercase tracking-widest text-text-muted animate-pulse">Parsing Market Layers...</span>
      </div>
    );
  }

  if (error) {
    const err = handleApiError(error);
    return (
      <div className="text-center py-12 bg-accent-red/5 border border-accent-red/20 rounded-2xl max-w-xl mx-auto mt-8 p-6">
        <p className="text-sm font-bold text-accent-red">⚠️ {err.message}</p>
        <button onClick={() => refetch()} className="mt-4 px-5 py-2 bg-accent-red/10 border border-accent-red/20 hover:bg-accent-red/20 text-accent-red text-xs font-bold rounded-xl transition-all">
          Re-initialize Channel Link
        </button>
      </div>
    );
  }

  if (!data) return null;

  const hasNoDividends = !data.totalDividend || data.payoutCount === 0 || !data.byYear || data.byYear.length === 0;

  const exportData = [
    { Metric: 'Total Dividends', Value: data.totalDividend },
    { Metric: 'Current Price', Value: data.currentPrice },
    { Metric: 'Yield', Value: data.currentYield },
    { Metric: '5-Yr CAGR', Value: data.dividendCAGR },
    { Metric: 'Latest Ex-Date', Value: data.lastExDate },
    { Metric: 'Safety', Value: data.safetyScore },
  ];

  const reportData = {
    title: `${data.symbol} Dividend Analysis`,
    subtitle: `${data.name} (${data.exchange || 'NASDAQ'})`,
    kpis: [
      { label: 'Total Dividends', value: `${data.currencySymbol || '$'}${data.totalDividend.toFixed(2)}` },
      { label: 'Current Price', value: `${data.currencySymbol || '$'}${data.currentPrice?.toFixed(2) || '—'}` },
      { label: 'Yield', value: data.currentYield ? `${data.currentYield.toFixed(2)}%` : '—' },
      { label: '5-Yr CAGR', value: data.dividendCAGR != null ? `${data.dividendCAGR.toFixed(2)}%` : '—' }
    ],
    tables: [],
    currencySymbol: data.currencySymbol || '$',
  };

  return (
    <div ref={resultsRef} className="mt-8 space-y-6 animate-in fade-in duration-300">
      
      {/* Title Header Card */}
      <div className="bg-bg-surface border border-border/50 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-text-primary tracking-tight">{data.name || data.symbol}</h2>
          <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs font-semibold text-text-muted">
            <span className="font-mono bg-bg-secondary px-2.5 py-1 rounded-md border border-border/40 font-bold text-accent-teal tracking-wider">{data.symbol}</span>
            <span>•</span>
            <span className="uppercase">{data.exchange || 'EQUITY NODE'}</span>
            <span>•</span>
            <span className="font-bold text-text-secondary">{data.currency}</span>
          </div>
        </div>
        
        {/* Dynamic Safety Flags */}
        {data.safetyScore && (
          <div className="sm:text-right">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
              data.safetyScore === 'Safe' ? 'bg-accent-green/5 border-accent-green/20 text-accent-green' :
              data.safetyScore === 'Moderate' ? 'bg-accent-yellow/5 border-accent-yellow/20 text-accent-yellow' :
              'bg-accent-red/5 border-accent-red/20 text-accent-red'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${data.safetyScore === 'Safe' ? 'bg-accent-green' : data.safetyScore === 'Moderate' ? 'bg-accent-yellow' : 'bg-accent-red'}`} />
              {data.safetyScore} Capital Risk
            </span>
          </div>
        )}
      </div>

      {/* ✅ NEW: No Dividend Notice */}
      {hasNoDividends && (
        <div className="bg-accent-yellow/5 border border-accent-yellow/20 rounded-2xl p-5 text-center flex flex-col items-center gap-2">
          <span className="text-3xl">📭</span>
          <p className="text-sm font-bold text-accent-yellow">The stock you searched for has not declared any dividends yet</p>
          <p className="text-xs text-text-muted font-medium">We will update this page as soon as the company starts issuing payouts. You can still track its performance below.</p>
        </div>
      )}

      <KPIList data={data} />

      {/* Trigger Call Action Bar */}
      <div className="bg-bg-secondary/40 border border-border/30 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 backdrop-blur-sm">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setIsModalOpen(true)}
            disabled={isInPortfolio}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs tracking-wide uppercase transition-all active:scale-[0.98] ${
              isInPortfolio ? 'bg-bg-surface border border-border/60 text-text-muted cursor-not-allowed' : 'bg-gradient-to-r from-accent-blue to-accent-teal text-white shadow-sm hover:opacity-95'
            }`}
          >
            {isInPortfolio ? '✓ ADDED TO MY PORTFOLIO' : '➕ Add Investment To My Portfolio'}
          </button>

          <button
            onClick={() => isInWatchlist(data.symbol) ? removeFromWatchlist(data.symbol) : addToWatchlist({ symbol: data.symbol, name: data.name, market: market })}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs tracking-wide uppercase transition-all active:scale-[0.98] border ${
              isInWatchlist(data.symbol) ? 'bg-accent-yellow/10 border-accent-yellow/30 text-accent-yellow' : 'bg-bg-surface border-border/60 text-text-secondary hover:text-accent-blue'
            }`}
          >
            {isInWatchlist(data.symbol) ? '★ In Watchlist' : '☆ Add to Watchlist'}
          </button>

          <button
            onClick={() => isInCompare(data.symbol) ? removeFromCompare(data.symbol) : addToCompare({ symbol: data.symbol, name: data.name, market: market })}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs tracking-wide uppercase transition-all active:scale-[0.98] border ${
              isInCompare(data.symbol) ? 'bg-accent-teal/10 border-accent-teal/30 text-accent-teal' : 'bg-bg-surface border-border/60 text-text-secondary hover:text-accent-teal'
            }`}
          >
            {isInCompare(data.symbol) ? '✓ In Comparison' : '➕ Add to Compare'}
          </button>

          {/* ✅ NEW: Explain This button — opens AI chat with this stock's context */}
          <button
            onClick={handleExplainThis}
            className="px-5 py-2.5 rounded-xl font-bold text-xs tracking-wide uppercase transition-all active:scale-[0.98] border bg-gradient-to-r from-accent-purple/10 to-accent-blue/10 border-accent-purple/30 text-accent-purple hover:from-accent-purple/20 hover:to-accent-blue/20"
          >
            💬 Explain This
          </button>
        </div>

        <ExportButtons
          data={exportData}
          filename={`${symbol}_dividend_matrix`}
          headers={['Metric', 'Value']}
          reportData={reportData}
          title={`${symbol} Analytics Matrix`}
          shareMessage={`Reviewing ${symbol} performance loops on DividendBro.`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {!hasNoDividends && <DividendChart data={data} />}
          {!hasNoDividends && <YearBreakdown data={data} />}
        </div>
        <div className="space-y-6">
          <SafetyScore score={data.safetyScore} />
          {!hasNoDividends && <DividendTable data={data} />}
        </div>
      </div>

      <div className="h-[1px] bg-border/40 my-4" />
      <PortfolioCalculator symbol={symbol} market={market} />
      <DCASimulator symbol={symbol} market={market} />
      
      {/* New Long Term Growth Chart Added Below DCA Simulator */}
      <LongTermValueChart symbol={symbol} market={market} />

      <AddToPortfolioModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleModalAdd}
        symbol={data.symbol}
        name={data.name}
        market={market}
      />
    </div>
  );
};

export default Results;