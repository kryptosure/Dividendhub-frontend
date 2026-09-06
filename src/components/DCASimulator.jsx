import React, { useState, useEffect, useRef } from 'react';
import { simulateDCA } from '../services/api';
import useStore from '../store/useStore';
import LoadingSpinner from './LoadingSpinner';
import { formatCurrency, formatNumber, formatPercent } from '../utils/formatters';
import DatePicker from './DatePicker';
import SimulatorExport from './SimulatorExport';

const DCASimulator = ({ symbol, market }) => {
  const [amount, setAmount] = useState('');
  const [startDate, setStartDate] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const currencySymbol = useStore(state => state.currency === 'sgd' ? 'S$' : '$');
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || !startDate || !symbol) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await simulateDCA(symbol, parseFloat(amount), startDate, market);
      setResult(data);
    } catch (err) {
      setError(err.message || 'Failed to simulate DCA');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!result || !result.schedule || result.schedule.length === 0) {
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
      return;
    }

    let isMounted = true;
    const schedule = result.schedule;
    const totalMonths = schedule.length;
    let groupBy = 'monthly';
    if (totalMonths > 120) groupBy = 'yearly';
    else if (totalMonths > 60) groupBy = 'quarterly';

    const groups = {};
    const getGroupKey = (dateStr, groupType) => {
      const d = new Date(dateStr + 'T00:00:00Z');
      if (groupType === 'yearly') return `${d.getUTCFullYear()}`;
      if (groupType === 'quarterly') return `${d.getUTCFullYear()}-Q${Math.ceil((d.getUTCMonth() + 1) / 3)}`;
      return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
    };

    const getLabel = (dateStr, groupType) => {
      const d = new Date(dateStr + 'T00:00:00Z');
      if (groupType === 'yearly') return `${d.getUTCFullYear()}`;
      if (groupType === 'quarterly') return `Q${Math.ceil((d.getUTCMonth() + 1) / 3)} ${d.getUTCFullYear()}`;
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${months[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
    };

    for (const item of schedule) {
      const key = getGroupKey(item.date, groupBy);
      if (!groups[key]) {
        groups[key] = { label: getLabel(item.date, groupBy), invested: 0, value: 0 };
      }
      groups[key].invested += item.amount;
      groups[key].value = (item.sharesDRIP || item.sharesNoDRIP) * item.price;
    }

    const sortedKeys = Object.keys(groups).sort();
    const labels = sortedKeys.map(k => groups[k].label);
    const investedData = sortedKeys.map(k => groups[k].invested);
    const valueData = sortedKeys.map(k => groups[k].value);
    const growthData = sortedKeys.map((k, i) => Math.max(0, valueData[i] - investedData[i]));

    import('chart.js/auto').then(({ default: Chart }) => {
      if (!isMounted || !chartRef.current) return;
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const ctx = chartRef.current.getContext('2d');
      const g1 = ctx.createLinearGradient(0, 0, 0, 300);
      g1.addColorStop(0, '#3b82f6');
      g1.addColorStop(1, '#3b82f620');

      const g2 = ctx.createLinearGradient(0, 0, 0, 300);
      g2.addColorStop(0, '#10b981');
      g2.addColorStop(1, '#10b98120');

      chartInstance.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            { label: 'Invested Principal', data: investedData, backgroundColor: g1, borderRadius: 6, order: 2 },
            { label: 'Yield Growth Value', data: growthData, backgroundColor: g2, borderRadius: 6, order: 1 }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { labels: { color: '#94a3b8', font: { weight: '600', size: 11 } } }
          },
          scales: {
            x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 10 } } },
            y: { stacked: true, grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#94a3b8' } }
          }
        }
      });
    });

    return () => {
      isMounted = false;
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, [result, currencySymbol]);

  return (
    <div className="bg-bg-surface border border-border/50 rounded-2xl p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="font-black tracking-tight text-lg text-text-primary">📊 Regular Investment DCA Simulator</h3>
        <p className="text-text-muted text-xs font-medium">Test regular capital expansion alongside automated yield reinvestment streams.</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end bg-bg-primary/40 border border-border/30 p-4 rounded-xl mb-6">
        <div>
          <label className="block text-[10px] uppercase text-text-muted font-bold tracking-widest mb-1.5">Monthly Commitment</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 500"
            className="w-full bg-bg-secondary border border-border/60 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-4 focus:ring-accent-blue/5 focus:border-accent-blue focus:outline-none"
            min="1"
            required
          />
        </div>
        <div>
          <label className="block text-[10px] uppercase text-text-muted font-bold tracking-widest mb-1.5">Date of purchase</label>
          <DatePicker value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
        </div>
        <button
          type="submit"
          className="w-full py-3 bg-gradient-to-r from-accent-blue to-accent-teal hover:opacity-95 text-white font-bold text-xs tracking-wider uppercase rounded-xl transition-all active:scale-[0.99] disabled:opacity-40"
          disabled={loading}
        >
          {loading ? 'Processing Model...' : 'Simulate Matrix'}
        </button>
      </form>

      {error && <div className="bg-accent-red/5 border border-accent-red/20 rounded-xl p-4 text-xs font-semibold text-accent-red mb-4">⚠️ {error}</div>}

      {result && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-bg-secondary/60 border border-border/40 rounded-xl p-4">
              <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Net Principal</span>
              <div className="text-xl font-black text-text-primary mt-1">{formatCurrency(result.totalInvested, currencySymbol)}</div>
            </div>
            <div className="bg-bg-secondary/60 border border-border/40 rounded-xl p-4">
              <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Baseline Yield Value</span>
              <div className="text-xl font-black text-text-primary mt-1">{formatCurrency(result.currentValueNoDRIP, currencySymbol)}</div>
            </div>
            <div className="bg-bg-secondary/60 border border-border/40 rounded-xl p-4">
              <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Dividends Captured</span>
              <div className="text-xl font-black text-accent-green mt-1">+{formatCurrency(result.totalDividendsNoDRIP, currencySymbol)}</div>
            </div>
            <div className="bg-bg-secondary/60 border border-border/40 rounded-xl p-4">
              <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Compounded Cash Value</span>
              <div className="text-xl font-black text-accent-teal mt-1">{formatCurrency(result.currentValueDRIP, currencySymbol)}</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-accent-teal/5 to-accent-blue/5 border border-accent-teal/10 rounded-xl p-4">
            <span className="text-[10px] text-accent-teal font-black uppercase tracking-widest">DRIP Optimization Vectors</span>
            <div className="grid grid-cols-3 gap-2 mt-3 text-center">
              <div>
                <span className="text-[11px] text-text-muted font-medium">Number of shares bought</span>
                <div className="text-base font-extrabold text-text-primary mt-0.5">{formatNumber(result.sharesDRIP, 2)}</div>
              </div>
              <div>
                <span className="text-[11px] text-text-muted font-medium">Total Return Matrix</span>
                <div className="text-base font-extrabold text-accent-green mt-0.5">
                  {formatPercent(result.totalReturnDRIP || ((result.currentValueDRIP - result.totalInvested) / result.totalInvested * 100))}
                </div>
              </div>
              <div>
                <span className="text-[11px] text-text-muted font-medium">Efficiency Index</span>
                <div className="text-base font-extrabold text-accent-blue mt-0.5">
                  +{formatPercent(((result.currentValueDRIP - result.currentValueNoDRIP) / result.currentValueNoDRIP) * 100)}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-bg-secondary/50 border border-border/40 rounded-xl p-4">
            <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Asset Compounding Projection</span>
            <div className="h-64 mt-4 relative"><canvas ref={chartRef} /></div>
          </div>

          <div className="border border-border/40 rounded-xl overflow-hidden bg-bg-secondary/20">
            <div className="px-4 py-3 border-b border-border/40 bg-bg-secondary/50">
              <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Ledger Schedule Breakdown</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-text-muted border-b border-border/20">
                    <th className="px-4 py-2 text-left">Date</th>
                    <th className="px-4 py-2 text-right">Input Principal</th>
                    <th className="px-4 py-2 text-right">Close Val</th>
                    <th className="px-4 py-2 text-right">Number of shares bought</th>
                  </tr>
                </thead>
                <tbody>
                  {result.schedule?.map((item, idx) => (
                    <tr key={idx} className="border-b border-border/10">
                      <td className="px-4 py-2">{item.date}</td>
                      <td className="px-4 py-2 text-right">{formatCurrency(item.amount, currencySymbol)}</td>
                      <td className="px-4 py-2 text-right">{formatCurrency(item.price, currencySymbol)}</td>
                      <td className="px-4 py-2 text-right">{formatNumber(item.sharesNoDRIP, 2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {result.schedule && result.schedule.length > 20 && (
              <div className="px-4 py-2 text-sm text-text-muted border-t border-border/20">
                Showing all {result.schedule.length} entries
              </div>
            )}
          </div>

          <SimulatorExport result={result} symbol={symbol} currencySymbol={currencySymbol} />
        </div>
      )}
    </div>
  );
};

export default DCASimulator;