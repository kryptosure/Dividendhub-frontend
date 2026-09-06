import React, { useState } from 'react';

const YearBreakdown = ({ data }) => {
  const [expanded, setExpanded] = useState({});
  const cur = data.currencySymbol || '$';

  if (!data.byYear || data.byYear.length === 0) return null;

  const toggle = (idx) => {
    setExpanded(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const sorted = [...data.byYear].sort((a, b) => b.year - a.year);

  return (
    <div className="bg-bg-surface border border-border/50 rounded-2xl p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="font-black tracking-tight text-lg text-text-primary">📆 Dividend Payout Record</h3>
        <p className="text-text-muted text-xs font-medium">Select an accounting epoch year tracking block to audit segmented payout lines.</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm divide-y divide-border/20">
          <thead className="bg-bg-secondary/40 text-[10px] uppercase font-bold text-text-muted tracking-wider">
            <tr>
              <th className="px-4 py-2.5">Accounting Year</th>
              <th className="px-4 py-2.5 text-right">Aggregated Total</th>
              <th className="px-4 py-2.5 text-right">Frequencies</th>
              <th className="px-4 py-2.5 text-right" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border/10 font-medium">
            {sorted.map((y, idx) => (
              <React.Fragment key={y.year}>
                <tr 
                  className="hover:bg-bg-secondary/40 cursor-pointer transition-colors"
                  onClick={() => toggle(idx)}
                >
                  <td className="px-4 py-3.5 font-mono font-bold text-text-primary">{y.year}</td>
                  <td className="px-4 py-3.5 text-right font-black text-accent-teal">
                    {cur}{y.total.toFixed(2)}
                  </td>
                  <td className="px-4 py-3.5 text-right text-text-secondary font-mono text-xs">{y.count} payouts</td>
                  <td className="px-4 py-3.5 text-right text-text-muted text-xs">
                    <span className={`inline-block transition-transform duration-200 ${expanded[idx] ? 'rotate-180' : ''}`}>▼</span>
                  </td>
                </tr>
                {expanded[idx] && (
                  <tr>
                    <td colSpan="4" className="px-4 py-3 bg-bg-primary/20">
                      <div className="space-y-2 bg-bg-secondary/50 border border-border/40 rounded-xl p-3 shadow-inner">
                        {y.payouts.map((p, i) => (
                          <div key={i} className="flex items-center gap-4 text-xs font-medium px-2 py-1.5 hover:bg-bg-surface/30 rounded-lg transition-colors">
                            <span className="font-mono text-text-muted w-24 flex-shrink-0">
                              {p.date}
                            </span>
                            <div className="flex-1 h-2 bg-bg-surface border border-border/20 rounded-full overflow-hidden shadow-inner">
                              <div 
                                className="h-full bg-gradient-to-r from-accent-blue to-accent-teal rounded-full"
                                style={{ width: `${Math.min(100, (p.amount / y.total) * 100)}%` }}
                              />
                            </div>
                            <span className="font-mono text-right text-text-primary font-bold min-w-[70px]">
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

      <p className="text-text-muted text-[10px] font-medium mt-4 tracking-wide">
        * Distribution rates calculated raw per share denominators inside token currency parameters.
      </p>
    </div>
  );
};

export default YearBreakdown;