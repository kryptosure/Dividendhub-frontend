import React from 'react';

const KPIList = ({ data }) => {
  const cur = data.currencySymbol || '$';

  const safetyColors = {
    Safe: 'bg-accent-green/10 border-accent-green/20 text-accent-green',
    Moderate: 'bg-accent-yellow/10 border-accent-yellow/20 text-accent-yellow',
    Caution: 'bg-accent-red/10 border-accent-red/20 text-accent-red',
  };

  const hasNoDividends = !data.totalDividend || data.payoutCount === 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      <div className="bg-bg-surface border border-border/50 rounded-xl p-4 shadow-sm">
        <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Total Dividends Paid Per Share</span>
        <div className="text-lg font-black text-text-primary mt-1">
          {hasNoDividends ? 'No History' : `${cur}${data.totalDividend.toFixed(2)}`}
        </div>
        <div className="text-[10px] font-semibold text-text-muted mt-0.5">{hasNoDividends ? '—' : `${data.payoutCount} Tracked Logs`}</div>
      </div>

      <div className="bg-bg-surface border border-border/50 rounded-xl p-4 shadow-sm">
        <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Current Market Price</span>
        <div className="text-lg font-black text-text-primary mt-1">
          {data.currentPrice ? cur + data.currentPrice.toFixed(2) : '—'}
        </div>
        <div className="text-[10px] font-semibold text-text-muted mt-0.5">Real-time Feed</div>
      </div>

      <div className="bg-bg-surface border border-border/50 rounded-xl p-4 shadow-sm">
        <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Div Yield</span>
        <div className="text-lg font-black text-accent-green mt-1">
          {data.currentYield ? data.currentYield.toFixed(2) + '%' : '—'}
        </div>
        <div className="text-[10px] font-semibold text-text-muted mt-0.5">TTM Metric Variance</div>
      </div>

      <div className="bg-bg-surface border border-border/50 rounded-xl p-4 shadow-sm">
        <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider">5-Yr CAGR Alpha</span>
        <div className={`text-lg font-black mt-1 ${data.dividendCAGR && data.dividendCAGR >= 0 ? 'text-accent-teal' : 'text-accent-red'}`}>
          {data.dividendCAGR != null ? (data.dividendCAGR >= 0 ? '+' : '') + data.dividendCAGR.toFixed(2) + '%' : '—'}
        </div>
        <div className="text-[10px] font-semibold text-text-muted mt-0.5">Compounded Delta</div>
      </div>

      <div className="bg-bg-surface border border-border/50 rounded-xl p-4 shadow-sm">
        <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Last Div Ex-Date</span>
        <div className="text-sm font-bold text-text-primary mt-2 truncate font-mono tracking-tight">{data.lastExDate || '—'}</div>
        <div className="text-[10px] font-semibold text-text-muted mt-1">Most Recent Event</div>
      </div>

      <div className="bg-bg-surface border border-border/50 rounded-xl p-4 shadow-sm flex flex-col justify-between">
        <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Risk Layer</span>
        <div className="mt-1">
          <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border ${safetyColors[data.safetyScore] || 'bg-bg-primary text-text-muted border-border/40'}`}>
            {data.safetyScore || '—'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default KPIList;