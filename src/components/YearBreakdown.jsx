import React, { useState } from 'react';

const YearBreakdown = ({ data }) => {
  const [expanded, setExpanded] = useState({});
  const cur = data.currencySymbol || '$';

  if (!data.byYear || data.byYear.length === 0) {
    return null;
  }

  const toggle = (idx) => {
    setExpanded(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const sorted = [...data.byYear].sort((a, b) => b.year - a.year);

  return (
    <div className="bg-bg-surface border border-border rounded-xl p-4">
      <h3 className="font-bold text-lg mb-2">Yearly Breakdown</h3>
      <p className="text-text-muted text-xs mb-3">Tap a year to expand individual payouts</p>

      <div className="table-wrapper">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 text-text-muted font-semibold text-xs uppercase">Year</th>
              <th className="text-right py-2 text-text-muted font-semibold text-xs uppercase">Total</th>
              <th className="text-right py-2 text-text-muted font-semibold text-xs uppercase">Payouts</th>
              <th className="text-right py-2"></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((y, idx) => (
              <React.Fragment key={y.year}>
                <tr 
                  className="border-b border-border hover:bg-bg-surface-hover cursor-pointer transition"
                  onClick={() => toggle(idx)}
                >
                  <td className="py-2 font-mono font-bold">{y.year}</td>
                  <td className="py-2 text-right font-bold text-accent-teal">
                    {cur}{y.total.toFixed(2)}
                  </td>
                  <td className="py-2 text-right">{y.count}</td>
                  <td className="py-2 text-right">
                    <button className="text-text-muted text-xs transition-transform" 
                            style={{ transform: expanded[idx] ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                      ▼
                    </button>
                  </td>
                </tr>
                {expanded[idx] && (
                  <tr>
                    <td colSpan="4" className="py-2">
                      <div className="space-y-1 bg-bg-secondary rounded-lg p-2">
                        {y.payouts.map((p, i) => (
                          <div key={i} className="flex items-center gap-4 text-sm px-2 py-1">
                            <span className="font-mono text-text-secondary w-24 flex-shrink-0">
                              {p.date}
                            </span>
                            <div className="flex-1 h-2 bg-bg-surface rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-accent-blue to-accent-teal"
                                style={{ width: `${(p.amount / y.total) * 100}%` }}
                              ></div>
                            </div>
                            <span className="font-mono text-right min-w-[70px]">
                              {cur}{p.amount.toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-text-muted text-xs mt-3">
        * Amounts are per share in {data.currency || 'USD'}
      </p>
    </div>
  );
};

export default YearBreakdown;