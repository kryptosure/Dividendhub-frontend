import React, { useState, useEffect, useRef } from 'react';
import { simulateDCA } from '../services/api';
import useStore from '../store/useStore';
import LoadingSpinner from './LoadingSpinner';
import { formatCurrency, formatNumber, formatPercent } from '../utils/formatters';
import Chart from 'chart.js/auto';
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
    console.log('DCASimulator called with:', { symbol, market, amount: parseFloat(amount), startDate });
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await simulateDCA(symbol, parseFloat(amount), startDate, market);
      console.log('✅ DCA Result received:', data);
      setResult(data);
    } catch (err) {
      console.error('DCA error:', err);
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

    const schedule = result.schedule;
    const totalMonths = schedule.length;
    let groupBy = 'monthly';
    if (totalMonths > 120) groupBy = 'yearly';
    else if (totalMonths > 60) groupBy = 'quarterly';

    const groups = {};
    const getGroupKey = (dateStr, groupType) => {
      const d = new Date(dateStr + 'T00:00:00Z');
      const year = d.getUTCFullYear();
      const month = d.getUTCMonth() + 1;
      if (groupType === 'yearly') return `${year}`;
      if (groupType === 'quarterly') {
        const quarter = Math.ceil(month / 3);
        return `${year}-Q${quarter}`;
      }
      return `${year}-${String(month).padStart(2, '0')}`;
    };

    const getLabel = (dateStr, groupType) => {
      const d = new Date(dateStr + 'T00:00:00Z');
      const year = d.getUTCFullYear();
      const month = d.getUTCMonth() + 1;
      if (groupType === 'yearly') return `${year}`;
      if (groupType === 'quarterly') {
        const quarter = Math.ceil(month / 3);
        return `Q${quarter} ${year}`;
      }
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${monthNames[month-1]} ${year}`;
    };

    for (const item of schedule) {
      const key = getGroupKey(item.date, groupBy);
      if (!groups[key]) {
        groups[key] = {
          label: getLabel(item.date, groupBy),
          invested: 0,
          value: 0,
          date: item.date,
        };
      }
      groups[key].invested += item.amount;
      const shares = item.sharesDRIP || item.sharesNoDRIP;
      const price = item.price;
      groups[key].value = shares * price;
    }

    const sortedKeys = Object.keys(groups).sort();
    const labels = sortedKeys.map(k => groups[k].label);
    const investedData = sortedKeys.map(k => groups[k].invested);
    const valueData = sortedKeys.map(k => groups[k].value);
    const growthData = sortedKeys.map((k, i) => valueData[i] - investedData[i]);

    if (chartInstance.current) {
      chartInstance.current.destroy();
      chartInstance.current = null;
    }

    if (!chartRef.current) return;

    const ctx = chartRef.current.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, '#3b82f6');
    gradient.addColorStop(1, '#06b6d4');

    const gradientGrowth = ctx.createLinearGradient(0, 0, 0, 400);
    gradientGrowth.addColorStop(0, '#34d399');
    gradientGrowth.addColorStop(1, '#10b981');

    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Invested',
            data: investedData,
            backgroundColor: gradient,
            borderRadius: 4,
            order: 1,
          },
          {
            label: 'Growth',
            data: growthData,
            backgroundColor: gradientGrowth,
            borderRadius: 4,
            order: 2,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: '#94a3b8',
              font: { size: 12 },
              boxWidth: 12,
              boxHeight: 12,
            }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.dataset.label || '';
                const val = context.raw;
                return `${label}: ${formatCurrency(val, currencySymbol)}`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: '#94a3b8',
              font: { size: 10 },
              maxRotation: 45,
            }
          },
          y: {
            stacked: true,
            grid: { color: 'rgba(255,255,255,0.05)' },
            ticks: {
              color: '#94a3b8',
              callback: (value) => formatCurrency(value, currencySymbol, 0),
            }
          }
        }
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, [result, currencySymbol]);

  if (!symbol) {
    return (
      <div className="bg-bg-surface border border-border rounded-xl p-4">
        <h3 className="font-bold text-lg mb-2">📊 Regular Investment (DCA)</h3>
        <p className="text-text-muted text-sm">Search a stock first to run the simulation.</p>
      </div>
    );
  }

  return (
    <div className="bg-bg-surface border border-border rounded-xl p-4">
      <h3 className="font-bold text-lg mb-2">📊 Regular Investment (DCA)</h3>
      <p className="text-text-muted text-sm mb-3">
        Simulate investing a fixed amount every month from a start date.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-wrap gap-3 items-end mb-4">
        <div className="flex-1 min-w-[140px]">
          <label className="block text-xs uppercase text-text-muted font-semibold mb-1">
            Monthly Amount ({currencySymbol})
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 500"
            className="w-full bg-bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue"
            min="1"
            step="1"
            required
          />
        </div>
        <div className="flex-1 min-w-[140px]">
          <label className="block text-xs uppercase text-text-muted font-semibold mb-1">
            Start Date
          </label>
          <DatePicker
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="px-6 py-2 bg-gradient-to-r from-accent-blue to-accent-teal text-white font-semibold rounded-full hover:shadow-lg transition disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Simulating...' : 'Run Simulation'}
        </button>
      </form>

      {error && (
        <div className="bg-accent-red/10 border border-accent-red/20 rounded-lg p-3 text-accent-red text-sm mb-3">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-bg-secondary p-3 rounded-lg">
              <div className="text-xs uppercase text-text-muted">Total Invested</div>
              <div className="text-lg font-bold">
                {formatCurrency(result.totalInvested, currencySymbol)}
              </div>
            </div>
            <div className="bg-bg-secondary p-3 rounded-lg">
              <div className="text-xs uppercase text-text-muted">Shares (no DRIP)</div>
              <div className="text-lg font-bold">
                {formatNumber(result.sharesNoDRIP, 2)}
              </div>
            </div>
            <div className="bg-bg-secondary p-3 rounded-lg">
              <div className="text-xs uppercase text-text-muted">Current Value (no DRIP)</div>
              <div className="text-lg font-bold">
                {formatCurrency(result.currentValueNoDRIP, currencySymbol)}
              </div>
            </div>
            <div className="bg-bg-secondary p-3 rounded-lg">
              <div className="text-xs uppercase text-text-muted">Dividends Collected</div>
              <div className="text-lg font-bold text-accent-green">
                {formatCurrency(result.totalDividendsNoDRIP, currencySymbol)}
              </div>
            </div>
          </div>

          <div className="bg-bg-secondary p-3 rounded-lg">
            <div className="text-xs uppercase text-text-muted font-semibold mb-2">With Dividend Reinvestment (DRIP)</div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <div className="text-xs text-text-muted">Final Shares</div>
                <div className="font-bold">{formatNumber(result.sharesDRIP, 2)}</div>
              </div>
              <div>
                <div className="text-xs text-text-muted">Current Value</div>
                <div className="font-bold text-accent-green">
                  {formatCurrency(result.currentValueDRIP, currencySymbol)}
                </div>
              </div>
              <div>
                <div className="text-xs text-text-muted">Total Return (DRIP)</div>
                <div className="font-bold text-accent-green">
                  {formatPercent(result.totalReturnDRIP || ((result.currentValueDRIP - result.totalInvested) / result.totalInvested * 100))}
                </div>
              </div>
            </div>
          </div>

          {result.schedule && result.schedule.length > 0 && (
            <div className="bg-bg-secondary p-3 rounded-lg">
              <div className="text-xs uppercase text-text-muted font-semibold mb-2">Portfolio Growth</div>
              <div className="h-64">
                <canvas ref={chartRef}></canvas>
              </div>
              <p className="text-text-muted text-xs mt-2">
                * Stacked bars show invested amount (blue) and growth (green). Grouped by period.
              </p>
            </div>
          )}

          <div className="bg-bg-secondary p-3 rounded-lg">
            <div className="text-xs uppercase text-text-muted font-semibold mb-2">Investment Schedule</div>
            <div className="max-h-40 overflow-y-auto text-xs">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-1">Date</th>
                    <th className="text-right py-1">Amount</th>
                    <th className="text-right py-1">Price</th>
                    <th className="text-right py-1">Shares</th>
                  </tr>
                </thead>
                <tbody>
                  {result.schedule && result.schedule.map((item, idx) => (
                    <tr key={idx} className="border-b border-border/50">
                      <td className="py-1">{item.date}</td>
                      <td className="text-right">{formatCurrency(item.amount, currencySymbol)}</td>
                      <td className="text-right">{formatCurrency(item.price, currencySymbol)}</td>
                      <td className="text-right">{formatNumber(item.sharesNoDRIP, 4)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {result.splits && result.splits.length > 0 && (
            <div className="bg-bg-secondary p-3 rounded-lg">
              <div className="text-xs uppercase text-text-muted font-semibold mb-1">Stock Splits</div>
              <div className="text-xs text-text-muted">
                {result.splits.map((s, i) => (
                  <span key={i} className="inline-block mr-2">{s.date}: {s.ratio.toFixed(2)}x</span>
                ))}
              </div>
            </div>
          )}

          <div className="text-text-muted text-xs">
            * Simulation assumes investments are made on the first trading day of each month.
            Dividends are reinvested at the next trading day's closing price.
          </div>

          <SimulatorExport 
            result={result} 
            symbol={symbol} 
            currencySymbol={currencySymbol} 
            type="dca" 
          />
        </div>
      )}
    </div>
  );
};

export default DCASimulator;