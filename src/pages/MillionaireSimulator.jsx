import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import useStore from '../store/useStore';
import { track } from '../services/tracker';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import MillionaireChart from '../components/MillionaireChart';
import MillionaireLeaderboard from '../components/MillionaireLeaderboard';
import StockAutocomplete from '../components/StockAutocomplete';
import ShareCardModal from '../components/ShareCardModal';
import RecentSimulations from '../components/RecentSimulations';
import { simulateMillionaire, formatYears, formatCompactCurrency } from '../utils/millionaire';
import { saveSimulation } from '../utils/simulationHistory';

const PRESETS = [100, 250, 500, 1000, 2500];

const MillionaireSimulator = () => {
  const { market, currency } = useStore();
  const [symbol, setSymbol] = useState('KO');
  const [inputValue, setInputValue] = useState('KO');
  const [monthlyAmount, setMonthlyAmount] = useState(500);
  const [drip, setDrip] = useState(true);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [historyRefresh, setHistoryRefresh] = useState(0);

  const curSymbol = currency === 'sgd' ? 'S$' : '$';

  const { data: metrics, isLoading, error, refetch } = useQuery({
    queryKey: ['millionaire', symbol, market],
    queryFn: async () => {
      const res = await api.get(`/api/simulate/millionaire/${encodeURIComponent(symbol)}`, {
        params: { market },
      });
      return res.data;
    },
    enabled: !!symbol,
    staleTime: 10 * 60 * 1000,
  });

  const {
    data: leaderboardData,
    isLoading: leaderboardLoading,
    error: leaderboardError,
  } = useQuery({
    queryKey: ['millionaire-leaderboard', market],
    queryFn: async () => {
      const res = await api.get(`/api/simulate/millionaire-leaderboard/${market}`);
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const withDripResult = useMemo(() => {
    if (!metrics) return null;
    return simulateMillionaire({
      currentPrice: metrics.currentPrice,
      currentYield: metrics.currentYield,
      priceCAGR: metrics.priceCAGR,
      dividendCAGR: metrics.dividendCAGR,
      monthlyAmount,
      drip: true,
    });
  }, [metrics, monthlyAmount]);

  const noDripResult = useMemo(() => {
    if (!metrics) return null;
    return simulateMillionaire({
      currentPrice: metrics.currentPrice,
      currentYield: metrics.currentYield,
      priceCAGR: metrics.priceCAGR,
      dividendCAGR: metrics.dividendCAGR,
      monthlyAmount,
      drip: false,
    });
  }, [metrics, monthlyAmount]);

  useEffect(() => {
    track('open_millionaire_simulator', { symbol, monthlyAmount, drip });
  }, [symbol]);

  useEffect(() => {
    if (!metrics || !withDripResult || !noDripResult) return;
    const activeResult = drip ? withDripResult : noDripResult;
    if (activeResult.yearsToTarget === null && activeResult.finalValue < 100000) return;

    const timer = setTimeout(() => {
      saveSimulation({
        symbol: metrics.symbol,
        name: metrics.name,
        monthlyAmount,
        drip,
        yearsToTarget: activeResult.yearsToTarget,
      });
      setHistoryRefresh((n) => n + 1);
    }, 1500);

    return () => clearTimeout(timer);
  }, [metrics, withDripResult, noDripResult, drip, monthlyAmount]);

  const handleStockSelect = ({ symbol: newSymbol }) => {
    const cleaned = String(newSymbol).toUpperCase();
    setSymbol(cleaned);
    setInputValue(cleaned);
    track('millionaire_autocomplete_select', { symbol: cleaned });
  };

  const handleSelectFromLeaderboard = (selectedSymbol) => {
    setSymbol(selectedSymbol);
    setInputValue(selectedSymbol);
    track('millionaire_select_from_leaderboard', { symbol: selectedSymbol });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectFromHistory = (entry) => {
    if (!entry || entry.clearOnly) {
      setHistoryRefresh((n) => n + 1);
      return;
    }
    setSymbol(entry.symbol);
    setInputValue(entry.symbol);
    setMonthlyAmount(entry.monthlyAmount);
    setDrip(entry.drip);
    track('millionaire_select_from_history', { symbol: entry.symbol });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeResult = drip ? withDripResult : noDripResult;

  return (
    <>
      <Helmet>
        <title>Millionaire Simulator – How Fast to $1M with Dividend Stocks</title>
        <meta name="description" content="Interactive dividend simulator: see how fast $500/month reaches $1M in US and SGX stocks with DRIP. Live leaderboard of the fastest dividend compounders." />
        {/* ✅ Fixed: Static canonical URL */}
        <link rel="canonical" href="https://dividendbro.com/millionaire" />
        {/* ✅ Open Graph tags for social sharing */}
        <meta property="og:title" content="Millionaire Simulator – How Fast to $1M with Dividend Stocks" />
        <meta property="og:description" content="See how fast your monthly dividend investment reaches $1M. Interactive DRIP simulator for US and SGX stocks." />
        <meta property="og:url" content="https://dividendbro.com/millionaire" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://dividendbro.com/images/cover.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Millionaire Simulator – DividendBro" />
        <meta name="twitter:description" content="See how fast your monthly dividend investment reaches $1M." />
        <meta name="twitter:image" content="https://dividendbro.com/images/cover.png" />
      </Helmet>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-text-primary">
            💰 Millionaire <span className="bg-gradient-to-r from-accent-blue to-accent-teal bg-clip-text text-transparent">Simulator</span>
          </h1>
          <p className="text-text-muted text-sm mt-2">
            See how fast your monthly investment reaches $1M. Adjust and play.
          </p>
        </div>

        {/* Input Card */}
        <div className="bg-bg-surface border border-border/50 rounded-2xl p-5 shadow-sm space-y-5">
          <div>
            <label className="block text-[10px] uppercase text-text-muted font-bold tracking-widest mb-2">
              Search Stock (type name or ticker)
            </label>
            <StockAutocomplete
              value={inputValue}
              onChange={setInputValue}
              onSelect={handleStockSelect}
              market={market}
              placeholder="e.g. Coca-Cola, DBS, Apple, Verizon..."
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-[10px] uppercase text-text-muted font-bold tracking-widest">
                Monthly Investment
              </label>
              <span className="text-lg font-black text-accent-blue font-mono">
                {curSymbol}{monthlyAmount.toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min="50"
              max="5000"
              step="50"
              value={monthlyAmount}
              onChange={(e) => setMonthlyAmount(Number(e.target.value))}
              className="w-full accent-accent-blue cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-text-muted mt-1 font-mono">
              <span>{curSymbol}50</span>
              <span>{curSymbol}5,000</span>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {PRESETS.map((amt) => (
                <button
                  key={amt}
                  onClick={() => setMonthlyAmount(amt)}
                  className={`text-[11px] font-bold px-3 py-1 rounded-lg border transition-all ${
                    monthlyAmount === amt
                      ? 'bg-accent-blue text-white border-accent-blue'
                      : 'bg-bg-primary border-border/60 text-text-secondary hover:border-accent-blue/60'
                  }`}
                >
                  {curSymbol}{amt}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between bg-bg-primary border border-border/40 rounded-xl p-3">
            <div>
              <p className="text-xs font-bold text-text-primary">Reinvest Dividends (DRIP)</p>
              <p className="text-[10px] text-text-muted mt-0.5">
                Automatically buy more shares with each dividend
              </p>
            </div>
            <button
              onClick={() => setDrip(!drip)}
              className={`w-12 h-7 rounded-full transition-all relative ${
                drip ? 'bg-accent-teal' : 'bg-border'
              }`}
            >
              <div
                className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-md transition-all ${
                  drip ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Results */}
        {isLoading && <div className="py-12"><LoadingSpinner /></div>}
        {error && (
          <div className="bg-accent-red/5 border border-accent-red/20 rounded-2xl p-5 text-center">
            <p className="text-accent-red text-sm font-bold">⚠️ {error.response?.data?.error || error.message}</p>
            <button onClick={() => refetch()} className="mt-3 text-xs text-accent-blue font-bold hover:underline">Retry</button>
          </div>
        )}

        {metrics && activeResult && (
          <>
            {/* Hero Card */}
            <div className="bg-gradient-to-br from-accent-blue/10 via-bg-surface to-accent-teal/10 border border-accent-blue/20 rounded-2xl p-6 text-center relative">
              <p className="text-[10px] uppercase tracking-widest text-text-muted font-bold mb-1">
                {metrics.name} ({metrics.symbol})
              </p>
              <div className="text-5xl sm:text-6xl font-black text-text-primary my-3">
                {activeResult.yearsToTarget !== null ? formatYears(activeResult.yearsToTarget) : '40+ years'}
              </div>
              <p className="text-sm text-text-muted font-medium">
                to reach <span className="text-accent-teal font-bold">{curSymbol}1,000,000</span>
                {' '}at <span className="text-accent-blue font-bold">{curSymbol}{monthlyAmount.toLocaleString()}/month</span>
                {drip ? ' with DRIP' : ' without DRIP'}
              </p>

              <div className="grid grid-cols-3 gap-3 mt-6">
                <div className="bg-bg-surface/60 border border-border/40 rounded-xl p-3">
                  <p className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Yield</p>
                  <p className="text-lg font-black text-accent-teal mt-1">{(metrics.currentYield * 100).toFixed(2)}%</p>
                </div>
                <div className="bg-bg-surface/60 border border-border/40 rounded-xl p-3">
                  <p className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Price CAGR (5Y)</p>
                  <p className={`text-lg font-black mt-1 ${metrics.priceCAGR >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
                    {metrics.priceCAGR >= 0 ? '+' : ''}{(metrics.priceCAGR * 100).toFixed(2)}%
                  </p>
                </div>
                <div className="bg-bg-surface/60 border border-border/40 rounded-xl p-3">
                  <p className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Div CAGR (5Y)</p>
                  <p className={`text-lg font-black mt-1 ${metrics.dividendCAGR >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
                    {metrics.dividendCAGR >= 0 ? '+' : ''}{(metrics.dividendCAGR * 100).toFixed(2)}%
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsShareOpen(true)}
                className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-accent-purple/20 to-accent-blue/20 border border-accent-purple/30 text-accent-purple text-xs font-bold uppercase tracking-wider rounded-xl hover:from-accent-purple/30 hover:to-accent-blue/30 active:scale-95 transition-all"
              >
                📤 Share This Result
              </button>
            </div>

            {/* Recent Simulations */}
            <RecentSimulations
              refreshKey={historyRefresh}
              onSelect={handleSelectFromHistory}
              currencySymbol={curSymbol}
            />

            {/* DRIP vs No-DRIP Comparison */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setDrip(true)}
                className={`rounded-2xl p-4 text-left transition-all border-2 ${
                  drip ? 'border-accent-teal bg-accent-teal/5' : 'border-border/40 bg-bg-surface'
                }`}
              >
                <p className="text-[10px] uppercase font-bold tracking-widest text-text-muted">With DRIP</p>
                <p className={`text-2xl font-black mt-1 ${drip ? 'text-accent-teal' : 'text-text-primary'}`}>
                  {withDripResult.yearsToTarget !== null ? formatYears(withDripResult.yearsToTarget) : '40+ yrs'}
                </p>
                <p className="text-[10px] text-text-muted mt-1">
                  {formatCompactCurrency(withDripResult.finalValue, curSymbol)} in 40 years
                </p>
              </button>
              <button
                onClick={() => setDrip(false)}
                className={`rounded-2xl p-4 text-left transition-all border-2 ${
                  !drip ? 'border-accent-blue bg-accent-blue/5' : 'border-border/40 bg-bg-surface'
                }`}
              >
                <p className="text-[10px] uppercase font-bold tracking-widest text-text-muted">No DRIP</p>
                <p className={`text-2xl font-black mt-1 ${!drip ? 'text-accent-blue' : 'text-text-primary'}`}>
                  {noDripResult.yearsToTarget !== null ? formatYears(noDripResult.yearsToTarget) : '40+ yrs'}
                </p>
                <p className="text-[10px] text-text-muted mt-1">
                  {formatCompactCurrency(noDripResult.finalValue, curSymbol)} in 40 years
                </p>
              </button>
            </div>

            {withDripResult.yearsToTarget !== null && noDripResult.yearsToTarget !== null && (
              <div className="bg-accent-green/5 border border-accent-green/20 rounded-xl p-3 text-center">
                <p className="text-xs text-accent-green font-bold">
                  💡 DRIP gets you there{' '}
                  <span className="font-black">
                    {formatYears(noDripResult.yearsToTarget - withDripResult.yearsToTarget)}
                  </span>{' '}
                  faster than no DRIP
                </p>
              </div>
            )}

            <div className="bg-bg-surface border border-border/50 rounded-2xl p-5 shadow-sm">
              <h3 className="font-black text-lg text-text-primary mb-3">📈 Portfolio Growth (40 Years)</h3>
              <MillionaireChart
                withDripData={withDripResult.yearlyData}
                noDripData={noDripResult.yearlyData}
                currencySymbol={curSymbol}
              />
            </div>

            <div className="pt-4 border-t border-border/40">
              <div className="mb-4">
                <h2 className="text-2xl font-black tracking-tight text-text-primary">
                  🏆 Leaderboard: Fastest to {curSymbol}1M
                </h2>
                <p className="text-text-muted text-xs mt-1">
                  Top dividend stocks ranked by how fast they'd reach $1M at your current settings.
                  Adjust the slider above to see rankings shift live.
                </p>
              </div>

              <MillionaireLeaderboard
                stocks={leaderboardData?.stocks || []}
                monthlyAmount={monthlyAmount}
                drip={drip}
                currencySymbol={curSymbol}
                onSelectStock={handleSelectFromLeaderboard}
                isLoading={leaderboardLoading}
                error={leaderboardError?.message}
              />
            </div>

            <div className="bg-accent-yellow/5 border border-accent-yellow/20 rounded-xl p-4 text-[11px] text-text-muted leading-relaxed">
              <p><strong className="text-accent-yellow">⚠️ Important:</strong> This is a hypothetical projection based on historical price and dividend growth. Actual returns will vary. Past performance is not indicative of future results. This is educational only, not financial advice.</p>
            </div>
          </>
        )}
      </div>

      <ShareCardModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        metrics={metrics}
        monthlyAmount={monthlyAmount}
        drip={drip}
        yearsToTarget={activeResult?.yearsToTarget}
        finalValue={activeResult?.finalValue}
        currencySymbol={curSymbol}
      />
    </>
  );
};

export default MillionaireSimulator;