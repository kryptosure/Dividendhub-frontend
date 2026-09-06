import React, { useEffect, useRef } from 'react';

const DividendChart = ({ data }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (!chartRef.current || !data || !data.byYear || data.byYear.length === 0) return;

    let isMounted = true;
    const ctx = chartRef.current.getContext('2d');
    const sorted = [...data.byYear].sort((a, b) => a.year - b.year);
    const years = sorted.map(y => y.year);
    const values = sorted.map(y => y.total);

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const gradient = ctx.createLinearGradient(0, 0, 0, 240);
    gradient.addColorStop(0, '#3b82f6');
    gradient.addColorStop(1, '#3b82f605');

    import('chart.js/auto').then(({ default: Chart }) => {
      if (!isMounted || !chartRef.current) return;
      
      chartInstance.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: years,
          datasets: [{
            label: 'Dividend Distribution',
            data: values,
            backgroundColor: gradient,
            borderColor: '#3b82f6',
            borderWidth: 1.5,
            borderRadius: 6,
            maxBarThickness: 32,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: '#0a0e1a',
              titleFont: { family: 'Inter', weight: '700' },
              bodyFont: { family: 'Inter' },
              callbacks: {
                label: (context) => ` ${data.currencySymbol || '$'}${context.raw.toFixed(2)} / position share`
              }
            }
          },
          scales: {
            y: {
              grid: { color: 'rgba(255,255,255,0.03)' },
              ticks: {
                callback: (val) => (data.currencySymbol || '$') + val.toFixed(2),
                color: '#94a3b8',
                font: { family: 'JetBrains Mono', size: 10 }
              }
            },
            x: {
              grid: { display: false },
              ticks: { color: '#94a3b8', font: { family: 'JetBrains Mono', size: 10 } }
            }
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
  }, [data]);

  if (!data || !data.byYear || data.byYear.length === 0) return null;

  return (
    <div className="bg-bg-surface border border-border/50 rounded-2xl p-5 shadow-sm">
      <h3 className="font-black tracking-tight text-lg text-text-primary mb-4">📈 Dividend Growth View</h3>
      <div className="h-60 relative">
        <canvas ref={chartRef} />
      </div>
    </div>
  );
};

export default DividendChart;