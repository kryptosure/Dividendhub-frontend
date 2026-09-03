import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const DividendChart = ({ data }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (!chartRef.current || !data || !data.byYear || data.byYear.length === 0) return;

    const ctx = chartRef.current.getContext('2d');
    const sorted = [...data.byYear].sort((a, b) => a.year - b.year);
    const years = sorted.map(y => y.year);
    const values = sorted.map(y => y.total);

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, '#3b82f6');
    gradient.addColorStop(1, '#06b6d4');

    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: years,
        datasets: [{
          label: 'Dividend per share',
          data: values,
          backgroundColor: gradient,
          borderRadius: 4,
          maxBarThickness: 40,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => {
                const cur = data.currencySymbol || '$';
                return `${cur}${context.raw.toFixed(2)} / share`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(255,255,255,0.05)' },
            ticks: {
              callback: (value) => (data.currencySymbol || '$') + value.toFixed(2),
              color: '#94a3b8',
            }
          },
          x: {
            grid: { display: false },
            ticks: { color: '#94a3b8' }
          }
        }
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data]);

  if (!data || !data.byYear || data.byYear.length === 0) {
    return (
      <div className="bg-bg-surface border border-border rounded-xl p-4">
        <h3 className="font-bold text-lg mb-2">Dividends by Year</h3>
        <p className="text-text-muted text-sm">No dividend data available for chart.</p>
      </div>
    );
  }

  return (
    <div className="bg-bg-surface border border-border rounded-xl p-4">
      <h3 className="font-bold text-lg mb-2">Dividends by Year</h3>
      <div className="h-64">
        <canvas ref={chartRef}></canvas>
      </div>
    </div>
  );
};

export default DividendChart;