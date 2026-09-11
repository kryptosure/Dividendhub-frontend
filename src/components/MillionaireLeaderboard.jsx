import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { simulateMillionaire, formatYears, formatCompactCurrency } from '../utils/millionaire';

const MillionaireLeaderboard = ({
  stocks,
  monthlyAmount,
  drip,
  currencySymbol = '$',
  onSelectStock,
  isLoading,
  error,
}) => {
  // Compute leaderboard client-side from the metrics
  const ranked = useMemo(() => {
    if (!stocks || stocks.length === 0) return [];
    const results = stocks.map(s => {
      const sim = simulateMillionaire({
        currentPrice: s.currentPrice,
        currentYield: s.currentYield,
        priceCAGR: s.priceCAGR,
        dividendCAGR: s.dividendCAGR,
        monthlyAmount,
        drip,
      });
      return {
        symbol: s.symbol,
        name: s.name,
        currentYield: s.currentYield,
        priceCAGR: s.priceCAGR,
        dividendCAGR: s.dividendCAGR,
        yearsToTarget: sim.yearsToTarget,
        finalValue: sim.finalValue,
      };
    });
    // Sort: lowest yearsToTarget first, nulls last
    return results.sort((a, b) => {
      if (a.yearsToTarget === null && b.yearsToTarget === null) return 0;
      if (a.yearsToTarget === null) return 1;
      if (b.yearsToTarget === null) return -1;
      return a.yearsToTarget - b.yearsToTarget;
    });
  }, [stocks, monthlyAmount, drip]);

  if (isLoading) {
    return (
      <div className="bg-bg-surface border border-border/50 rounded-2xl p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-accent-blue border-t-transparent mx-auto" />
        <p className="text-xs text-text-muted mt-3">Generating leaderboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-accent-red/5 border border-accent-red/20 rounded-2xl p-5 text-center">
        <p className="text-sm text-accent-red font-bold">⚠️ {error}</p>
      </div>
    );
  }

  if (ranked.length === 0) {
    return (
      <div className="bg-bg-surface border border-border/50 rounded-2xl p-8 text-center">
        <p className="text-sm text-text-muted">No stocks available for this market.</p>
      </div>
    );
  }

  const best = ranked[0];

  return (
    <div className="space-y-4">
      {/* Winner Highlight */}
      {best && best.yearsToTarget !== null && (
        <div className="bg-gradient-to-br from-accent-yellow/10 via-bg-surface to-accent-teal/10 border border-accent-yellow/30 rounded-2xl p-5 text-center">
          <p className="text-[10px] uppercase tracking-widest text-accent-yellow font-bold">
            🏆 Fastest to $1M {drip ? 'with DRIP' : 'without DRIP'}
          </p>
          <p className="text-2xl font-black text-text-primary mt-2">
            {best.name || best.symbol}
          </p>
          <p className="text-xs text-text-muted font-mono mt-0.5">{best.symbol}</p>
          <div className="flex items-center justify-center gap-4 mt-3">
            <div className="text-center">
              <p className="text-2xl font-black text-accent-teal">{formatYears(best.yearsToTarget)}</p>
              <p className="text-[10px] text-text-muted uppercase tracking-wider">To $1M</p>
            </div>
            <div className="w-px h-10 bg-border" />
            <div className="text-center">
              <p className="text-2xl font-black text-accent-green">{(best.currentYield * 100).toFixed(2)}%</p>
              <p className="text-[10px] text-text-muted uppercase tracking-wider">Yield</p>
            </div>
          </div>
        </div>
      )}

      {/* Full ranked table */}
      <div className="bg-bg-surface border border-border/50 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-5 py-3 border-b border-border/40 bg-bg-primary/30 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-widest text-text-muted">
            Full Rankings ({ranked.length} stocks)
          </h3>
          <span className="text-[10px] text-text-muted font-mono">
            {currencySymbol}{monthlyAmount.toLocaleString()}/mo · {drip ? 'DRIP' : 'No DRIP'}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-[10px] uppercase font-bold tracking-wider text-text-muted">
              <tr className="border-b border-border/20">
                <th className="px-4 py-3 text-left w-12">#</th>
                <th className="px-4 py-3 text-left">Stock</th>
                <th className="px-4 py-3 text-right">Yield</th>
                <th className="px-4 py-3 text-right hidden sm:table-cell">Price CAGR</th>
                <th className="px-4 py-3 text-right hidden sm:table-cell">Div CAGR</th>
                <th className="px-4 py-3 text-right">To $1M</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/10">
              {ranked.map((stock, idx) => (
                <tr
                  key={stock.symbol}
                  className="hover:bg-bg-primary/30 transition-colors cursor-pointer"
                  onClick={() => onSelectStock && onSelectStock(stock.symbol)}
                >
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-md text-[10px] font-black ${
                      idx === 0 ? 'bg-accent-yellow/20 text-accent-yellow' :
                      idx === 1 ? 'bg-border/60 text-text-secondary' :
                      idx === 2 ? 'bg-accent-purple/20 text-accent-purple' :
                      'bg-bg-primary text-text-muted'
                    }`}>
                      {idx + 1}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-bold text-text-primary text-xs leading-tight truncate max-w-[160px]">
                      {stock.name || stock.symbol}
                    </div>
                    <div className="text-[10px] text-text-muted font-mono">{stock.symbol}</div>
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-accent-teal">
                    {(stock.currentYield * 100).toFixed(2)}%
                  </td>
                  <td className="px-4 py-3 text-right hidden sm:table-cell">
                    <span className={`font-mono text-xs ${stock.priceCAGR >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
                      {stock.priceCAGR >= 0 ? '+' : ''}{(stock.priceCAGR * 100).toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right hidden sm:table-cell">
                    <span className={`font-mono text-xs ${stock.dividendCAGR >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
                      {stock.dividendCAGR >= 0 ? '+' : ''}{(stock.dividendCAGR * 100).toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-black text-text-primary">
                      {stock.yearsToTarget !== null ? formatYears(stock.yearsToTarget) : '40+ yrs'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-[10px] text-text-muted text-center italic">
        Click any row to load that stock in the simulator above
      </p>
    </div>
  );
};

export default MillionaireLeaderboard;