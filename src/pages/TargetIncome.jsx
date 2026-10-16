import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Globe, RefreshCw, Sparkles } from 'lucide-react';
import { SG, US, CA } from 'country-flag-icons/react/3x2';
import useStore from '../store/useStore';
import { generateIncomeAllocation } from '../services/api';
import { track } from '../services/tracker';
import InfoTip from '../components/InfoTip';
import ShareBar from '../components/ShareBar';

const LOCATIONS = [
  { key: 'SG', label: 'Singapore', sub: 'SGX stocks only', Flag: SG },
  { key: 'US', label: 'United States', sub: 'US stocks only', Flag: US },
  { key: 'CA', label: 'Canada', sub: 'TSX stocks only', Flag: CA },
  { key: 'All', label: 'All Markets', sub: 'US + CA + SGX', Flag: null },
];

const RISK_LABELS = [
  { key: 'conservative', label: 'Safe', desc: 'Play it safe' },
  { key: 'balanced', label: 'Balanced', desc: 'A bit of both' },
  { key: 'growth', label: 'Growth', desc: 'Grows over time' },
  { key: 'high-income', label: 'High Income', desc: 'More money, more risk' },
];

const SECTOR_LABELS = {
  'Consumer Staples': 'Everyday Essentials',
  'Healthcare': 'Healthcare',
  'Communication Services': 'Phone & Internet',
  'Financials': 'Banks & Finance',
  'Energy': 'Oil & Gas',
  'Utilities': 'Power & Water',
  'Technology': 'Tech',
  'Consumer Discretionary': 'Lifestyle & Retail',
  'Industrials': 'Transport & Logistics',
  'Real Estate': 'Property & REITs',
  'Index Fund': 'Index Funds',
  'Other': 'Other',
};

const sectorLabel = (s) => SECTOR_LABELS[s] || s;

function marketToLocation(market) {
  if (market === 'sg') return 'SG';
  if (market === 'ca') return 'CA';
  if (market === 'us') return 'US';
  return 'SG';
}

const LOADING_PHASES = [
  'Scanning 672 dividend payers...',
  'Filtering by your risk profile...',
  'Checking dividend safety scores...',
  'Balancing sector diversification...',
  'Calculating monthly income...',
  'Assembling your portfolio...',
];

const MIN_LOADER_MS = 2500;

const ThinkingCard = () => {
  const [phaseIndex, setPhaseIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setPhaseIndex((i) => (i + 1) % LOADING_PHASES.length);
    }, 750);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center gap-4 sm:gap-6 py-6 sm:py-10">

      <div className="relative w-20 h-20 sm:w-28 sm:h-28 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-accent-blue/25 blur-3xl animate-pulse" />
        <div className="absolute inset-2 rounded-full border-2 border-dashed border-accent-blue/25" />
        <div className="absolute inset-0 animate-spin" style={{ animationDuration: '2s' }}>
          <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-accent-blue shadow-[0_0_16px_var(--accent)]" />
        </div>
        <div className="absolute inset-0 animate-spin" style={{ animationDuration: '3s', animationDirection: 'reverse' }}>
          <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-accent-teal shadow-[0_0_12px_var(--accent)]" />
        </div>
        <Sparkles size={28} className="sm:hidden text-accent-blue relative z-10" strokeWidth={1.75} />
        <Sparkles size={36} className="hidden sm:block text-accent-blue relative z-10" strokeWidth={1.75} />
      </div>

      <div className="text-center space-y-1.5 sm:space-y-2">
        <p className="text-[10px] uppercase tracking-widest text-text-muted font-bold">
          Cooking up your portfolio
        </p>
        <div className="h-6 sm:h-7 flex items-center justify-center">
          <p
            key={phaseIndex}
            className="text-sm sm:text-base font-bold text-accent-teal transition-opacity duration-300"
          >
            {LOADING_PHASES[phaseIndex]}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-2 h-2 rounded-full bg-accent-blue/60 animate-bounce"
            style={{ animationDelay: `${i * 0.15}s`, animationDuration: '1.2s' }}
          />
        ))}
      </div>
    </div>
  );
};

const TargetIncome = () => {
  const { currency, market: storeMarket, setPortfolio } = useStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [targetMonthly, setTargetMonthly] = useState(500);
  const [location, setLocation] = useState(() => marketToLocation(storeMarket));
  const [riskProfile, setRiskProfile] = useState('balanced');

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  const resultsRef = useRef(null);
  const wizardRef = useRef(null);

  const curSymbol = currency === 'sgd' ? 'S$' : currency === 'cad' ? 'C$' : '$';

  useEffect(() => {
    setLocation(marketToLocation(storeMarket));
  }, [storeMarket]);

  useEffect(() => {
    const symbol = searchParams.get('symbol');
    if (symbol) {
      navigate(`/search?symbol=${encodeURIComponent(symbol)}`, { replace: true });
    }
  }, [searchParams, navigate]);

  const runGeneration = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    setSaved(false);

    track('income_planner_generate', {
      targetMonthly,
      capital: 0,
      location,
      riskProfile,
    });

    const startTime = Date.now();

    try {
      const data = await generateIncomeAllocation({
        targetMonthly: Number(targetMonthly),
        capital: 0,
        location,
        riskProfile,
      });

      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, MIN_LOADER_MS - elapsed);
      if (remaining > 0) {
        await new Promise((r) => setTimeout(r, remaining));
      }

      setResult(data);

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err) {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, MIN_LOADER_MS - elapsed);
      if (remaining > 0) {
        await new Promise((r) => setTimeout(r, remaining));
      }

      const msg = err.response?.data?.error || err.message || 'Something went wrong. Try again.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestart = () => {
    setStep(1);
    setTargetMonthly(500);
    setLocation(marketToLocation(storeMarket));
    setRiskProfile('balanced');
    setResult(null);
    setError(null);
    setSaved(false);
    track('income_planner_restart', {});
    setTimeout(() => {
      wizardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const handleSaveToPortfolio = () => {
    if (!result || !result.positions) return;
    const newHoldings = result.positions.map((p) => ({
      symbol: p.symbol,
      name: p.name,
      market: p.symbol.endsWith('.SI') ? 'sg' : p.symbol.endsWith('.TO') ? 'ca' : 'us',
      shares: p.shares,
      purchasePrice: p.currentPrice,
      purchaseDate: new Date().toISOString().slice(0, 10),
    }));

    const existing = useStore.getState().portfolio || [];
    const existingSyms = new Set(existing.map(e => e.symbol.toUpperCase()));
    const merged = [...existing, ...newHoldings.filter(h => !existingSyms.has(h.symbol.toUpperCase()))];
    setPortfolio(merged);
    setSaved(true);
    track('income_planner_save_portfolio', { count: newHoldings.length });
  };

  const fmt = (n) => {
    if (n == null || isNaN(n)) return '-';
    return Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const goNext = () => setStep((s) => Math.min(s + 1, 3));
  const goBack = () => setStep((s) => Math.max(s - 1, 1));
  const goToStep = (n) => setStep(n);

  const showStartOver = step > 1 && !isLoading;

  return (
    <>
      <Helmet>
        <title>Monthly Dividend Income Planner - How Much Do You Need? | DividendBro</title>
        <meta name="description" content="Free tool: see how much you'd need to invest to earn a target monthly dividend income. Sample portfolios for Singapore, US, and Canadian stocks." />
      </Helmet>

      <div className="max-w-6xl mx-auto px-3 sm:px-4 pt-1 sm:pt-8 pb-4 sm:pb-8 space-y-3 sm:space-y-6">

        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-text-primary leading-tight">
            Monthly Dividend <span className="bg-gradient-to-r from-accent-blue to-accent-teal bg-clip-text text-transparent">Income Planner</span>
          </h1>
          <p className="text-sm sm:text-sm text-text-muted mt-1.5 sm:mt-2 max-w-2xl mx-auto">
            Answer 3 quick questions and we'll build a sample dividend portfolio for you.
          </p>
        </div>

        {/* ============ WIZARD ============ */}
        <div
          ref={wizardRef}
          className="bg-bg-surface border border-border/50 rounded-2xl shadow-sm overflow-hidden"
        >

          {/* Progress bar */}
          <div className="px-4 sm:px-8 pt-4 pb-3 sm:pt-6 sm:pb-4 border-b border-border/40 bg-bg-primary/20">
            <div className="flex items-center justify-between">
              {[1, 2, 3].map((n, i) => {
                const isActive = step === n;
                const isDone = step > n;
                return (
                  <React.Fragment key={n}>
                    <button
                      type="button"
                      onClick={() => goToStep(n)}
                      className="flex flex-col items-center gap-1 sm:gap-1.5 group"
                      aria-label={`Go to step ${n}`}
                    >
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                          isActive
                            ? 'bg-gradient-to-br from-accent-blue to-accent-teal text-white shadow-md'
                            : isDone
                            ? 'bg-accent-green/20 text-accent-green border border-accent-green/40'
                            : 'bg-bg-primary border border-border/60 text-text-muted group-hover:border-accent-blue/50'
                        }`}
                      >
                        {isDone ? '✓' : n}
                      </div>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider ${
                          isActive ? 'text-accent-blue' : isDone ? 'text-accent-green' : 'text-text-muted'
                        }`}
                      >
                        {n === 1 ? 'Income' : n === 2 ? 'Market' : 'Risk'}
                      </span>
                    </button>
                    {i < 2 && (
                      <div
                        className={`flex-1 h-0.5 mx-2 sm:mx-3 rounded-full transition-colors ${
                          step > n ? 'bg-accent-green/40' : 'bg-border/40'
                        }`}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Step content OR AI loader */}
          <div className="px-4 sm:px-8 py-4 sm:py-8 min-h-0 sm:min-h-[340px] flex flex-col justify-center">
            {isLoading ? (
              <ThinkingCard />
            ) : (
              <>
                {/* ===== STEP 1 ===== */}
                {step === 1 && (
                  <div className="space-y-4 sm:space-y-6 max-w-2xl mx-auto w-full">
                    <div className="text-center">
                      <p className="text-[10px] uppercase tracking-widest text-text-muted font-bold mb-1.5 sm:mb-2">
                        Question 1 of 3
                      </p>
                      <h2 className="text-xl sm:text-2xl font-black text-text-primary tracking-tight leading-tight">
                        How much dividend income do you want per month?
                      </h2>
                      <p className="text-xs sm:text-sm text-text-muted mt-1.5 sm:mt-2">
                        Pick a target. Most dividend investors aim for 3 to 6% per year on their investment.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3 max-w-md mx-auto">
                      <span className="text-3xl sm:text-3xl font-black text-accent-blue font-mono" aria-hidden="true">
                        {curSymbol}
                      </span>
                      <input
                        type="number"
                        value={targetMonthly}
                        onChange={(e) => setTargetMonthly(Number(e.target.value) || 0)}
                        min="50"
                        max="1000000"
                        step="50"
                        aria-label="Target monthly dividend income in dollars"
                        className="flex-1 bg-bg-primary border-2 border-border/60 rounded-xl px-3 sm:px-4 py-3 sm:py-4 text-3xl sm:text-3xl font-black text-text-primary text-center focus:outline-none focus:border-accent-blue transition-colors"
                      />
                      <span className="text-sm sm:text-sm font-bold text-text-muted">/mo</span>
                    </div>

                    <div className="flex flex-wrap gap-2 justify-center">
                      {[200, 500, 1000, 2000].map((v) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => setTargetMonthly(v)}
                          className={`text-sm sm:text-sm font-bold px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-lg border transition-all ${
                            targetMonthly === v
                              ? 'bg-accent-blue text-white border-accent-blue shadow-sm'
                              : 'bg-bg-primary border-border/60 text-text-secondary hover:border-accent-blue/60'
                          }`}
                        >
                          {curSymbol}{v.toLocaleString()}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* ===== STEP 2 ===== */}
                {step === 2 && (
                  <div className="space-y-4 sm:space-y-6 max-w-2xl mx-auto w-full">
                    <div className="text-center">
                      <p className="text-[10px] uppercase tracking-widest text-text-muted font-bold mb-1.5 sm:mb-2">
                        Question 2 of 3
                      </p>
                      <h2 className="text-xl sm:text-2xl font-black text-text-primary tracking-tight leading-tight">
                        Where are you investing from?
                      </h2>
                      <p className="text-xs sm:text-sm text-text-muted mt-1.5 sm:mt-2">
                        This affects which stocks we show. Singapore, US, and Canadian investors all have different tax situations.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 sm:gap-3 max-w-lg mx-auto">
                      {LOCATIONS.map((loc) => {
                        const active = location === loc.key;
                        const FlagComponent = loc.Flag;
                        return (
                          <button
                            key={loc.key}
                            type="button"
                            onClick={() => setLocation(loc.key)}
                            aria-pressed={active}
                            className={`min-h-[76px] sm:min-h-[100px] rounded-xl p-3 sm:p-4 border-2 text-left transition-all active:scale-[0.98] ${
                              active
                                ? 'border-accent-blue bg-accent-blue/5 shadow-sm'
                                : 'border-border/50 bg-bg-primary hover:border-accent-blue/40'
                            }`}
                          >
                            <div className="mb-1.5 sm:mb-2 h-5 sm:h-6 flex items-center">
                              {FlagComponent ? (
                                <FlagComponent
                                  title={loc.label}
                                  className="w-8 h-5 sm:w-9 sm:h-6 rounded-sm shadow-sm ring-1 ring-border/30"
                                />
                              ) : (
                                <Globe
                                  size={20}
                                  className={active ? 'text-accent-blue' : 'text-text-muted'}
                                />
                              )}
                            </div>
                            <p className={`text-sm sm:text-sm font-black ${active ? 'text-accent-blue' : 'text-text-primary'}`}>
                              {loc.label}
                            </p>
                            <p className="text-[11px] text-text-muted mt-0.5">{loc.sub}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ===== STEP 3 ===== */}
                {step === 3 && (
                  <div className="space-y-4 sm:space-y-6 max-w-2xl mx-auto w-full">
                    <div className="text-center">
                      <p className="text-[10px] uppercase tracking-widest text-text-muted font-bold mb-1.5 sm:mb-2">
                        Question 3 of 3
                      </p>
                      <h2 className="text-xl sm:text-2xl font-black text-text-primary tracking-tight leading-tight">
                        How much risk are you okay with?
                      </h2>
                      <p className="text-xs sm:text-sm text-text-muted mt-1.5 sm:mt-2">
                        Higher risk usually means higher income, but the dividend could get cut. If you're new, <strong className="text-text-secondary">Balanced</strong> is a good start.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-w-2xl mx-auto">
                      {RISK_LABELS.map((r) => {
                        const active = r.key === riskProfile;
                        return (
                          <button
                            key={r.key}
                            type="button"
                            onClick={() => setRiskProfile(r.key)}
                            aria-pressed={active}
                            className={`min-h-[68px] sm:min-h-[88px] rounded-xl p-3 sm:p-3 border-2 transition-all active:scale-[0.98] ${
                              active
                                ? 'border-accent-blue bg-accent-blue/5 shadow-sm'
                                : 'border-border/50 bg-bg-primary hover:border-accent-blue/40'
                            }`}
                          >
                            <div className={`text-sm sm:text-sm font-black ${active ? 'text-accent-blue' : 'text-text-primary'}`}>
                              {r.label}
                            </div>
                            <div className="text-[11px] text-text-muted mt-1 leading-tight">{r.desc}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Navigation footer (hidden during loading) */}
          {!isLoading && (
            <div className="px-4 sm:px-8 py-2.5 sm:py-5 border-t border-border/40 bg-bg-primary/20">
              <div className="grid grid-cols-3 items-center gap-2 sm:gap-3">

                {/* Left: Back */}
                <div className="flex justify-start">
                  {step > 1 ? (
                    <button
                      type="button"
                      onClick={goBack}
                      className="min-h-[44px] sm:min-h-[48px] px-3 sm:px-5 py-2.5 sm:py-3 rounded-xl text-xs sm:text-xs font-bold uppercase tracking-wider border bg-bg-surface border-border/60 text-text-secondary hover:bg-bg-surface-hover transition-all"
                    >
                      ← Back
                    </button>
                  ) : (
                    <span />
                  )}
                </div>

                {/* Center: Start over */}
                <div className="flex justify-center">
                  {showStartOver ? (
                    <button
                      type="button"
                      onClick={handleRestart}
                      className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-text-muted hover:text-accent-blue transition-colors px-2 py-1"
                      title="Start over"
                    >
                      <RefreshCw size={12} />
                      <span>Start over</span>
                    </button>
                  ) : (
                    <span />
                  )}
                </div>

                {/* Right: Next or Submit */}
                <div className="flex justify-end">
                  {step < 3 ? (
                    <button
                      type="button"
                      onClick={goNext}
                      disabled={step === 1 && (!targetMonthly || targetMonthly < 50)}
                      className="min-h-[44px] sm:min-h-[48px] px-4 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-accent-blue to-accent-teal text-white text-xs sm:text-xs font-bold uppercase tracking-wider rounded-xl shadow-md hover:opacity-95 active:scale-95 transition-all disabled:opacity-40"
                    >
                      Next →
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={runGeneration}
                      disabled={!targetMonthly}
                      className="min-h-[44px] sm:min-h-[48px] px-3 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-accent-blue to-accent-teal text-white text-xs sm:text-xs font-bold uppercase tracking-wider rounded-xl shadow-md hover:opacity-95 active:scale-95 transition-all disabled:opacity-40"
                    >
                      ✨ Show Sample Portfolio
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-accent-red/5 border border-accent-red/20 rounded-2xl p-5">
            <p className="text-sm font-bold text-accent-red">{error}</p>
            <button
              type="button"
              onClick={handleRestart}
              className="mt-3 text-xs font-bold text-accent-red hover:underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Results */}
        {result && result.ok && (
          <div ref={resultsRef} className="space-y-6">
            <div className="bg-gradient-to-br from-accent-blue/10 via-bg-surface to-accent-teal/10 border border-accent-blue/20 rounded-2xl p-5 sm:p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center md:text-left">
                  <p className="text-[10px] uppercase tracking-widest text-text-muted font-bold">Your Goal</p>
                  <p className="text-2xl sm:text-3xl font-black text-text-primary mt-1">{curSymbol}{fmt(result.summary.targetMonthly)}</p>
                  <p className="text-xs text-text-muted">per month</p>
                </div>
                <div className="text-center">
                  <p className="flex items-center justify-center md:justify-start text-[10px] uppercase tracking-widest text-text-muted font-bold">
                    Money You'd Need
                    <InfoTip text="The amount of capital required at this portfolio's average yield to produce your target monthly income." position="bottom" />
                  </p>
                  <p className="text-2xl sm:text-3xl font-black text-accent-blue mt-1">{curSymbol}{fmt(result.summary.requiredCapital)}</p>
                  <p className="text-xs text-text-muted">at {result.summary.avgYield}% average yield</p>
                </div>
                <div className="text-center md:text-right">
                  <p className="text-[10px] uppercase tracking-widest text-text-muted font-bold">This Plan Pays You</p>
                  <p className="text-2xl sm:text-3xl font-black text-accent-teal mt-1">{curSymbol}{fmt(result.summary.totalMonthlyIncome)}</p>
                  <p className="text-xs text-text-muted">/ month from {result.summary.positionCount} stocks</p>
                </div>
              </div>
            </div>

            {result.warnings?.length > 0 && (
              <div className="bg-amber-500/10 border border-amber-400/30 rounded-2xl p-4 space-y-1.5">
                {result.warnings.map((w, i) => (
                  <p key={i} className="text-xs text-amber-300 font-medium">{w}</p>
                ))}
              </div>
            )}

            <div className="bg-bg-surface border border-border/50 rounded-2xl p-5 shadow-sm">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-text-muted font-bold">Risk Level</p>
                  <p className="text-lg font-black text-text-primary mt-1">{result.profile.label}</p>
                  <p className="text-xs text-text-muted mt-1 max-w-2xl">{result.profile.description}</p>
                </div>
                <div className="text-right">
                  <p className="flex items-center justify-end text-[10px] uppercase tracking-widest text-text-muted font-bold">
                    Typical Yield
                    <InfoTip text="The percentage of your investment that comes back to you each year as dividends." position="left" />
                  </p>
                  <p className="text-sm font-bold text-accent-teal mt-1">
                    {result.profile.expectedYieldRange[0]}% - {result.profile.expectedYieldRange[1]}%
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-bg-surface border border-border/50 rounded-2xl overflow-hidden shadow-sm">
              <div className="px-5 py-3 border-b border-border/40 bg-bg-primary/30">
                <p className="text-[10px] uppercase tracking-widest text-text-muted font-bold">
                  Sample Portfolio
                </p>
                <p className="text-[10px] text-text-muted mt-0.5">
                  Just an example. Not a recommendation, research each stock before investing.
                </p>
              </div>

              <div className="overflow-x-auto mobile-scroll">
                <table className="w-full text-xs">
                  <thead className="bg-bg-primary/50 text-text-muted uppercase font-bold tracking-wider text-[10px]">
                    <tr>
                      <th className="px-3 py-3 text-left">Ticker</th>
                      <th className="px-3 py-3 text-left">Company</th>
                      <th className="px-3 py-3 text-left">Industry</th>
                      <th className="px-3 py-3 text-right">
                        <span className="inline-flex items-center">
                          Yield
                          <InfoTip text="The percentage of your investment paid back to you each year as dividends." />
                        </span>
                      </th>
                      <th className="px-3 py-3 text-right">
                        <span className="inline-flex items-center">
                          Share
                          <InfoTip text="How much of your total money goes into this stock." />
                        </span>
                      </th>
                      <th className="px-3 py-3 text-right">Shares</th>
                      <th className="px-3 py-3 text-right">Invest</th>
                      <th className="px-3 py-3 text-right">Income /mo</th>
                      <th className="px-3 py-3 text-center">
                        <span className="inline-flex items-center">
                          Risk
                          <InfoTip text="Safe = most reliable. Moderate = generally fine. Caution = higher chance of dividend cuts." position="left" />
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/20">
                    {result.positions.map((p) => (
                      <tr key={p.symbol} className="hover:bg-bg-primary/30">
                        <td className="px-3 py-2 font-mono font-bold text-accent-teal">
                          <Link to={`/search?symbol=${p.symbol}`} className="hover:underline">{p.symbol}</Link>
                        </td>
                        <td className="px-3 py-2 text-text-primary truncate max-w-[160px]">{p.name}</td>
                        <td className="px-3 py-2 text-text-muted text-[10px] uppercase font-bold">{sectorLabel(p.sector)}</td>
                        <td className="px-3 py-2 text-right font-mono text-accent-green font-bold">{p.currentYield.toFixed(2)}%</td>
                        <td className="px-3 py-2 text-right font-mono text-text-secondary">{p.weight.toFixed(2)}%</td>
                        <td className="px-3 py-2 text-right font-mono text-text-primary">{p.shares}</td>
                        <td className="px-3 py-2 text-right font-mono text-text-secondary">{curSymbol}{fmt(p.cost)}</td>
                        <td className="px-3 py-2 text-right font-mono text-accent-blue font-bold">{curSymbol}{fmt(p.monthlyIncome)}</td>
                        <td className="px-3 py-2 text-center">
                          <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border ${
                            p.safety === 'Safe' ? 'bg-accent-green/10 border-accent-green/20 text-accent-green' :
                            p.safety === 'Moderate' ? 'bg-accent-yellow/10 border-accent-yellow/20 text-accent-yellow' :
                            'bg-accent-red/10 border-accent-red/20 text-accent-red'
                          }`}>
                            {p.safety}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-bg-primary/40 font-bold">
                    <tr>
                      <td colSpan="6" className="px-3 py-3 text-text-muted text-[10px] uppercase tracking-wider">Total</td>
                      <td className="px-3 py-3 text-right font-mono text-text-primary">{curSymbol}{fmt(result.summary.totalCost)}</td>
                      <td className="px-3 py-3 text-right font-mono text-accent-blue">{curSymbol}{fmt(result.summary.totalMonthlyIncome)}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-bg-surface border border-border/50 rounded-2xl p-4">
                <p className="flex items-center text-[10px] uppercase tracking-widest text-text-muted font-bold mb-2">
                  Risk Breakdown
                  <InfoTip text="How many Safe, Moderate, and Caution stocks ended up in your portfolio." />
                </p>
                <div className="space-y-1.5">
                  {Object.entries(result.safetyBreakdown).map(([k, v]) => v > 0 && (
                    <div key={k} className="flex items-center justify-between text-xs">
                      <span className="text-text-secondary">{k}</span>
                      <span className="font-bold text-text-primary">{v} {v === 1 ? 'stock' : 'stocks'}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-bg-surface border border-border/50 rounded-2xl p-4">
                <p className="flex items-center text-[10px] uppercase tracking-widest text-text-muted font-bold mb-2">
                  Industry Breakdown
                  <InfoTip text="Spreading your money across different industries helps protect you if one sector struggles." />
                </p>
                <div className="space-y-1.5">
                  {Object.entries(result.sectorBreakdown).sort((a,b) => b[1]-a[1]).map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between text-xs">
                      <span className="text-text-secondary truncate">{sectorLabel(k)}</span>
                      <span className="font-bold text-text-primary">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleSaveToPortfolio}
                disabled={saved}
                className="min-h-[48px] px-6 py-3 bg-gradient-to-r from-accent-blue to-accent-teal text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md hover:opacity-95 active:scale-95 transition-all disabled:opacity-50"
              >
                {saved ? 'Saved to My Portfolio' : 'Save This to My Portfolio'}
              </button>
              <Link
                to="/portfolio"
                className="min-h-[48px] px-6 py-3 bg-bg-surface border border-border/60 text-text-secondary text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-bg-surface-hover transition-all flex items-center"
              >
                View My Portfolio
              </Link>
              <button
                type="button"
                onClick={handleRestart}
                className="min-h-[48px] px-6 py-3 bg-bg-surface border border-border/60 text-text-secondary text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-bg-surface-hover transition-all flex items-center gap-2"
              >
                <RefreshCw size={14} />
                Start Over
              </button>
            </div>

            <ShareBar result={result} curSymbol={curSymbol} />

            <div className="bg-bg-surface border border-border/40 rounded-2xl p-5 mt-4">
              <p className="text-[10px] uppercase tracking-widest text-text-muted font-bold mb-2">Important</p>
              <p className="text-[11px] text-text-muted leading-relaxed">{result.disclaimer}</p>
            </div>
          </div>
        )}

        {/* Disclaimer (bottom) */}
        <div className="bg-amber-500/10 border border-amber-400/30 rounded-2xl p-3.5 sm:p-4 mt-6 sm:mt-8">
          <p className="text-[11px] text-amber-300 font-bold uppercase tracking-wider mb-1">
            This is a learning tool, not financial advice
          </p>
          <p className="text-[11px] text-text-secondary leading-relaxed">
            DividendBro is not a licensed financial adviser. We use public market data to show you <strong className="text-text-primary">an example</strong> of what a portfolio could look like. It's not a recommendation. Always do your own research before investing.
          </p>
        </div>
      </div>
    </>
  );
};

export default TargetIncome;