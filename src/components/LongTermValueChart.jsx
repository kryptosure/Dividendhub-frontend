import React, { useEffect, useRef, useState } from 'react';
import { getLongTermGrowth } from '../services/api';
import LoadingSpinner from './LoadingSpinner';
import { formatCurrency } from '../utils/formatters';
import ChartDataLabels from 'chartjs-plugin-datalabels';

const LongTermValueChart = ({ symbol, market }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Helper function to format large numbers into short form (K, M, B)
  const formatShortNumber = (num) => {
    if (!num || isNaN(num)) return '$0';
    if (num >= 1000000000) return '$' + (num / 1000000000).toFixed(1) + 'B';
    if (num >= 1000000) return '$' + (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return '$' + (num / 1000).toFixed(1) + 'K';
    return '$' + num.toFixed(0);
  };

  useEffect(() => {
    if (!symbol) return;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await getLongTermGrowth(symbol, market, 1000); 
        if (response && response.noDrip && response.drip) {
          setData(response);
        } else {
          setError('Invalid data received');
        }
      } catch (err) {
        setError('Failed to load long-term growth data.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [symbol, market]);

  useEffect(() => {
    if (!chartRef.current || !data) return;

    let isMounted = true;
    const ctx = chartRef.current.getContext('2d');
    const labels = ['1 Year Ago', '5 Years Ago', '10 Years Ago', '20 Years Ago', '30 Years Ago'];
    const noDripValues = data.noDrip;
    const dripValues = data.drip;

    if (chartInstance.current) {
      chartInstance.current.destroy();
      chartInstance.current = null;
    }

    import('chart.js/auto').then(({ default: Chart }) => {
      if (!isMounted || !chartRef.current) return;

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
            { label: 'Pure Capital Value (No DRIP)', data: noDripValues, backgroundColor: g1, borderColor: '#3b82f6', borderWidth: 1, borderRadius: 6 },
            { label: 'Total Return (With DRIP)', data: dripValues, backgroundColor: g2, borderColor: '#10b981', borderWidth: 1, borderRadius: 6 }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { labels: { color: '#94a3b8', font: { weight: '600', size: 11 } } },
            tooltip: { 
              backgroundColor: '#0a0e1a', 
              callbacks: { 
                label: (context) => ` ${context.dataset.label}: ${formatCurrency(context.raw, data.currencySymbol || '$')}` 
              } 
            },
            // ✅ UPDATED DATA LABELS CONFIGURATION (Vertical Text)
            datalabels: {
              anchor: 'end',
              align: 'end', // Aligns to the top end of the bar
              rotation: -90, // ✅ Rotates text bottom-to-top
              textAlign: 'center', // Centers the text vertically over the bar
              color: '#ffffff',
              font: { weight: 'normal', size: 10 }, // Cleaner, not bold
              formatter: (value) => {
                return formatShortNumber(value);
              }
            }
          },
          scales: {
            x: { grid: { display: false }, ticks: { color: '#94a3b8' } },
            y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#94a3b8', callback: (val) => formatShortNumber(val) } }
          }
        },
        plugins: [ChartDataLabels] 
      });
    });

    return () => { isMounted = false; if (chartInstance.current) { chartInstance.current.destroy(); chartInstance.current = null; } };
  }, [data]);

  return (
    <div className="bg-bg-surface border border-border/50 rounded-2xl p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="font-black tracking-tight text-lg text-text-primary">📊 Value of $1,000 Invested (1Y to 30Y)</h3>
        <p className="text-text-muted text-xs font-medium">Compare pure capital appreciation versus total return with dividend reinvestment.</p>
      </div>

      {isLoading && <div className="py-12 flex items-center justify-center"><LoadingSpinner /></div>}
      {error && <div className="py-4 text-center text-accent-red text-sm font-semibold">⚠️ {error}</div>}
      {!isLoading && !error && data && <div className="h-80 relative"><canvas ref={chartRef} /></div>}
      {!isLoading && !error && !data && <p className="text-text-muted text-xs font-medium text-center py-8">Select a stock to view its historical growth.</p>}
    </div>
  );
};

export default LongTermValueChart;