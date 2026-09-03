import React from 'react';

const SafetyScore = ({ score }) => {
  if (!score) {
    return (
      <div className="bg-bg-surface border border-border rounded-xl p-4">
        <h3 className="font-bold text-lg mb-2">🛡️ Safety Score</h3>
        <p className="text-text-muted text-sm">No safety score available for this stock.</p>
      </div>
    );
  }

  const getColor = (s) => {
    if (s === 'Safe') return 'bg-accent-green/20 text-accent-green border-accent-green/30';
    if (s === 'Moderate') return 'bg-accent-yellow/20 text-accent-yellow border-accent-yellow/30';
    if (s === 'Caution') return 'bg-accent-red/20 text-accent-red border-accent-red/30';
    return 'bg-bg-secondary text-text-muted border-border';
  };

  const getDescription = (s) => {
    if (s === 'Safe') return 'Strong financials, stable dividends, low risk.';
    if (s === 'Moderate') return 'Average financials, some risk, but reasonable dividends.';
    if (s === 'Caution') return 'Higher risk – check financials carefully.';
    return 'Not rated.';
  };

  return (
    <div className="bg-bg-surface border border-border rounded-xl p-4">
      <h3 className="font-bold text-lg mb-2">🛡️ Safety Score</h3>
      <div className="flex items-center gap-4 flex-wrap">
        <span className={`px-4 py-2 rounded-full text-sm font-bold border ${getColor(score)}`}>
          {score}
        </span>
        <span className="text-text-secondary text-sm">{getDescription(score)}</span>
      </div>
      <p className="text-text-muted text-xs mt-3">
        * Based on payout ratio, dividend consistency, and financial health.
      </p>
    </div>
  );
};

export default SafetyScore;