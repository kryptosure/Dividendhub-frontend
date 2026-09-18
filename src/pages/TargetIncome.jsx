import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import useStore from '../store/useStore';
import { generateIncomeAllocation } from '../services/api';
import { track } from '../services/tracker';
import LoadingSpinner from '../components/LoadingSpinner';
import InfoTip from '../components/InfoTip';

// ✅ CA added. 'All' replaces 'Both' as the mixed-markets option.
const LOCATIONS = [
  { key: 'SG', label: 'Singapore', sub: 'SGX stocks only' },
  { key: 'US', label: 'United States', sub: 'US stocks only' },
  { key: 'CA', label: 'Canada', sub: 'TSX stocks only' },
  { key: 'All', label: 'All Markets', sub: 'US + CA + SGX' },
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

// ✅ Map store market → planner location, so the header toggle drives the default.
function marketToLocation(market) {
  if (market === 'sg') return 'SG';
  if (market === 'ca') return 'CA';
  if (market === 'us') return 'US';
  return 'SG';
}

const TargetIncome = () => {
  const { currency, market: storeMarket, setPortfolio } = useStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [targetMonthly, setTargetMonthly] = useState(500);
  const [capital, setCapital] = useState('');
  // ✅ Initialize from store market on first render
  const [location, setLocation] = useState(() => marketToLocation(storeMarket));
  const [riskProfile, setRiskProfile] = useState('balanced');

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  const curSymbol = currency === 'sgd' ? 'S$' : currency === 'cad' ? 'C$' : '$';

  // ✅ Keep the planner location in sync when the user changes market in the header.
  // Selecting manually inside the planner still works — this only re-fires
  // when the store value actually changes.
  useEffect(() => {
    setLocation(marketToLocation(storeMarket));
  }, [storeMarket]);

  useEffect(() => {
    const symbol = searchParams.get('symbol');
    if (symbol) {
      navigate(`/search?symbol=${encodeURIComponent(symbol)}`, { replace: true });
    }
  }, [searchParams, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResult(null);
    setSaved(false);

    track('income_planner_generate', {
      targetMonthly,
      capital: capital ? Number(capital) : 0,
      location,
      riskProfile,
    });

    try {
      const data = await generateIncomeAllocation({
        targetMonthly: Number(targetMonthly),
        capital: capital ? Number(capital) : 0,
        location,
        riskProfile,
      });
      setResult(data);
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Something went wrong. Try again.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToPortfolio = () => {
    if (!result || !result.positions) return;
    const newHoldings = result.positions.map((p) => ({
      symbol: p.symbol,
      name: p.name,
      // ✅ CA: detect market from ticker suffix
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
    if (n == null || isNaN(n)) return '—';
    return Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <>
      <Helmet>
        <title>Monthly Dividend Income Planner – How Much Do You Need? | DividendBro</title>
        <meta name="description" content="Free tool: see how much you'd need to invest to earn a target monthly dividend income. Sample portfolios for Singapore, US, and Canadian stocks." />
      </Helmet>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-text-primary">
            Monthly Dividend <span className="bg-gradient-to-r from-accent-blue to-accent-teal bg-clip-text text-transparent">Income Planner</span>
          </h1>
          <p className="text-text-muted text-sm mt-2 max-w-3xl">
            Want to earn <strong className="text-text-secondary">{curSymbol}500 every month</strong> from dividends? Tell us your goal and we'll show you what a portfolio could look like.
          </p>
        </div>

        {/* Compliance banner */}
        <div className="bg-amber-500/10 border border-amber-400/30 rounded-2xl p-4">
          <p className="text-[11px] text-amber-300 font-bold uppercase tracking-wider mb-1">
            This is a learning tool — not financial advice
          </p>
          <p className="text-[11px] text-text-secondary leading-relaxed">
            DividendBro is not a licensed financial adviser. We use public market data to show you <strong className="text-text-primary">an example</strong> of what a portfolio could look like. It's not a recommendation. Always do your own research before investing.
          </p>
        </div>

        {/* Input form */}
        <form onSubmit={handleSubmit} className="bg-bg-surface border border-border/50 rounded-2xl p-5 shadow-sm space-y-6">

          {/* Target income */}
          <div>
            <div className="flex items-center text-[10px] uppercase text-text-muted font-bold tracking-widest mb-2">
              <label htmlFor="target-monthly-input">
                How much do you want per month?
              </label>
              <InfoTip text="This is your monthly income goal from dividends. Pick something realistic — most dividend investors aim for 3–6% per year on their investment." />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-black text-accent-blue font-mono" aria-hidden="true">{curSymbol}</span>
              <input
                id="target-monthly-input"
                type="number"
                value={targetMonthly}
                onChange={(e) => setTargetMonthly(Number(e.target.value) || 0)}
                min="50"
                max="1000000"
                step="50"
                required
                aria-label="Target monthly dividend income in dollars"
                className="flex-1 bg-bg-primary border border-border/60 rounded-xl px-4 py-3 text-2xl font-black text-text-primary focus:outline-none focus:border-accent-blue"
              />
              <span className="text-sm font-bold text-text-muted">/ month</span>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {[200, 500, 1000, 2000].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setTargetMonthly(v)}
                  className={`min-h-[40px] text-[12px] font-bold px-4 py-2 rounded-lg border transition-all ${
                    targetMonthly === v
                      ? 'bg-accent-blue text-white border-accent-blue'
                      : 'bg-bg-primary border-border/60 text-text-secondary hover:border-accent-blue/60'
                  }`}
                >
                  {curSymbol}{v.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Capital (optional) */}
          <div>
            <div className="flex items-center text-[10px] uppercase text-text-muted font-bold tracking-widest mb-2">
              <label htmlFor="capital-input">
                How much do you have to invest?
              </label>
              <span className="text-text-muted/70 normal-case tracking-normal font-medium ml-1">(optional)</span>
              <InfoTip text="Enter the amount you can invest today. We'll show what monthly income that could produce. Leave blank to see how much you'd need for your goal." />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xl font-black text-accent-teal font-mono" aria-hidden="true">{curSymbol}</span>
              <input
                id="capital-input"
                type="number"
                value={capital}
                onChange={(e) => setCapital(e.target.value)}
                placeholder="Leave blank to see how much you'd need"
                min="0"
                step="100"
                aria-label="Amount you have to invest today in dollars"
                className="flex-1 bg-bg-primary border border-border/60 rounded-xl px-4 py-3 text-lg font-bold text-text-primary placeholder-text-muted/50 focus:outline-none focus:border-accent-teal"
              />
            </div>
          </div>

          {/* Location */}
          <fieldset>
            <legend className="flex items-center text-[10px] uppercase text-text-muted font-bold tracking-widest mb-2">
              Where are you investing from?
              <InfoTip text="This affects which stocks we show. Singapore, US, and Canadian investors all have different tax situations." />
            </legend>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {LOCATIONS.map((loc) => (
                <button
                  key={loc.key}
                  type="button"
                  onClick={() => setLocation(loc.key)}
                  aria-pressed={location === loc.key}
                  className={`min-h-[64px] rounded-xl p-3 border text-left transition-all ${
                    location === loc.key
                      ? 'border-accent-blue bg-accent-blue/5'
                      : 'border-border/50 bg-bg-primary hover:border-accent-blue/40'
                  }`}
                >
                  <p className="text-xs font-bold text-text-primary">{loc.label}</p>
                  <p className="text-[10px] text-text-muted mt-0.5">{loc.sub}</p>
                </button>
              ))}
            </div>
          </fieldset>

          {/* Risk profile */}
          <div>
            <div className="flex items-center text-[10px] uppercase text-text-muted font-bold tracking-widest mb-3">
              <label htmlFor="risk-profile-slider">
                How much risk are you okay with?
              </label>
              <InfoTip text="Higher risk usually means higher income, but the dividend could get cut. If you're new to investing, 'Balanced' is a good starting point." />
            </div>

            <input
              id="risk-profile-slider"
              type="range"
              min="0"
              max="3"
              step="1"
              value={RISK_LABELS.findIndex(r => r.key === riskProfile)}
              onChange={(e) => setRiskProfile(RISK_LABELS[Number(e.target.value)].key)}
              aria-label="Risk profile selector"
              aria-valuemin="0"
              aria-valuemax="3"
              aria-valuenow={RISK_LABELS.findIndex(r => r.key === riskProfile)}
              aria-valuetext={RISK_LABELS.find(r => r.key === riskProfile)?.label || 'Balanced'}
              className="w-full accent-accent-blue cursor-pointer"
            />

            <div className="grid grid-cols-4 gap-1 mt-3">
              {RISK_LABELS.map((r) => {
                const active = r.key === riskProfile;
                return (
                  <button
                    key={r.key}
                    type="button"
                    onClick={() => setRiskProfile(r.key)}
                    aria-pressed={active}
                    className={`min-h-[56px] text-center rounded-lg py-2.5 px-1 transition-all ${
                      active ? 'bg-accent-blue/10 border border-accent-blue/40' : 'border border-transparent hover:bg-bg-primary'
                    }`}
                  >
                    <div className={`text-[11px] font-black ${active ? 'text-accent-blue' : 'text-text-secondary'}`}>
                      {r.label}
                    </div>
                    <div className="text-[9px] text-text-muted mt-0.5">{r.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading || !targetMonthly}
            className="w-full min-h-[56px] py-4 bg-gradient-to-r from-accent-blue to-accent-teal text-white font-bold text-sm tracking-wider uppercase rounded-xl shadow-md hover:opacity-95 active:scale-[0.99] transition-all disabled:opacity-40"
          >
            {isLoading ? 'Building your sample portfolio…' : 'Show Me A Sample Portfolio'}
          </button>
        </form>

        {/* Loading */}
        {isLoading && <div className="py-12"><LoadingSpinner /></div>}

        {/* Error */}
        {error && (
          <div className="bg-accent-red/5 border border-accent-red/20 rounded-2xl p-5">
            <p className="text-sm font-bold text-accent-red">{error}</p>
          </div>
        )}

        {/* Results */}
        {result && result.ok && (
          <>
            <div className="bg-gradient-to-br from-accent-blue/10 via-bg-surface to-accent-teal/10 border border-accent-blue/20 rounded-2xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center md:text-left">
                  <p className="text-[10px] uppercase tracking-widest text-text-muted font-bold">Your Goal</p>
                  <p className="text-3xl font-black text-text-primary mt-1">{curSymbol}{fmt(result.summary.targetMonthly)}</p>
                  <p className="text-xs text-text-muted">per month</p>
                </div>
                <div className="text-center">
                  <p className="flex items-center justify-center md:justify-start text-[10px] uppercase tracking-widest text-text-muted font-bold">
                    Money You'd Need
                    <InfoTip text="The amount of capital required at this portfolio's average yield to produce your target monthly income." position="bottom" />
                  </p>
                  <p className="text-3xl font-black text-accent-blue mt-1">{curSymbol}{fmt(result.summary.requiredCapital)}</p>
                  <p className="text-xs text-text-muted">at {result.summary.avgYield}% average yield</p>
                </div>
                <div className="text-center md:text-right">
                  <p className="text-[10px] uppercase tracking-widest text-text-muted font-bold">This Plan Pays You</p>
                  <p className="text-3xl font-black text-accent-teal mt-1">{curSymbol}{fmt(result.summary.totalMonthlyIncome)}</p>
                  <p className="text-xs text-text-muted">/ month from {result.summary.positionCount} stocks</p>
                </div>
              </div>

              {result.summary.gap > 0 && (
                <div className="mt-4 pt-4 border-t border-border/30 text-center">
                  <p className="text-xs text-text-muted">
                    You have <span className="font-bold text-text-primary">{curSymbol}{fmt(result.summary.providedCapital)}</span>.
                    Your goal needs <span className="font-bold text-text-primary">{curSymbol}{fmt(result.summary.requiredCapital)}</span>.
                    Shortfall: <span className="font-bold text-amber-300">{curSymbol}{fmt(result.summary.gap)}</span>.
                  </p>
                </div>
              )}
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
                    {result.profile.expectedYieldRange[0]}% – {result.profile.expectedYieldRange[1]}%
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
                  Just an example. Not a recommendation — research each stock before investing.
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
            </div>

            <div className="bg-bg-surface border border-border/40 rounded-2xl p-5 mt-4">
              <p className="text-[10px] uppercase tracking-widest text-text-muted font-bold mb-2">Important</p>
              <p className="text-[11px] text-text-muted leading-relaxed">{result.disclaimer}</p>
            </div>
          </>
        )}

        {!result && !isLoading && !error && (
          <div className="bg-bg-surface border border-dashed border-border/40 rounded-2xl p-10 text-center">
            <p className="text-sm font-bold text-text-primary">Tell us your goal and we'll show you a sample</p>
            <p className="text-xs text-text-muted mt-1 max-w-md mx-auto">
              Enter a monthly target above and press the button. We'll build a sample portfolio from real market data.
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default TargetIncome;