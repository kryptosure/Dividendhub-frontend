import React from 'react';

const DividendTable = ({ data }) => {
  if (!data || !data.byYear || data.byYear.length === 0) {
    return (
      <div className="bg-bg-surface border border-border rounded-xl p-4">
        <h3 className="font-bold text-lg mb-2">Dividend History</h3>
        <p className="text-text-muted text-sm">No dividend history available.</p>
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
      <div className="bg-bg-surface border border-border rounded-xl p-4">
        <h3 className="font-bold text-lg mb-2">Dividend History</h3>
        <p className="text-text-muted text-sm">No individual payouts found.</p>
      </div>
    );
  }

  return (
    <div className="bg-bg-surface border border-border rounded-xl p-4">
      <h3 className="font-bold text-lg mb-2">📋 Dividend History</h3>
      <p className="text-text-muted text-xs mb-3">All past dividend payments</p>

      <div className="table-wrapper max-h-64 overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-bg-surface border-b border-border">
            <tr>
              <th className="text-left py-2 text-text-muted font-semibold text-xs uppercase">Date</th>
              <th className="text-right py-2 text-text-muted font-semibold text-xs uppercase">Amount</th>
              <th className="text-right py-2 text-text-muted font-semibold text-xs uppercase">Type</th>
            </tr>
          </thead>
          <tbody>
            {allPayouts.map((p, idx) => (
              <tr key={idx} className="border-b border-border/50 hover:bg-bg-surface-hover">
                <td className="py-2 font-mono">{p.date}</td>
                <td className="py-2 text-right font-bold text-accent-teal">
                  {cur}{p.amount.toFixed(2)}
                </td>
                <td className="py-2 text-right text-text-muted text-xs">
                  {p.type}
                </td>
              </tr>
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

export default DividendTable;