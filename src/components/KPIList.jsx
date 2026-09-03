import React from 'react';

const KPIList = ({ data }) => {
  const cur = data.currencySymbol || '$';

  const safetyColors = {
    Safe: 'bg-accent-green/20 text-accent-green',
    Moderate: 'bg-accent-yellow/20 text-accent-yellow',
    Caution: 'bg-accent-red/20 text-accent-red',
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
      <div className="bg-bg-surface border border-border rounded-lg p-3">
        <div className="text-xs uppercase text-text-muted font-semibold">Total dividends</div>
        <div className="text-xl font-bold gradient-text">
          {cur}{data.totalDividend.toFixed(2)}
        </div>
        <div className="text-xs text-text-muted">{data.payoutCount} ex-dates</div>
      </div>

      <div className="bg-bg-surface border border-border rounded-lg p-3">
        <div className="text-xs uppercase text-text-muted font-semibold">Current Price</div>
        <div className="text-xl font-bold">
          {data.currentPrice ? cur + data.currentPrice.toFixed(2) : '—'}
        </div>
        <div className="text-xs text-text-muted">Last traded</div>
      </div>

      <div className="bg-bg-surface border border-border rounded-lg p-3">
        <div className="text-xs uppercase text-text-muted font-semibold">Yield</div>
        <div className="text-xl font-bold">
          {data.currentYield ? data.currentYield.toFixed(2) + '%' : '—'}
        </div>
        <div className="text-xs text-text-muted">Trailing 12 months</div>
      </div>

      <div className="bg-bg-surface border border-border rounded-lg p-3">
        <div className="text-xs uppercase text-text-muted font-semibold">5-Yr CAGR</div>
        <div className={`text-xl font-bold ${
          data.dividendCAGR && data.dividendCAGR >= 0 ? 'text-accent-green' : 'text-accent-red'
        }`}>
          {data.dividendCAGR != null 
            ? (data.dividendCAGR >= 0 ? '+' : '') + data.dividendCAGR.toFixed(2) + '%' 
            : '—'}
        </div>
        <div className="text-xs text-text-muted">Annualized growth</div>
      </div>

      <div className="bg-bg-surface border border-border rounded-lg p-3">
        <div className="text-xs uppercase text-text-muted font-semibold">Latest Ex-Date</div>
        <div className="text-xl font-bold">{data.lastExDate || '—'}</div>
        <div className="text-xs text-text-muted">Most recent</div>
      </div>

      <div className="bg-bg-surface border border-border rounded-lg p-3">
        <div className="text-xs uppercase text-text-muted font-semibold">Safety</div>
        <div className={`text-xl font-bold px-2 py-0.5 rounded-full inline-block ${
          safetyColors[data.safetyScore] || 'bg-bg-surface text-text-muted'
        }`}>
          {data.safetyScore || '—'}
        </div>
        <div className="text-xs text-text-muted">Risk assessment</div>
      </div>
    </div>
  );
};

export default KPIList;