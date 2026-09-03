import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import useStore from '../store/useStore';
import { getStock, handleApiError } from '../services/api';
import DCASimulator from '../components/DCASimulator';
import SimulatorSearchInput from '../components/SimulatorSearchInput';
import LoadingSpinner from '../components/LoadingSpinner';

const SimulatorDCA = () => {
  const { market } = useStore();
  const [symbol, setSymbol] = useState('');

  // ✅ Exactly like Results page – fetch and cache stock data
  const { data, isLoading, error } = useQuery({
    queryKey: ['stock', symbol, market],
    queryFn: () => getStock(symbol, market),
    enabled: !!symbol,
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });

  const err = error ? handleApiError(error) : null;

  return (
    <>
      <Helmet>
        <title>Regular Investment (DCA) Simulator – DividendBro</title>
        <meta name="description" content="Simulate dollar-cost averaging (DCA) with monthly investments and dividend reinvestment." />
      </Helmet>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">📊 Regular Investment (DCA) Simulator</h1>
        <p className="text-text-muted text-sm mb-6">
          Simulate investing a fixed amount every month, with dividend reinvestment (DRIP) over time.
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

        {/* ✅ Success – render simulator (stock is now cached in DB) */}
        {data && !isLoading && !error && (
          <DCASimulator symbol={symbol} market={market} />
        )}

        {/* ℹ️ Empty state */}
        {!symbol && !isLoading && !error && (
          <div className="bg-bg-surface border border-border rounded-xl p-12 text-center text-text-secondary">
            <p className="text-lg">Enter a stock symbol above to start your DCA simulation.</p>
            <p className="text-sm text-text-muted mt-2">Try AAPL, MSFT, or D05.SI</p>
          </div>
        )}
      </div>
    </>
  );
};

export default SimulatorDCA;