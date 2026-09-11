import React, { useEffect, useRef, useState } from 'react';
import { getLongTermGrowth } from '../services/api';
import useStore from '../store/useStore';
import LoadingSpinner from './LoadingSpinner';
import { formatCurrency } from '../utils/formatters';
import ChartDataLabels from 'chartjs-plugin-datalabels';

const LongTermValueChart = ({ symbol, market }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const theme = useStore(state => state.theme);

  // Short-form formatter (K/M/B)
  const formatShortNumber = (num) => {
    if (num === null || num === undefined || isNaN(num)) return 'N/A';
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

    // ✅ Use dynamic labels from backend, fall back to defaults
    const labels = (data.labels && data.labels.length > 0)
      ? data.labels.map(l => l === null ? '' : l)
      : ['1 Year Ago', '5 Years Ago', '10 Years Ago', '15 Years Ago', '20 Years Ago', '25 Years Ago', '30 Years Ago'];

    const noDripValues = data.noDrip;
    const dripValues = data.drip;

    // ✅ Theme-aware colors
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    const labelColor = isLight ? '#0f172a' : '#ffffff';
    const mutedColor = isLight ? '#64748b' : '#94a3b8';
    const gridColor = isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.04)';

    if (chartInstance.current) {
      chartInstance.current.destroy();
      chartInstance.current = null;
    }

    // ✅ Custom plugin: draw "Not Available" for null slots
    const naPlugin = {
      id: 'naPlugin',
      afterDraw(chart) {
        const { ctx, chartArea, scales } = chart;
        const xScale = scales.x;
        const dataset = chart.data.datasets[0];

        dataset.data.forEach((value, index) => {
          if (value === null || value === undefined) {
            const x = xScale.getPixelForValue(index);
            const y = chartArea.bottom - 15;
            ctx.save();
            ctx.font = '600 11px Inter, system-ui, sans-serif';
            ctx.fillStyle = mutedColor;
            ctx.textAlign = 'center';
            ctx.fillText('Not Available', x, y);
            ctx.restore();
          }
        });
      }
    };

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
            {
              label: 'Pure Capital Value (No DRIP)',
              data: noDripValues,
              backgroundColor: g1,
              borderColor: '#3b82f6',
              borderWidth: 1,
              borderRadius: 6,
            },
            {
              label: 'Total Return (With DRIP)',
              data: dripValues,
              backgroundColor: g2,
              borderColor: '#10b981',
              borderWidth: 1,
              borderRadius: 6,
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          layout: { padding: { bottom: 20 } },
          plugins: {
            legend: {
              labels: { color: mutedColor, font: { weight: '600', size: 11 } }
            },
            tooltip: {
              backgroundColor: '#0a0e1a',
              titleFont: { family: 'Inter', weight: '700' },
              bodyFont: { family: 'Inter' },
              callbacks: {
                label: (context) => {
                  if (context.raw === null || context.raw === undefined) {
                    return ` ${context.dataset.label}: Not Available`;
                  }
                  return ` ${context.dataset.label}: ${formatCurrency(context.raw, data.currencySymbol || '$')}`;
                }
              }
            },
            datalabels: {
              anchor: 'end',
              align: 'end',
              rotation: -90,
              textAlign: 'center',
              color: labelColor,
              font: { weight: 'normal', size: 10 },
              formatter: (value) => {
                if (value === null || value === undefined) return '';
                return formatShortNumber(value);
              }
            }
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: {
                color: mutedColor,
                font: { size: 10 },
                maxRotation: 45,
                minRotation: 0,
                autoSkip: false,
              }
            },
            y: {
              grid: { color: gridColor },
              ticks: {
                color: mutedColor,
                callback: (val) => formatShortNumber(val)
              }
            }
          }
        },
        plugins: [ChartDataLabels, naPlugin]
      });
    });

    return () => {
      isMounted = false;
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, [data, theme]);

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