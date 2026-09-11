import React from 'react';
import { getSimulationHistory, clearSimulationHistory, formatRelativeTime } from '../utils/simulationHistory';
import { formatYears } from '../utils/millionaire';

const RecentSimulations = ({ refreshKey, onSelect, currencySymbol = '$' }) => {
  // Recompute on refreshKey change (parent bumps it after saving)
  const history = React.useMemo(() => getSimulationHistory(), [refreshKey]);

  if (history.length === 0) return null;

  const handleClear = () => {
    clearSimulationHistory();
    onSelect && onSelect(null, { clearOnly: true });
  };

  return (
    <div className="bg-bg-surface border border-border/50 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold uppercase tracking-widest text-text-muted">
          🕒 Recent Simulations
        </h3>
        <button
          onClick={handleClear}
          className="text-[10px] font-bold uppercase tracking-wider text-text-muted hover:text-accent-red transition-colors"
        >
          Clear All
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
        {history.map((entry, idx) => (
          <button
            key={`${entry.symbol}-${entry.timestamp}`}
            onClick={() => onSelect(entry)}
            className="text-left bg-bg-primary border border-border/40 rounded-xl p-3 hover:border-accent-blue/40 hover:bg-bg-surface-hover transition-all group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-black tracking-wider text-text-muted">
                #{idx + 1}
              </span>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                entry.drip ? 'bg-accent-teal/10 text-accent-teal' : 'bg-border/40 text-text-muted'
              }`}>
                {entry.drip ? 'DRIP' : 'NO'}
              </span>
            </div>
            <div className="font-mono text-xs font-black text-text-primary group-hover:text-accent-blue transition-colors truncate">
              {entry.symbol}
            </div>
            <div className="text-[10px] text-text-muted mt-1 font-mono">
              {currencySymbol}{entry.monthlyAmount.toLocaleString()}/mo
            </div>
            <div className="text-[10px] font-bold text-accent-teal mt-1 truncate">
              {entry.yearsToTarget !== null ? formatYears(entry.yearsToTarget) : '40+ yrs'}
            </div>
            <div className="text-[9px] text-text-muted mt-1">
              {formatRelativeTime(entry.timestamp)}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default RecentSimulations;