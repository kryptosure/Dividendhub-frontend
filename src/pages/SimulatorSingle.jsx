// Replacement for src/pages/SimulatorSingle.jsx
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
        <title>One-Time Investment Return Simulator – DividendBro</title>
        <meta name="description" content="Simulate the return on a one-time stock investment, including dividend reinvestment and capital gains." />
      </Helmet>
      <div className="max-w-4xl mx-auto px-4 sm:px-0 relative">
        {/* Subtle Background Glow to lift the screen aesthetic */}
        <div className="absolute -top-10 left-10 w-48 h-48 bg-accent-teal/5 rounded-full blur-[80px] pointer-events-none" />

        {/* Dynamic Heading Block */}
        <div className="mb-8">
          <h1 className="text-3xl font-black tracking-tight text-text-primary">
            📈 One-Time Investment <span className="bg-gradient-to-r from-accent-teal to-accent-blue bg-clip-text text-transparent">Simulator</span>
          </h1>
          <p className="text-text-secondary text-sm mt-1 font-medium">
            Calculate historical compounded growth. Model total returns including shifts in capital gains and dividend reinvestment (DRIP).
          </p>
        </div>

        {/* Input Card Container - REMOVED TRANSPARENCY */}
        <div className="bg-bg-secondary border border-border/60 rounded-2xl p-5 mb-6 max-w-md shadow-sm">
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

        {/* Loading Framework View */}
        {isLoading && (
          <div className="py-12 bg-bg-secondary/30 rounded-2xl border border-border/30 flex items-center justify-center">
            <LoadingSpinner />
          </div>
        )}

        {/* Error Boundary Notification Block */}
        {error && (
          <div className="bg-accent-red/5 border border-accent-red/20 rounded-2xl p-5 text-accent-red text-sm font-medium">
            <p className="font-bold text-base flex items-center gap-1">⚠️ {err?.message || 'Failed to load stock data'}</p>
            <p className="opacity-80 mt-1">Please try again or select an alternative symbol asset entry.</p>
          </div>
        )}

        {/* Render Calculation Engines Dynamically */}
        {data && !isLoading && !error && (
          <div id="simulation-results" className="space-y-4 animate-in fade-in duration-300">
            <PortfolioCalculator symbol={symbol} market={market} />
          </div>
        )}

        {/* Aesthetic Placeholder Empty State - MADE FULLY SOLID */}
        {!symbol && !isLoading && !error && (
          <div className="bg-bg-secondary border border-border/40 border-dashed rounded-2xl p-10 text-center relative overflow-hidden">
            <p className="text-text-secondary font-bold text-base">Select a ticker asset to calculate returns</p>
            <p className="text-xs text-text-muted font-medium mt-1">
              Provides detailed multi-year analytics tracking back asset growth performance metrics cleanly.
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default SimulatorSingle;