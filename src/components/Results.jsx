import React, { useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { getStock } from '../services/api';
import useStore from '../store/useStore';
import KPIList from './KPIList';
import DividendChart from './DividendChart';
import YearBreakdown from './YearBreakdown';
import PortfolioCalculator from './PortfolioCalculator';
import DCASimulator from './DCASimulator';
import SkeletonResults from './SkeletonResults';
import ErrorBoundary from './ErrorBoundary';
import ExportButtons from './ExportButtons';

const Results = () => {
  const [searchParams] = useSearchParams();
  const symbol = searchParams.get('symbol');
  const market = useStore((state) => state.market);
  const { portfolio, addToPortfolio, removeFromPortfolio } = useStore();
  const resultsRef = useRef(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['stock', symbol, market],
    queryFn: () => getStock(symbol, market),
    enabled: !!symbol,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  // Prepare CSV data from dividend byYear
  const getCSVData = () => {
    if (!data || !data.byYear) return [];
    return data.byYear.map(y => ({
      Year: y.year,
      'Total Dividend': y.total,
      'Payouts': y.count,
    }));
  };

  if (!symbol) {
    return (
      <div className="text-center py-12 text-text-secondary">
        <div className="text-5xl mb-4">📊</div>
        <p className="text-lg">Search for a stock above to see its full dividend history.</p>
        <p className="text-sm text-text-muted mt-2">Try AAPL, MSFT, VZ, or D05.SI</p>
      </div>
    );
  }

  if (isLoading) return <SkeletonResults />;

  if (error) {
    return (
      <div className="bg-accent-red/10 border border-accent-red/20 rounded-xl p-4 text-accent-red">
        <strong>Error loading data:</strong> {error.message}
      </div>
    );
  }

  if (!data || data.message || data.error) {
    return (
      <div className="bg-accent-yellow/10 border border-accent-yellow/20 rounded-xl p-4 text-accent-yellow">
        <strong>No dividend data found</strong> for {symbol}.
        {data?.message && <span> {data.message}</span>}
        <p className="text-sm mt-1">
          The stock may not have a dividend history, or the ticker is invalid.
        </p>
      </div>
    );
  }

  const isInPortfolio = portfolio.some(item => item.symbol === data.symbol);

  const handlePortfolioToggle = () => {
    if (isInPortfolio) {
      removeFromPortfolio(data.symbol);
    } else {
      const shares = prompt(`How many shares of ${data.name || data.symbol} do you hold?`, '1');
      if (shares !== null) {
        const qty = parseFloat(shares);
        if (!isNaN(qty) && qty > 0) {
          addToPortfolio({ symbol: data.symbol, name: data.name, shares: qty, market });
        } else {
          alert('Please enter a valid positive number.');
        }
      }
    }
  };

  return (
    <ErrorBoundary>
      <div ref={resultsRef} className="space-y-6">
        {/* Header with Export Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-2xl font-extrabold">{data.name || data.symbol}</h2>
            <span className="font-mono text-accent-teal bg-accent-teal/10 px-3 py-0.5 rounded-full text-sm border border-accent-teal/20">
              {data.symbol}
            </span>
            <span className="text-text-muted text-sm">{data.exchange}</span>
            <span className="text-text-muted text-sm ml-2">
              {data.currency} · {data.currencySymbol}
            </span>
            <button
              onClick={handlePortfolioToggle}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${
                isInPortfolio
                  ? 'bg-accent-red/20 text-accent-red hover:bg-accent-red/30 border border-accent-red/20'
                  : 'bg-accent-blue/20 text-accent-blue hover:bg-accent-blue/30 border border-accent-blue/20'
              }`}
            >
              {isInPortfolio ? '✓ In Portfolio' : '➕ Add to Portfolio'}
            </button>
          </div>
          <ExportButtons
            data={getCSVData()}
            filename={`${data.symbol}_dividend_history`}
            headers={['Year', 'Total Dividend', 'Payouts']}
            elementRef={resultsRef}
            title={`${data.name || data.symbol} Dividend History`}
            shareMessage={`Check out the dividend history of ${data.name || data.symbol} on DividendHub!`}
          />
        </div>

        {/* KPIs */}
        <KPIList data={data} />

        {/* Chart */}
        <DividendChart data={data} />

        {/* Yearly Breakdown */}
        <YearBreakdown data={data} />

        {/* Portfolio Calculator */}
        <PortfolioCalculator symbol={data.symbol} market={market} />

        {/* DCA Simulator */}
        <DCASimulator symbol={data.symbol} market={market} />
      </div>
    </ErrorBoundary>
  );
};

export default Results;