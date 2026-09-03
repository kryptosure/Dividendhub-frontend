import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import useStore from '../store/useStore';
import { getStock, handleApiError } from '../services/api';
import PortfolioCalculator from '../components/PortfolioCalculator';
import SimulatorSearchInput from '../components/SimulatorSearchInput';
import LoadingSpinner from '../components/LoadingSpinner';

const SimulatorSingle = () => {
  const { market } = useStore();
  const [symbol, setSymbol] = useState('');

  // ✅ Exactly like Results page – fetch and cache stock data
  const { data, isLoading, error } = useQuery({
    queryKey: ['stock', symbol, market],
    queryFn: () => getStock(symbol, market),
    enabled: !!symbol,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const err = error ? handleApiError(error) : null;

  return (
    <>
      <Helmet>
        <title>One-Time Investment Return Simulator – DividendBro</title>
        <meta name="description" content="Simulate the return on a one-time stock investment, including dividend reinvestment and capital gains." />
      </Helmet>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">📈 One-Time Investment Simulator</h1>
        <p className="text-text-muted text-sm mb-6">
          Calculate your total return, including dividends and capital gains, for a single purchase.
        </p>

        <div className="mb-6 max-w-sm">
          <label className="block text-xs uppercase text-text-muted font-semibold mb-1">
            Stock Symbol
          </label>
          <SimulatorSearchInput
            symbol={symbol}
            setSymbol={setSymbol}
            market={market}
            placeholder="e.g. AAPL, MSFT, D05.SI"
          />
        </div>

        {/* ⏳ Loading state */}
        {isLoading && <LoadingSpinner />}

        {/* ❌ Error state */}
        {error && (
          <div className="bg-accent-red/10 border border-accent-red/20 rounded-xl p-4 text-accent-red">
            <p className="font-semibold">⚠️ {err?.message || 'Failed to load stock data'}</p>
            <p className="text-sm mt-1">Please try again or choose a different symbol.</p>
          </div>
        )}

        {/* ✅ Success – render calculator (stock is now cached in DB) */}
        {data && !isLoading && !error && (
          <PortfolioCalculator symbol={symbol} market={market} />
        )}

        {/* ℹ️ Empty state */}
        {!symbol && !isLoading && !error && (
          <div className="bg-bg-surface border border-border rounded-xl p-12 text-center text-text-secondary">
            <p className="text-lg">Enter a stock symbol above to see your return.</p>
            <p className="text-sm text-text-muted mt-2">Try AAPL, MSFT, or D05.SI</p>
          </div>
        )}
      </div>
    </>
  );
};

export default SimulatorSingle;