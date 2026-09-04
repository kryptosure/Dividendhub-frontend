import React from 'react';
import { downloadCSV, shareViaWhatsApp } from '../utils/exportUtils';
import { generatePDFReport } from '../utils/pdfExport';

const SimulatorExport = ({ result, symbol, currencySymbol, type }) => {
  // --- DEBUG: log the result when component renders ---
  console.log(`📊 SimulatorExport (${type}) received result:`, result);

  // Helper formatters – return '—' for invalid values
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

  // ----- CSV -----
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
      // DCA
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

  // ----- PDF -----
  const exportPDF = async () => {
    if (!result) {
      alert('No simulation result to export. Please run the simulation first.');
      return;
    }

    // Check if there's actual investment data
    const hasData = (type === 'single') 
      ? (result.quantity > 0 && result.purchaseCost > 0)
      : (result.totalInvested > 0);

    // If no data, show a clear message
    if (!hasData) {
      alert('⚠️ The simulation did not produce any data.\n\nPlease make sure:\n- You entered a valid purchase date/start date\n- You entered a positive quantity/amount\n- The stock symbol is correct\n\nCheck the browser console for errors.');
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
        } else {
          tables = [{ title: 'Schedule', headers: ['Status'], rows: [['No contribution schedule available.']] }];
        }
      }

      await generatePDFReport({
        title: `${symbol} ${type === 'single' ? 'One-Time Investment' : 'DCA'} Simulation`,
        subtitle: `Generated by DividendBro • ${type === 'single' ? 'One-Time' : 'Monthly'} Investment`,
        kpis,
        tables,
        currencySymbol,
        filename: `${symbol}_${type}_simulation`,
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      alert(`Failed to generate PDF: ${error.message || 'Unknown error'}`);
    }
  };

  // ----- WhatsApp Share -----
  const shareWhatsApp = () => {
    if (!result) {
      alert('No simulation result to share. Please run the simulation first.');
      return;
    }
    let message = `📊 *DividendBro ${type === 'single' ? 'One-Time' : 'DCA'} Simulation* for *${symbol}*\n\n`;
    if (type === 'single') {
      message += `• Current Value: ${formatCurrency(result.currentValue)}\n`;
      message += `• Invested Cost: ${formatCurrency(result.purchaseCost)}\n`;
      message += `• Net Gains: ${formatCurrency(result.netGain)} (${formatPercent(result.netGainPct)})\n`;
      if (result.reinvest) {
        message += `• DRIP Value: ${formatCurrency(result.reinvest.finalValue)}\n`;
        message += `• DRIP Return: ${formatPercent(result.reinvest.totalReturnPct)}\n`;
      }
    } else {
      message += `• Total Invested: ${formatCurrency(result.totalInvested)}\n`;
      message += `• Current Value (no DRIP): ${formatCurrency(result.currentValueNoDRIP)}\n`;
      message += `• Dividends Collected: ${formatCurrency(result.totalDividendsNoDRIP)}\n`;
      message += `• DRIP Value: ${formatCurrency(result.currentValueDRIP)}\n`;
      message += `• DRIP Return: ${formatPercent(result.totalReturnDRIP || 0)}\n`;
    }
    message += `\n🔗 View full details: dividendbro.com`;
    shareViaWhatsApp(message);
  };

  // If no result, show disabled buttons
  if (!result) {
    return (
      <div className="flex flex-wrap gap-2 mt-4">
        <button className="px-3 py-1.5 text-xs bg-bg-secondary border border-border rounded-full opacity-50 cursor-not-allowed">
          📊 CSV
        </button>
        <button className="px-3 py-1.5 text-xs bg-bg-secondary border border-border rounded-full opacity-50 cursor-not-allowed">
          📄 PDF
        </button>
        <button className="px-3 py-1.5 text-xs bg-bg-secondary border border-border rounded-full opacity-50 cursor-not-allowed">
          📤 WhatsApp
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2 mt-4">
      <button
        onClick={exportCSV}
        className="text-xs px-3 py-1.5 bg-bg-secondary border border-border rounded-full hover:bg-bg-surface-hover transition flex items-center gap-1"
      >
        📊 CSV
      </button>
      <button
        onClick={exportPDF}
        className="text-xs px-3 py-1.5 bg-bg-secondary border border-border rounded-full hover:bg-bg-surface-hover transition flex items-center gap-1"
      >
        📄 PDF
      </button>
      <button
        onClick={shareWhatsApp}
        className="text-xs px-3 py-1.5 bg-accent-green/10 border border-accent-green/30 rounded-full hover:bg-accent-green/20 transition flex items-center gap-1 text-accent-green"
      >
        📤 WhatsApp
      </button>
    </div>
  );
};

export default SimulatorExport;