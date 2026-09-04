import React, { useEffect, useRef, useState } from 'react';
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
import AddToPortfolioModal from './AddToPortfolioModal';

const Results = ({ symbol, market = 'us' }) => {
  const resultsRef = useRef(null);
  const { addToPortfolio, portfolio } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    setIsModalOpen(true);
  };

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

  // Build report data for PDF
  const reportData = {
    title: `${data.symbol} Dividend Analysis`,
    subtitle: `${data.name} (${data.exchange || 'NASDAQ'}) • ${data.currency}`,
    kpis: [
      { label: 'Total Dividends', value: `${data.currencySymbol || '$'}${data.totalDividend.toFixed(2)}` },
      { label: 'Current Price', value: `${data.currencySymbol || '$'}${data.currentPrice?.toFixed(2) || '—'}` },
      { label: 'Yield', value: data.currentYield ? `${data.currentYield.toFixed(2)}%` : '—' },
      { label: '5-Yr CAGR', value: data.dividendCAGR != null ? `${data.dividendCAGR >= 0 ? '+' : ''}${data.dividendCAGR.toFixed(2)}%` : '—' },
      { label: 'Latest Ex-Date', value: data.lastExDate || '—' },
      { label: 'Safety', value: data.safetyScore || '—' },
    ],
    tables: data.byYear && data.byYear.length > 0 ? [
      {
        title: 'Dividend History by Year',
        headers: ['Year', 'Total Dividend', 'Payouts'],
        rows: data.byYear.map(y => [
          y.year,
          `${data.currencySymbol || '$'}${y.total.toFixed(2)}`,
          y.count,
        ]),
      }
    ] : [],
    currencySymbol: data.currencySymbol || '$',
  };

  return (
    <div ref={resultsRef} id="results-section" className="mt-6 space-y-6">
      {/* Stock Name & Symbol */}
      <div className="bg-bg-surface border border-border rounded-xl p-4">
        <h2 className="text-2xl font-bold gradient-text">
          {data.name || data.symbol}
        </h2>
        <div className="flex items-center gap-3 mt-1">
          <span className="font-mono text-lg text-accent-teal font-semibold">
            {data.symbol}
          </span>
          <span className="text-sm text-text-muted">
            {data.exchange || (data.market === 'sg' ? 'SGX' : 'NASDAQ')}
          </span>
          {data.currency && (
            <span className="text-sm text-text-muted">
              · {data.currency}
            </span>
          )}
          {data.safetyScore && (
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              data.safetyScore === 'Safe' ? 'bg-accent-green/20 text-accent-green' :
              data.safetyScore === 'Moderate' ? 'bg-accent-yellow/20 text-accent-yellow' :
              'bg-accent-red/20 text-accent-red'
            }`}>
              {data.safetyScore}
            </span>
          )}
        </div>
      </div>

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
          reportData={reportData}
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

      {/* Add to Portfolio Modal */}
      <AddToPortfolioModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleModalAdd}
        symbol={data.symbol}
        name={data.name}
      />
    </div>
  );
};

export default Results;