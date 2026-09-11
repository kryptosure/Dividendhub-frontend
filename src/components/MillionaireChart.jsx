import React, { useEffect, useRef } from 'react';
import useStore from '../store/useStore';

const MillionaireChart = ({ withDripData, noDripData, target = 1000000, currencySymbol = '$' }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const theme = useStore(state => state.theme);

  useEffect(() => {
    if (!chartRef.current || !withDripData || withDripData.length === 0) return;

    let isMounted = true;
    const ctx = chartRef.current.getContext('2d');

    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    const mutedColor = isLight ? '#64748b' : '#94a3b8';
    const gridColor = isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.04)';

    if (chartInstance.current) {
      chartInstance.current.destroy();
      chartInstance.current = null;
    }

    const labels = withDripData.map(d => `Y${d.year}`);

    import('chart.js/auto').then(({ default: Chart }) => {
      if (!isMounted || !chartRef.current) return;

      const g1 = ctx.createLinearGradient(0, 0, 0, 320);
      g1.addColorStop(0, 'rgba(16, 185, 129, 0.25)');
      g1.addColorStop(1, 'rgba(16, 185, 129, 0)');

      const g2 = ctx.createLinearGradient(0, 0, 0, 320);
      g2.addColorStop(0, 'rgba(59, 130, 246, 0.2)');
      g2.addColorStop(1, 'rgba(59, 130, 246, 0)');

      chartInstance.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [
            {
              label: 'With DRIP',
              data: withDripData.map(d => d.portfolioValue),
              borderColor: '#10b981',
              backgroundColor: g1,
              borderWidth: 2.5,
              fill: true,
              tension: 0.35,
              pointRadius: 0,
              pointHoverRadius: 4,
            },
            {
              label: 'Without DRIP',
              data: noDripData.map(d => d.portfolioValue),
              borderColor: '#3b82f6',
              backgroundColor: g2,
              borderWidth: 2,
              fill: true,
              tension: 0.35,
              pointRadius: 0,
              pointHoverRadius: 4,
            },
            {
              label: '$1M Target',
              data: withDripData.map(() => target),
              borderColor: isLight ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.4)',
              borderWidth: 1.5,
              borderDash: [6, 6],
              fill: false,
              pointRadius: 0,
              pointHoverRadius: 0,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: 'index', intersect: false },
          plugins: {
            legend: {
              labels: {
                color: mutedColor,
                font: { weight: '600', size: 11 },
                usePointStyle: true,
                pointStyle: 'line',
              },
            },
            tooltip: {
              backgroundColor: '#0a0e1a',
              titleFont: { family: 'Inter', weight: '700' },
              bodyFont: { family: 'Inter' },
              callbacks: {
                label: (context) => {
                  const val = context.raw;
                  const label = context.dataset.label;
                  if (label === '$1M Target') return ` Target: ${currencySymbol}1.00M`;
                  if (val >= 1000000) return ` ${label}: ${currencySymbol}${(val / 1000000).toFixed(2)}M`;
                  if (val >= 1000) return ` ${label}: ${currencySymbol}${(val / 1000).toFixed(1)}K`;
                  return ` ${label}: ${currencySymbol}${val.toFixed(0)}`;
                },
              },
            },
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: {
                color: mutedColor,
                font: { size: 10 },
                maxTicksLimit: 10,
              },
            },
            y: {
              grid: { color: gridColor },
              ticks: {
                color: mutedColor,
                font: { size: 10 },
                callback: (val) => {
                  if (val >= 1000000) return currencySymbol + (val / 1000000).toFixed(1) + 'M';
                  if (val >= 1000) return currencySymbol + (val / 1000).toFixed(0) + 'K';
                  return currencySymbol + val;
                },
              },
            },
          },
        },
      });
    });

    return () => {
      isMounted = false;
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, [withDripData, noDripData, target, currencySymbol, theme]);

  return (
    <div className="h-80 relative">
      <canvas ref={chartRef} />
    </div>
  );
};

export default MillionaireChart;