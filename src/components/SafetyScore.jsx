import React from 'react';

const SafetyScore = ({ score }) => {
  if (!score) return null;

  const getColor = (s) => {
    if (s === 'Safe') return 'bg-accent-green/5 text-accent-green border-accent-green/20';
    if (s === 'Moderate') return 'bg-accent-yellow/5 text-accent-yellow border-accent-yellow/20';
    if (s === 'Caution') return 'bg-accent-red/5 text-accent-red border-accent-red/20';
    return 'bg-bg-secondary text-text-muted border-border/40';
  };

  const getDescription = (s) => {
    if (s === 'Safe') return 'Highly robust fundamental balance sheets, uniform payouts sequence history, ultra-low volatility risks.';
    if (s === 'Moderate') return 'Standard corporate metrics, baseline compliance ratios present, mid-tier risk variations.';
    if (s === 'Caution') return 'Elevated accounting leverage anomalies detected. High dividend drop risk factor present.';
    return 'Asset parameters outside evaluated grading modules.';
  };

  return (
    <div className="bg-bg-surface border border-border/50 rounded-2xl p-5 shadow-sm">
      <h3 className="font-black tracking-tight text-lg text-text-primary mb-3">🛡️ Capital Risk Score</h3>
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-bg-primary/30 border border-border/30 p-4 rounded-xl">
        <span className={`px-4 py-2 rounded-xl text-xs uppercase tracking-widest font-black border w-fit text-center block ${getColor(score)}`}>
          {score}
        </span>
        <span className="text-text-secondary text-xs font-semibold leading-relaxed">{getDescription(score)}</span>
      </div>
    </div>
  );
};

export default SafetyScore;
