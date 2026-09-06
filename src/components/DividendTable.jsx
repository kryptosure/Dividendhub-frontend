import React from 'react';

const DividendTable = ({ data }) => {
  if (!data || !data.byYear || data.byYear.length === 0) {
    return (
      <div className="bg-bg-surface border border-border/50 rounded-2xl p-5 text-center text-text-muted font-medium text-xs">
        No dynamic performance histories mapped to index profiles.
      </div>
    );
  }

  const cur = data.currencySymbol || '$';
  const allPayouts = [];
  for (const yearObj of data.byYear) {
    if (yearObj.payouts && yearObj.payouts.length > 0) {
      for (const payout of yearObj.payouts) {
        allPayouts.push({
          date: payout.date,
          amount: payout.amount,
          type: payout.type || 'Dividend',
          year: yearObj.year,
        });
      }
    }
  }

  allPayouts.sort((a, b) => b.date.localeCompare(a.date));

  if (allPayouts.length === 0) {
    return (
      <div className="bg-bg-surface border border-border/50 rounded-2xl p-5 text-center text-text-muted font-medium text-xs">
        No isolated transaction distribution events found.
      </div>
    );
  }

  return (
    <div className="bg-bg-surface border border-border/50 rounded-2xl p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="font-black tracking-tight text-lg text-text-primary">📋 Historical Stream Ledger</h3>
        <p className="text-text-muted text-xs font-medium">Full complete record sequence tracking all macro asset distributions.</p>
      </div>

      <div className="border border-border/40 rounded-xl overflow-hidden max-h-64 overflow-y-auto bg-bg-secondary/20 shadow-inner">
        <table className="w-full text-left text-xs font-medium divide-y divide-border/20">
          <thead className="sticky top-0 bg-bg-secondary text-[10px] uppercase font-bold text-text-muted tracking-wider backdrop-blur-sm z-10">
            <tr>
              <th className="px-4 py-2.5">Execution Date</th>
              <th className="px-4 py-2.5 text-right">Cash Weight</th>
              <th className="px-4 py-2.5 text-right">Classification</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/10 font-mono text-text-secondary">
            {allPayouts.map((p, idx) => (
              <tr key={idx} className="hover:bg-bg-surface/50 transition-colors">
                <td className="px-4 py-2.5">{p.date}</td>
                <td className="px-4 py-2.5 text-right font-bold text-accent-teal">
                  {cur}{p.amount.toFixed(2)}
                </td>
                <td className="px-4 py-2.5 text-right text-[10px] font-sans font-bold tracking-wider uppercase text-text-muted/80">
                  {p.type}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DividendTable;
