// Replacement for src/pages/SimulatorDCA.jsx
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
      <div className="max-w-4xl mx-auto px-4 sm:px-0">
        {/* Banner Block */}
        <div className="mb-8">
          <h1 className="text-3xl font-black tracking-tight text-text-primary">
            📊 Dollar-Cost Averaging <span className="bg-gradient-to-r from-accent-blue to-accent-purple bg-clip-text text-transparent">Simulator</span>
          </h1>
          <p className="text-text-secondary text-sm mt-1 font-medium">
            See the math behind compounding interest. Simulate monthly inputs alongside dividend reinvestment (DRIP).
          </p>
        </div>

        {/* Input Wrapper Card */}
        <div className="bg-bg-surface border border-border/50 rounded-2xl p-5 mb-6 max-w-md shadow-sm">
          <label className="block text-[10px] uppercase text-text-muted font-bold tracking-widest mb-2">
            Target Stock Name or Ticker Symbol
          </label>
          <SimulatorSearchInput
            symbol={symbol}
            setSymbol={setSymbol}
            market={market}
            placeholder="e.g. Apple, Microsoft, DBS, OCBC"
          />
        </div>

        {isLoading && (
          <div className="py-12 bg-bg-surface/30 rounded-2xl border border-border/30 flex items-center justify-center">
            <LoadingSpinner />
          </div>
        )}

        {error && (
          <div className="bg-accent-red/5 border border-accent-red/20 rounded-2xl p-5 text-accent-red text-sm font-medium">
            <p className="font-bold text-base flex items-center gap-1">⚠️ {err?.message || 'Failed to load stock data'}</p>
            <p className="opacity-80 mt-1">Please try again or select an alternative symbol asset entry.</p>
          </div>
        )}

        {data && !isLoading && !error && (
          <div id="simulation-results" className="space-y-4 animate-in fade-in duration-300">
            <DCASimulator symbol={symbol} market={market} />
          </div>
        )}

        {!symbol && !isLoading && !error && (
          <div className="bg-bg-surface/50 border border-border/40 border-dashed rounded-2xl p-10 text-center relative overflow-hidden">
            <p className="text-text-secondary font-bold text-base">Select a ticker asset to configure model parameters</p>
            <p className="text-xs text-text-muted font-medium mt-1">
              Supports micro-caps, major equity positions, REIT distributions, and international ETFs.
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default SimulatorDCA;
