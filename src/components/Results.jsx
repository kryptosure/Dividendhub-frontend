import React, { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getStock } from '../services/api';
import { handleApiError } from '../services/api';
import useStore from '../store/useStore';
import KPIList from './KPIList';
import DividendChart from './DividendChart';
import YearBreakdown from './YearBreakdown';
import DividendTable from './DividendTable';
import SafetyScore from './SafetyScore';
import PortfolioCalculator from './PortfolioCalculator';
import DCASimulator from './DCASimulator';
import ExportButtons from './ExportButtons';

const Results = ({ symbol, market = 'us' }) => {
  const resultsRef = useRef(null);
  const { addToPortfolio, portfolio } = useStore();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['stock', symbol, market],
    queryFn: () => getStock(symbol, market),
    enabled: !!symbol,
    retry: 1,
  });

  // Auto-scroll to results when data loads
  useEffect(() => {
    if (data && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [data]);

  // Check if stock is already in portfolio
  const isInPortfolio = symbol && portfolio.some(item => item.symbol === symbol);

  const handleAddToPortfolio = () => {
    if (!data) return;
    addToPortfolio({
      symbol: data.symbol,
      name: data.name || data.symbol,
      market: data.market || market,
      shares: 1,
    });
  };

  if (!symbol) {
    return (
      <div className="text-center py-12 text-text-secondary">
        <p className="text-lg">Search for a stock above to see its full dividend history.</p>
        <p className="text-sm mt-2">Try AAPL, MSFT, VZ, or D05.SI</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-blue"></div>
      </div>
    );
  }

  if (error) {
    const err = handleApiError(error);
    return (
      <div className="text-center py-12 text-accent-red">
        <p className="text-lg">⚠️ {err.message}</p>
        <button
          onClick={() => refetch()}
          className="mt-4 px-6 py-2 bg-accent-blue text-white rounded-lg hover:bg-accent-blue/80 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  // Prepare data for export (CSV/PDF)
  const exportData = [
    { Metric: 'Total Dividends', Value: data.totalDividend },
    { Metric: 'Current Price', Value: data.currentPrice },
    { Metric: 'Yield', Value: data.currentYield },
    { Metric: '5-Yr CAGR', Value: data.dividendCAGR },
    { Metric: 'Latest Ex-Date', Value: data.lastExDate },
    { Metric: 'Safety', Value: data.safetyScore },
  ];

  return (
    <div ref={resultsRef} id="results-section" className="mt-6 space-y-6">
      {/* KPI Cards */}
      <KPIList data={data} />

      {/* Add to Portfolio + Export Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={handleAddToPortfolio}
          disabled={isInPortfolio}
          className={`px-6 py-2 rounded-full font-semibold transition ${
            isInPortfolio
              ? 'bg-bg-secondary text-text-muted cursor-not-allowed'
              : 'bg-gradient-to-r from-accent-blue to-accent-teal text-white hover:shadow-lg'
          }`}
        >
          {isInPortfolio ? '✅ In Portfolio' : '➕ Add to Portfolio'}
        </button>

        <ExportButtons
          data={exportData}
          filename={`${symbol}_dividend_data`}
          headers={['Metric', 'Value']}
          elementRef={resultsRef}
          title={`${symbol} Dividend Analysis`}
          shareMessage={`Check out ${symbol} dividend data on DividendBro!`}
        />
      </div>

      {/* Charts & Tables */}
      <DividendChart data={data} />
      <YearBreakdown data={data} />
      <DividendTable data={data} />
      <SafetyScore score={data.safetyScore} />

      {/* Investment Tools */}
      <PortfolioCalculator symbol={symbol} market={market} />
      <DCASimulator symbol={symbol} market={market} />
    </div>
  );
};

export default Results;