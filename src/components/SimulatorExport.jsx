import React from 'react';
import { downloadCSV, shareViaWhatsApp } from '../utils/exportUtils';
import { generatePDFReport } from '../utils/pdfExport';

const SimulatorExport = ({ result, symbol, currencySymbol, type }) => {
  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null || isNaN(amount) || amount === 0) return '—';
    return `${currencySymbol}${amount.toFixed(2)}`;
  };
  const formatNumber = (num) => {
    if (num === undefined || num === null || isNaN(num) || num === 0) return '—';
    return num.toFixed(2);
  };
  const formatPercent = (num) => {
    if (num === undefined || num === null || isNaN(num) || num === 0) return '—';
    return `${num.toFixed(2)}%`;
  };

  const exportCSV = () => {
    if (!result) return;
    let rows = [];
    if (type === 'single') {
      rows = [
        ['Metric', 'Value'],
        ['Current Value', formatCurrency(result.currentValue)],
        ['Invested Cost', formatCurrency(result.purchaseCost)],
        ['Capital Gains', formatCurrency(result.capitalGain)],
        ['Capital Gains %', formatPercent(result.capitalGainPct)],
        ['Dividend Gains', formatCurrency(result.totalDividendGain)],
        ['Dividend Count', result.dividendCount || 0],
        ['Net Gains', formatCurrency(result.netGain)],
        ['Net Gains %', formatPercent(result.netGainPct)],
        ['Total Return %', formatPercent(result.totalReturnPct)],
      ];
      if (result.reinvest) {
        rows.push(['DRIP Final Shares', formatNumber(result.reinvest.finalShares)]);
        rows.push(['DRIP Final Value', formatCurrency(result.reinvest.finalValue)]);
        rows.push(['DRIP Extra Value', formatCurrency(result.reinvest.extraValue)]);
        rows.push(['DRIP Total Return %', formatPercent(result.reinvest.totalReturnPct)]);
      }
    } else {
      rows = [
        ['Metric', 'Value'],
        ['Total Invested', formatCurrency(result.totalInvested)],
        ['Shares (no DRIP)', formatNumber(result.sharesNoDRIP)],
        ['Current Value (no DRIP)', formatCurrency(result.currentValueNoDRIP)],
        ['Dividends Collected', formatCurrency(result.totalDividendsNoDRIP)],
        ['DRIP Final Shares', formatNumber(result.sharesDRIP)],
        ['DRIP Current Value', formatCurrency(result.currentValueDRIP)],
        ['DRIP Total Return %', formatPercent(result.totalReturnDRIP || 0)],
      ];
    }
    const csvContent = rows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${symbol}_${type}_simulation_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = async () => {
    if (!result) return;
    const hasData = type === 'single' ? (result.quantity > 0 && result.purchaseCost > 0) : (result.totalInvested > 0);
    if (!hasData) {
      alert('⚠️ No calculation parameters present to dump to document layers.');
      return;
    }

    try {
      let kpis = [];
      let tables = [];

      if (type === 'single') {
        kpis = [
          { label: 'Current Value', value: formatCurrency(result.currentValue) },
          { label: 'Invested Cost', value: formatCurrency(result.purchaseCost) },
          { label: 'Net Gains', value: result.netGain ? `${result.netGain >= 0 ? '+' : ''}${formatCurrency(result.netGain)} (${formatPercent(result.netGainPct)})` : '—' },
          { label: 'Total Return', value: formatPercent(result.totalReturnPct) },
          { label: 'Dividend Gains', value: formatCurrency(result.totalDividendGain) },
          { label: 'Dividend Count', value: result.dividendCount || '—' },
        ];
        if (result.reinvest) {
          kpis.push(
            { label: 'DRIP Final Value', value: formatCurrency(result.reinvest.finalValue) },
            { label: 'DRIP Return', value: formatPercent(result.reinvest.totalReturnPct) }
          );
        }
        const summaryRows = [
          ['Current Price', formatCurrency(result.currentPrice)],
          ['Buy Price', formatCurrency(result.buyPrice)],
          ['Quantity', result.quantity || '—'],
          ['Shares Today', result.sharesToday ? formatNumber(result.sharesToday) : (result.quantity || '—')],
        ];
        tables = [{ title: 'Investment Summary', headers: ['Metric', 'Value'], rows: summaryRows }];
      } else {
        kpis = [
          { label: 'Total Invested', value: formatCurrency(result.totalInvested) },
          { label: 'Current Value (no DRIP)', value: formatCurrency(result.currentValueNoDRIP) },
          { label: 'Dividends Collected', value: formatCurrency(result.totalDividendsNoDRIP) },
          { label: 'DRIP Final Value', value: formatCurrency(result.currentValueDRIP) },
          { label: 'DRIP Return', value: formatPercent(result.totalReturnDRIP || 0) },
          { label: 'Shares (DRIP)', value: formatNumber(result.sharesDRIP) },
        ];
        if (result.schedule && result.schedule.length > 0) {
          tables = [{
            title: 'Monthly Contributions',
            headers: ['Date', 'Amount', 'Price', 'Shares (no DRIP)'],
            rows: result.schedule.map(item => [
              item.date || '',
              formatCurrency(item.amount),
              formatCurrency(item.price),
              formatNumber(item.sharesNoDRIP),
            ])
          }];
        }
      }

      await generatePDFReport({
        title: `${symbol} ${type === 'single' ? 'One-Time' : 'DCA'} Matrix Simulation`,
        subtitle: `Generated via DividendBro Hub Engine Layers`,
        kpis,
        tables,
        currencySymbol,
        filename: `${symbol}_${type}_simulation`,
      });
    } catch (error) {
      console.error('PDF Module error:', error);
    }
  };

  return (
    <div className="flex flex-wrap gap-2 mt-4 text-xs font-bold">
      <button onClick={exportCSV} className="px-3.5 py-2 bg-bg-surface border border-border/60 hover:bg-bg-surface-hover rounded-xl text-text-secondary transition-all shadow-sm">📊 CSV</button>
      <button onClick={exportPDF} className="px-3.5 py-2 bg-bg-surface border border-border/60 hover:bg-bg-surface-hover rounded-xl text-text-secondary transition-all shadow-sm">📄 PDF</button>
      <button onClick={() => shareViaWhatsApp(`Reviewing my ${symbol} ${type} yields models data on DividendBro!`)} className="px-3.5 py-2 bg-accent-green/5 border border-accent-green/20 hover:bg-accent-green/10 text-accent-green rounded-xl transition-all shadow-sm">📤 Share</button>
    </div>
  );
};

export default SimulatorExport;
