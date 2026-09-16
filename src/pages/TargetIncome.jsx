import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import useStore from '../store/useStore';
import { generateIncomeAllocation } from '../services/api';
import { track } from '../services/tracker';
import LoadingSpinner from '../components/LoadingSpinner';

const LOCATIONS = [
  { key: 'SG', label: 'Singapore', sub: 'SGX only' },
  { key: 'US', label: 'United States', sub: 'US markets only' },
  { key: 'Both', label: 'Global', sub: 'US + SGX mixed' },
];

const RISK_LABELS = [
  { key: 'conservative', label: 'Conservative', desc: 'Safety first' },
  { key: 'balanced', label: 'Balanced', desc: 'Middle ground' },
  { key: 'growth', label: 'Growth', desc: 'Rising dividends' },
  { key: 'high-income', label: 'High Income', desc: 'Max yield, higher risk' },
];

const TargetIncome = () => {
  const { addToPortfolio, currency, setPortfolio } = useStore();

  const [targetMonthly, setTargetMonthly] = useState(1000);
  const [capital, setCapital] = useState('');
  const [location, setLocation] = useState('SG');
  const [riskProfile, setRiskProfile] = useState('balanced');

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  const curSymbol = currency === 'sgd' ? 'S$' : '$';

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
      const msg = err.response?.data?.error || err.message || 'Failed to generate allocation';
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
      market: p.symbol.endsWith('.SI') ? 'sg' : 'us',
      shares: p.shares,
      purchasePrice: p.currentPrice,
      purchaseDate: new Date().toISOString().slice(0, 10),
    }));

    // Replace or merge? Merge — append positions not already held
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
        <title>Target Income Planner – Illustrative Dividend Portfolio | DividendBro</title>
        <meta name="description" content="Educational tool: estimate the capital required to reach a target dividend income and see an illustrative allocation based on filters you select." />
        <meta name="robots" content="index, follow" />
      </Helmet>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-text-primary">
            💰 Target Income <span className="bg-gradient-to-r from-accent-blue to-accent-teal bg-clip-text text-transparent">Planner</span>
          </h1>
          <p className="text-text-muted text-sm mt-2 max-w-3xl">
            Enter a monthly income target. The planner estimates the capital required and shows an illustrative sample allocation based on the filters you select.
          </p>
        </div>

        {/* Compliance banner */}
        <div className="bg-accent-yellow/5 border border-accent-yellow/25 rounded-2xl p-4">
          <p className="text-[11px] text-accent-yellow font-bold uppercase tracking-wider mb-1">
            ⚠️ Educational tool — not financial advice
          </p>
          <p className="text-[11px] text-text-muted leading-relaxed">
            DividendBro is not licensed under the Financial Advisers Act (Singapore). This tool generates a hypothetical illustration using public market data and the filters you select. It is <strong className="text-text-secondary">not</strong> a recommendation, a personalised plan, or a solicitation to buy or sell securities. Past performance is not indicative of future results. Dividends are not guaranteed. Consult a licensed financial adviser before investing.
          </p>
        </div>

        {/* Input form */}
        <form onSubmit={handleSubmit} className="bg-bg-surface border border-border/50 rounded-2xl p-5 shadow-sm space-y-6">

          {/* Target income */}
          <div>
            <label className="block text-[10px] uppercase text-text-muted font-bold tracking-widest mb-2">
              Target monthly dividend income
            </label>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-black text-accent-blue font-mono">{curSymbol}</span>
              <input
                type="number"
                value={targetMonthly}
                onChange={(e) => setTargetMonthly(Number(e.target.value) || 0)}
                min="50"
                max="1000000"
                step="50"
                required
                className="flex-1 bg-bg-primary border border-border/60 rounded-xl px-4 py-3 text-2xl font-black text-text-primary focus:outline-none focus:border-accent-blue"
              />
              <span className="text-sm font-bold text-text-muted">/ month</span>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {[500, 1000, 2000, 5000].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setTargetMonthly(v)}
                  className={`text-[11px] font-bold px-3 py-1 rounded-lg border transition-all ${
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
            <label className="block text-[10px] uppercase text-text-muted font-bold tracking-widest mb-2">
              Starting capital <span className="text-text-muted/70 normal-case tracking-normal font-medium">(optional)</span>
            </label>
            <div className="flex items-center gap-3">
              <span className="text-xl font-black text-accent-teal font-mono">{curSymbol}</span>
              <input
                type="number"
                value={capital}
                onChange={(e) => setCapital(e.target.value)}
                placeholder="Leave blank to see required capital only"
                min="0"
                step="100"
                className="flex-1 bg-bg-primary border border-border/60 rounded-xl px-4 py-3 text-lg font-bold text-text-primary placeholder-text-muted/50 focus:outline-none focus:border-accent-teal"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-[10px] uppercase text-text-muted font-bold tracking-widest mb-2">
              Your location
            </label>
            <div className="grid grid-cols-3 gap-2">
              {LOCATIONS.map((loc) => (
                <button
                  key={loc.key}
                  type="button"
                  onClick={() => setLocation(loc.key)}
                  className={`rounded-xl p-3 border text-left transition-all ${
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
          </div>

          {/* Risk profile slider */}
          <div>
            <label className="block text-[10px] uppercase text-text-muted font-bold tracking-widest mb-3">
              Risk appetite
            </label>

            {/* Slider track */}
            <div className="relative pt-6 pb-2">
              <input
                type="range"
                min="0"
                max="3"
                step="1"
                value={RISK_LABELS.findIndex(r => r.key === riskProfile)}
                onChange={(e) => setRiskProfile(RISK_LABELS[Number(e.target.value)].key)}
                className="w-full accent-accent-blue cursor-pointer"
              />
              {/* Tick labels */}
              <div className="grid grid-cols-4 gap-1 mt-3">
                {RISK_LABELS.map((r) => {
                  const active = r.key === riskProfile;
                  return (
                    <button
                      key={r.key}
                      type="button"
                      onClick={() => setRiskProfile(r.key)}
                      className={`text-center rounded-lg py-2 px-1 transition-all ${
                        active
                          ? 'bg-accent-blue/10 border border-accent-blue/40'
                          : 'border border-transparent hover:bg-bg-primary'
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
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading || !targetMonthly}
            className="w-full py-4 bg-gradient-to-r from-accent-blue to-accent-teal text-white font-bold text-sm tracking-wider uppercase rounded-xl shadow-md hover:opacity-95 active:scale-[0.99] transition-all disabled:opacity-40"
          >
            {isLoading ? 'Generating illustration…' : 'Generate Illustrative Allocation'}
          </button>
        </form>

        {/* Loading */}
        {isLoading && (
          <div className="py-12"><LoadingSpinner /></div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-accent-red/5 border border-accent-red/20 rounded-2xl p-5">
            <p className="text-sm font-bold text-accent-red">⚠️ {error}</p>
          </div>
        )}

        {/* Results */}
        {result && result.ok && (
          <>
            {/* Summary hero */}
            <div className="bg-gradient-to-br from-accent-blue/10 via-bg-surface to-accent-teal/10 border border-accent-blue/20 rounded-2xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center md:text-left">
                  <p className="text-[10px] uppercase tracking-widest text-text-muted font-bold">Your Target</p>
                  <p className="text-3xl font-black text-text-primary mt-1">{curSymbol}{fmt(result.summary.targetMonthly)}</p>
                  <p className="text-xs text-text-muted">per month</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] uppercase tracking-widest text-text-muted font-bold">Required Capital</p>
                  <p className="text-3xl font-black text-accent-blue mt-1">{curSymbol}{fmt(result.summary.requiredCapital)}</p>
                  <p className="text-xs text-text-muted">at {result.summary.avgYield}% avg yield</p>
                </div>
                <div className="text-center md:text-right">
                  <p className="text-[10px] uppercase tracking-widest text-text-muted font-bold">Plan Generates</p>
                  <p className="text-3xl font-black text-accent-teal mt-1">{curSymbol}{fmt(result.summary.totalMonthlyIncome)}</p>
                  <p className="text-xs text-text-muted">/ month ({result.summary.positionCount} positions)</p>
                </div>
              </div>

              {result.summary.gap > 0 && (
                <div className="mt-4 pt-4 border-t border-border/30 text-center">
                  <p className="text-xs text-text-muted">
                    You provided <span className="font-bold text-text-primary">{curSymbol}{fmt(result.summary.providedCapital)}</span>.
                    Target requires <span className="font-bold text-text-primary">{curSymbol}{fmt(result.summary.requiredCapital)}</span>.
                    Gap: <span className="font-bold text-accent-yellow">{curSymbol}{fmt(result.summary.gap)}</span>.
                  </p>
                </div>
              )}
            </div>

            {/* Warnings */}
            {result.warnings?.length > 0 && (
              <div className="bg-accent-yellow/5 border border-accent-yellow/25 rounded-2xl p-4 space-y-1.5">
                {result.warnings.map((w, i) => (
                  <p key={i} className="text-xs text-accent-yellow font-medium">⚠️ {w}</p>
                ))}
              </div>
            )}

            {/* Profile */}
            <div className="bg-bg-surface border border-border/50 rounded-2xl p-5 shadow-sm">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-text-muted font-bold">Risk Profile</p>
                  <p className="text-lg font-black text-text-primary mt-1">{result.profile.label}</p>
                  <p className="text-xs text-text-muted mt-1 max-w-2xl">{result.profile.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-widest text-text-muted font-bold">Expected Yield</p>
                  <p className="text-sm font-bold text-accent-teal mt-1">
                    {result.profile.expectedYieldRange[0]}% – {result.profile.expectedYieldRange[1]}%
                  </p>
                </div>
              </div>
            </div>

            {/* Allocation table */}
            <div className="bg-bg-surface border border-border/50 rounded-2xl overflow-hidden shadow-sm">
              <div className="px-5 py-3 border-b border-border/40 bg-bg-primary/30">
                <p className="text-[10px] uppercase tracking-widest text-text-muted font-bold">
                  Illustrative Sample Allocation
                </p>
                <p className="text-[10px] text-text-muted mt-0.5">Not a recommendation. Verify each holding before investing.</p>
              </div>

              <div className="overflow-x-auto mobile-scroll">
                <table className="w-full text-xs">
                  <thead className="bg-bg-primary/50 text-text-muted uppercase font-bold tracking-wider text-[10px]">
                    <tr>
                      <th className="px-3 py-3 text-left">Symbol</th>
                      <th className="px-3 py-3 text-left">Name</th>
                      <th className="px-3 py-3 text-left">Sector</th>
                      <th className="px-3 py-3 text-right">Yield</th>
                      <th className="px-3 py-3 text-right">Weight</th>
                      <th className="px-3 py-3 text-right">Shares</th>
                      <th className="px-3 py-3 text-right">Cost</th>
                      <th className="px-3 py-3 text-right">Monthly</th>
                      <th className="px-3 py-3 text-center">Safety</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/20">
                    {result.positions.map((p) => (
                      <tr key={p.symbol} className="hover:bg-bg-primary/30">
                        <td className="px-3 py-2 font-mono font-bold text-accent-teal">
                          <Link to={`/?symbol=${p.symbol}`} className="hover:underline">{p.symbol}</Link>
                        </td>
                        <td className="px-3 py-2 text-text-primary truncate max-w-[160px]">{p.name}</td>
                        <td className="px-3 py-2 text-text-muted text-[10px] uppercase font-bold">{p.sector}</td>
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

            {/* Breakdown cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-bg-surface border border-border/50 rounded-2xl p-4">
                <p className="text-[10px] uppercase tracking-widest text-text-muted font-bold mb-2">Safety Mix</p>
                <div className="space-y-1.5">
                  {Object.entries(result.safetyBreakdown).map(([k, v]) => v > 0 && (
                    <div key={k} className="flex items-center justify-between text-xs">
                      <span className="text-text-secondary">{k}</span>
                      <span className="font-bold text-text-primary">{v} positions</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-bg-surface border border-border/50 rounded-2xl p-4">
                <p className="text-[10px] uppercase tracking-widest text-text-muted font-bold mb-2">Sector Mix</p>
                <div className="space-y-1.5">
                  {Object.entries(result.sectorBreakdown).sort((a,b) => b[1]-a[1]).map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between text-xs">
                      <span className="text-text-secondary truncate">{k}</span>
                      <span className="font-bold text-text-primary">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleSaveToPortfolio}
                disabled={saved}
                className="px-6 py-3 bg-gradient-to-r from-accent-blue to-accent-teal text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md hover:opacity-95 active:scale-95 transition-all disabled:opacity-50"
              >
                {saved ? '✓ Saved to Portfolio' : 'Save as My Portfolio'}
              </button>
              <Link
                to="/portfolio"
                className="px-6 py-3 bg-bg-surface border border-border/60 text-text-secondary text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-bg-surface-hover transition-all"
              >
                View My Portfolio →
              </Link>
            </div>

            {/* Full disclaimer */}
            <div className="bg-bg-surface border border-border/40 rounded-2xl p-5 mt-4">
              <p className="text-[10px] uppercase tracking-widest text-text-muted font-bold mb-2">Important Disclosures</p>
              <p className="text-[11px] text-text-muted leading-relaxed">{result.disclaimer}</p>
            </div>
          </>
        )}

        {/* Empty state */}
        {!result && !isLoading && !error && (
          <div className="bg-bg-surface border border-dashed border-border/40 rounded-2xl p-10 text-center">
            <div className="text-4xl mb-3">📊</div>
            <p className="text-sm font-bold text-text-primary">Fill in your target and press Generate</p>
            <p className="text-xs text-text-muted mt-1 max-w-md mx-auto">
              The planner will produce an illustrative allocation from real market data. It is not a recommendation.
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default TargetIncome;