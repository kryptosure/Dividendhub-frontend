import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { getBatchStocks } from '../services/api';
import useStore from '../store/useStore';
import LoadingSpinner from '../components/LoadingSpinner';
import EditHoldingModal from './EditHoldingModal';
import { formatCurrency, formatNumber, formatPercent } from '../utils/formatters';

function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getUTCDay();
  const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1);
  d.setUTCDate(diff);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

async function fetchExchangeRate() {
  try {
    const resp = await fetch('https://exchangerate-api.com');
    const data = await resp.json();
    return data.rates.SGD;
  } catch {
    return 1.35;
  }
}

function getFutureEstimates(dividendData, shares, currency, exchangeRate) {
  if (!dividendData || !dividendData.byYear || dividendData.byYear.length === 0) return null;
  const payouts = [];
  for (const yearObj of dividendData.byYear) {
    if (yearObj.payouts) {
      for (const p of yearObj.payouts) {
        payouts.push({ date: p.date, amount: p.amount });
      }
    }
  }
  if (payouts.length < 2) return null;
  payouts.sort((a, b) => a.date.localeCompare(b.date));
  let totalDays = 0, intervals = 0;
  for (let i = 1; i < payouts.length; i++) {
    const days = Math.round((new Date(payouts[i].date) - new Date(payouts[i-1].date)) / (1000 * 60 * 60 * 24));
    if (days > 0 && days < 400) {
      totalDays += days;
      intervals++;
    }
  }
  if (intervals === 0) return null;
  const avgInterval = Math.round(totalDays / intervals);
  const lastDate = new Date(payouts[payouts.length-1].date + 'T00:00:00Z');
  const lastAmount = payouts[payouts.length-1].amount;
  const recentAmounts = payouts.slice(-3).map(p => p.amount);
  const avgAmount = recentAmounts.reduce((a, b) => a + b, 0) / recentAmounts.length;
  const futureDates = [];
  let currentDate = new Date(lastDate);
  let totalProjected = 0;
  const maxDays = 90;
  while (totalProjected < maxDays) {
    currentDate.setDate(currentDate.getDate() + avgInterval);
    totalProjected += avgInterval;
    const estAmount = avgAmount || lastAmount;
    let amountInBase = estAmount * shares;
    const baseCurrencyCode = currency.toUpperCase();
    const rate = exchangeRate || 1.35;
    const origCurrency = dividendData.currency || 'USD';
    if (origCurrency === 'USD' && baseCurrencyCode === 'SGD') {
      amountInBase = amountInBase * rate;
    } else if (origCurrency === 'SGD' && baseCurrencyCode === 'USD') {
      amountInBase = amountInBase / rate;
    }
    futureDates.push({
      date: currentDate.toISOString().slice(0, 10),
      amount: amountInBase,
      shares: shares,
      perShare: estAmount,
    });
  }
  return futureDates;
}

const PortfolioView = () => {
  const { portfolio, market, currency, removeFromPortfolio, updatePortfolioItem } = useStore();
  const [view, setView] = useState('holdings');
  const [exchangeRate, setExchangeRate] = useState(null);
  const [editingHolding, setEditingHolding] = useState(null);
  const [expandedRows, setExpandedRows] = useState({});
  const symbols = portfolio.map(item => item.symbol);
  const portfolioRef = useRef(null);

  // Currency symbol for display
  const curSymbol = currency === 'sgd' ? 'S$' : '$';

  useEffect(() => {
    const getRate = async () => {
      const rate = await fetchExchangeRate();
      setExchangeRate(rate);
    };
    getRate();
  }, [currency]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['portfolio', symbols, market],
    queryFn: () => getBatchStocks(symbols, market),
    enabled: symbols.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  const holdingsWithData = useMemo(() => {
    if (!data || !exchangeRate) return [];
    const holdings = data.filter(r => !r.error && r.data);
    const baseCurrencyCode = currency.toUpperCase();
    const rate = exchangeRate || 1.35;

    return holdings.map(r => {
      const portfolioItem = portfolio.find(p => p.symbol === r.symbol);
      const shares = portfolioItem?.shares || 1;
      const purchasePrice = portfolioItem?.purchasePrice || null;
      const purchaseDate = portfolioItem?.purchaseDate || null;
      const price = r.data.currentPrice || 0;
      const yieldPct = r.data.currentYield || 0;
      const origCurrency = r.data.currency || (r.market === 'sg' ? 'SGD' : 'USD');
      
      let priceInBase = price;
      let annualIncomePerShare = (yieldPct / 100) * price;
      let annualIncomeInBase = annualIncomePerShare * shares;
      
      if (origCurrency === 'USD' && baseCurrencyCode === 'SGD') {
        priceInBase = price * rate;
        annualIncomeInBase = annualIncomePerShare * shares * rate;
      } else if (origCurrency === 'SGD' && baseCurrencyCode === 'USD') {
        priceInBase = price / rate;
        annualIncomeInBase = annualIncomePerShare * shares / rate;
      }
      
      const valueInBase = shares * priceInBase;
      const costBasis = purchasePrice ? shares * purchasePrice : valueInBase;
      const gain = valueInBase - costBasis;
      const gainPct = costBasis > 0 ? (gain / costBasis) * 100 : 0;

      let dividendIncome = 0;
      let dividendPayouts = [];
      const divData = r.data;
      if (divData && divData.byYear) {
        for (const yearObj of divData.byYear) {
          if (yearObj.payouts) {
            for (const payout of yearObj.payouts) {
              let amount = payout.amount * shares;
              if (origCurrency === 'USD' && baseCurrencyCode === 'SGD') {
                amount = amount * rate;
              } else if (origCurrency === 'SGD' && baseCurrencyCode === 'USD') {
                amount = amount / rate;
              }
              dividendIncome += amount;
              dividendPayouts.push({
                date: payout.date,
                amount: payout.amount,
                amountInBase: amount,
                year: yearObj.year,
                shares: shares
              });
            }
          }
        }
      }
      
      return {
        ...r,
        shares,
        purchasePrice,
        purchaseDate,
        priceOrig: price,
        priceInBase,
        valueInBase,
        costBasis,
        gain,
        gainPct,
        annualIncomeInBase,
        dividendIncome,
        dividendPayouts,
        yieldPct,
        origCurrency,
        currencySymbol: r.data.currencySymbol || (origCurrency === 'SGD' ? 'S$' : '$'),
        name: r.data.name || r.symbol,
        dividendData: r.data,
      };
    });
  }, [data, portfolio, currency, exchangeRate]);

  const totalValue = holdingsWithData.reduce((sum, h) => sum + h.valueInBase, 0);
  const totalCostBasis = holdingsWithData.reduce((sum, h) => sum + h.costBasis, 0);
  const totalGain = holdingsWithData.reduce((sum, h) => sum + h.gain, 0);
  const totalGainPct = totalCostBasis > 0 ? (totalGain / totalCostBasis) * 100 : 0;
  const totalAnnualDividend = holdingsWithData.reduce((sum, h) => sum + h.annualIncomeInBase, 0);
  const totalDividendIncome = holdingsWithData.reduce((sum, h) => sum + h.dividendIncome, 0);
  const avgYield = totalValue > 0 ? (totalAnnualDividend / totalValue) * 100 : 0;

  const futureExDates = useMemo(() => {
    if (!holdingsWithData.length) return [];
    const allFuture = [];
    for (const h of holdingsWithData) {
      const estimates = getFutureEstimates(h.dividendData, h.shares, currency, exchangeRate);
      if (estimates) {
        for (const est of estimates) {
          allFuture.push({
            date: est.date,
            amount: est.amount,
            symbol: h.symbol,
            name: h.name || h.symbol,
            perShare: est.perShare,
          });
        }
      }
    }
    allFuture.sort((a, b) => a.date.localeCompare(b.date));
    return allFuture;
  }, [holdingsWithData, currency, exchangeRate]);

  const incomeData = useMemo(() => {
    if (!holdingsWithData.length) return null;
    const now = new Date();
    const oneYearAgo = new Date(now);
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const quarterMap = {};
    const monthMap = {};
    const weekMap = {};

    for (const h of holdingsWithData) {
      const shares = h.shares;
      const divData = h.dividendData;
      if (divData && divData.byYear) {
        for (const yearObj of divData.byYear) {
          if (yearObj.payouts) {
            for (const payout of yearObj.payouts) {
              const date = new Date(payout.date + 'T00:00:00Z');
              if (date >= oneYearAgo && date <= now) {
                let amount = payout.amount * shares;
                const origCurrency = h.origCurrency;
                const baseCurrencyCode = currency.toUpperCase();
                const rate = exchangeRate || 1.35;
                if (origCurrency === 'USD' && baseCurrencyCode === 'SGD') {
                  amount = amount * rate;
                } else if (origCurrency === 'SGD' && baseCurrencyCode === 'USD') {
                  amount = amount / rate;
                }
                const q = Math.floor(date.getUTCMonth() / 3) + 1;
                const quarterKey = `Q${q} ${date.getUTCFullYear()}`;
                quarterMap[quarterKey] = (quarterMap[quarterKey] || 0) + amount;
                const monthKey = `${date.getUTCFullYear()}-${String(date.getUTCMonth()+1).padStart(2,'0')}`;
                monthMap[monthKey] = (monthMap[monthKey] || 0) + amount;
                const weekStart = getWeekStart(date);
                const weekKey = weekStart.toISOString().slice(0, 10);
                weekMap[weekKey] = (weekMap[weekKey] || 0) + amount;
              }
            }
          }
        }
      }
    }
    return { quarterMap, monthMap, weekMap };
  }, [holdingsWithData, currency, exchangeRate]);

  const toggleExpand = (symbol) => {
    setExpandedRows(prev => ({
      ...prev,
      [symbol]: !prev[symbol]
    }));
  };

  const handleEdit = (holding) => {
    setEditingHolding(holding);
  };

  const handleEditSave = (symbol, updatedData) => {
    updatePortfolioItem(symbol, updatedData);
    setEditingHolding(null);
  };

  // ---------- PDF Export ----------
  const handleExportPDF = async () => {
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF('p', 'mm', 'a4');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(10, 14, 26);
      doc.text('DividendBro Portfolio Audit', 15, 20);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      // FIXED: added backticks
      doc.text(`Generated Epoch: ${new Date().toLocaleDateString()} • Base: ${currency.toUpperCase()}`, 15, 26);
      doc.setDrawColor(226, 232, 240);
      doc.line(15, 32, 195, 32);

      // Render Dashboard Data Boxes
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('AGGREGATE BALANCES', 15, 42);
      doc.setFont('helvetica', 'normal');
      doc.text('Net Account Value:', 15, 50);
      doc.setFont('helvetica', 'bold');
      doc.text(formatCurrency(totalValue, curSymbol), 55, 50);
      doc.setFont('helvetica', 'normal');
      doc.text('Injected Capital Cost:', 15, 56);
      doc.setFont('helvetica', 'bold');
      doc.text(formatCurrency(totalCostBasis, curSymbol), 55, 56);
      doc.setFont('helvetica', 'normal');
      doc.text('Compound Performance:', 15, 62);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(totalGain >= 0 ? 16 : 239, totalGain >= 0 ? 185 : 68, totalGain >= 0 ? 129 : 68);
      doc.text(`${totalGain >= 0 ? '+' : ''}${formatCurrency(totalGain, curSymbol)} (${formatPercent(totalGainPct)})`, 55, 62);
      doc.setTextColor(10, 14, 26);
      doc.setFont('helvetica', 'normal');
      doc.text('Account Weighted Yield:', 115, 50);
      doc.setFont('helvetica', 'bold');
      doc.text(formatPercent(avgYield), 160, 50);
      doc.setFont('helvetica', 'normal');
      doc.text('Annual Revenue Output:', 115, 56);
      doc.setFont('helvetica', 'bold');
      doc.text(formatCurrency(totalAnnualDividend, curSymbol), 160, 56);
      doc.line(15, 70, 195, 70);

      // Holdings ledger
      doc.setFont('helvetica', 'bold');
      doc.text('ASSET POSITION INDEX', 15, 78);
      let verticalOffset = 88;
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text('Asset', 15, verticalOffset);
      doc.text('Shares', 60, verticalOffset);
      doc.text('Value', 85, verticalOffset);
      doc.text('Delta ROI', 115, verticalOffset);
      doc.text('Est. Yield', 145, verticalOffset);
      doc.text('Income Output', 170, verticalOffset);
      doc.line(15, verticalOffset + 2, 195, verticalOffset + 2);
      verticalOffset += 8;
      doc.setTextColor(10, 14, 26);
      holdingsWithData.forEach((row) => {
        if (verticalOffset > 270) {
          doc.addPage();
          verticalOffset = 20;
        }
        doc.setFont('helvetica', 'bold');
        doc.text(row.symbol, 15, verticalOffset);
        doc.setFont('helvetica', 'normal');
        const safeName = row.name.length > 22 ? row.name.slice(0, 20) + '...' : row.name;
        doc.text(safeName, 15, verticalOffset + 4, { maxWidth: 40 });
        doc.text(formatNumber(row.shares, 0), 60, verticalOffset);
        doc.text(formatCurrency(row.valueInBase, curSymbol), 85, verticalOffset);
        doc.text(`${row.gain >= 0 ? '+' : ''}${formatPercent(row.gainPct)}`, 115, verticalOffset);
        doc.text(formatPercent(row.yieldPct), 145, verticalOffset);
        doc.text(formatCurrency(row.annualIncomeInBase, curSymbol), 170, verticalOffset);
        verticalOffset += 12;
      });
      doc.save(`DividendBro_Portfolio_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (error) {
      console.error('PDF export error:', error);
      alert('Failed to generate PDF.');
    }
  };

  // ---------- CSV Export ----------
  const getHoldingsCSV = () => {
    return holdingsWithData.map(h => ({
      Stock: h.name,
      Symbol: h.symbol,
      Shares: h.shares,
      'Purchase Price': h.purchasePrice || '—',
      'Current Price': h.priceInBase,
      Value: h.valueInBase,
      'Cost Basis': h.costBasis,
      Gain: h.gain,
      'Gain %': h.gainPct,
      Yield: h.yieldPct,
      'Dividend Income': h.dividendIncome,
    }));
  };

  const handleExportCSV = () => {
    const data = getHoldingsCSV();
    if (!data || data.length === 0) return;
    const headers = ['Stock','Symbol','Shares','Purchase Price','Current Price','Value','Cost Basis','Gain','Gain %','Yield','Dividend Income'];
    const headerRow = headers.join(',');
    const rows = data.map(row => {
      return headers.map(h => {
        const val = row[h] !== undefined ? row[h] : '';
        return `"${String(val).replace(/"/g, '""')}"`;
      }).join(',');
    });
    const csv = [headerRow, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `portfolio_holdings_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  // ---------- WhatsApp Share ----------
  const handleShare = () => {
    let message = '📊 DividendBro Portfolio Report\n\n';
    message += `📅 ${new Date().toLocaleDateString()}\n\n`;
    message += `• Total Value: *${formatCurrency(totalValue, curSymbol)}*\n`;
    message += `• Total Cost: *${formatCurrency(totalCostBasis, curSymbol)}*\n`;
    message += `• Total Gain: *${totalGain >= 0 ? '+' : ''}${formatCurrency(totalGain, curSymbol)} (${totalGainPct >= 0 ? '+' : ''}${formatPercent(totalGainPct)})*\n`;
    message += `• Portfolio Yield: *${formatPercent(avgYield)}*\n`;
    message += `• Dividend Income: *${formatCurrency(totalDividendIncome, curSymbol)}*\n`;
    message += `• Holdings: *${holdingsWithData.length} stocks*\n\n`;
    message += '🔗 View full report: https://dividendbro.com\n';
    message += '\nBuilt with ❤️ by DividendBro';
    // FIXED: correct WhatsApp URL
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  // ---------- Render ----------
  if (!symbols.length) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-bold">📭 Ledger Balance Clear</h2>
        <p className="text-text-muted">
          Your active portfolio ledger is completely empty. Search for security ticker assets
          and execute an integration link capture to verify returns.
        </p>
      </div>
    );
  }

  if (isLoading) return <LoadingSpinner />;
  if (error) {
    return (
      <div className="p-6 text-accent-red">
        🛑 Channel linkage failure across active indices: {error.message}
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>My Dividend Portfolio – Track Your Passive Income</title>
      </Helmet>
      <div className="p-6 space-y-6">
        {/* Core Metric Banner Board Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-bg-surface border border-border/50 rounded-2xl p-4 shadow-sm">
            <div className="text-sm text-text-muted">Account Balance</div>
            <div className="text-xl font-bold">{formatCurrency(totalValue, curSymbol)}</div>
          </div>
          <div className="bg-bg-surface border border-border/50 rounded-2xl p-4 shadow-sm">
            <div className="text-sm text-text-muted">Invested Costs</div>
            <div className="text-xl font-bold">{formatCurrency(totalCostBasis, curSymbol)}</div>
          </div>
          <div className={`bg-bg-surface border border-border/50 rounded-2xl p-4 shadow-sm flex flex-col justify-between ${totalGain >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
            <div className="text-sm text-text-muted">Capital Delta</div>
            <div className="text-xl font-bold">
              {totalGain >= 0 ? '+' : ''}{formatCurrency(totalGain, curSymbol)}
              <span className="text-sm ml-1">{totalGainPct >= 0 ? '+' : ''}{formatPercent(totalGainPct)}</span>
            </div>
          </div>
          <div className="bg-bg-surface border border-border/50 rounded-2xl p-4 shadow-sm">
            <div className="text-sm text-text-muted">Weighted Yield</div>
            <div className="text-xl font-bold">{formatPercent(avgYield)}</div>
            <div className="text-sm text-text-muted">Annual Income +{formatCurrency(totalAnnualDividend, curSymbol)}</div>
          </div>
        </div>

        {/* Workspace Operations Action Control Strip Bar */}
        <div className="flex flex-wrap gap-2 items-center border-b border-border/20 pb-4">
          <button
            className={`px-4 py-2 rounded-lg transition-all ${view === 'holdings' ? 'bg-bg-secondary text-text-primary border border-border/20 shadow-sm' : 'text-text-muted hover:text-text-primary'}`}
            onClick={() => setView('holdings')}
          >
            📋 Positions
          </button>
          <button
            className={`px-4 py-2 rounded-lg transition-all ${view === 'income' ? 'bg-bg-secondary text-text-primary border border-border/20 shadow-sm' : 'text-text-muted hover:text-text-primary'}`}
            onClick={() => setView('income')}
          >
            💰 Income Flows
          </button>
          <button
            className={`px-4 py-2 rounded-lg transition-all ${view === 'calendar' ? 'bg-bg-secondary text-text-primary border border-border/20 shadow-sm' : 'text-text-muted hover:text-text-primary'}`}
            onClick={() => setView('calendar')}
          >
            📅 Schedule
          </button>
          <button className="px-4 py-2 rounded-lg bg-bg-secondary text-text-primary border border-border/20 shadow-sm" onClick={handleExportCSV}>
            📊 CSV
          </button>
          <button className="px-4 py-2 rounded-lg bg-bg-secondary text-text-primary border border-border/20 shadow-sm" onClick={handleExportPDF}>
            📄 PDF
          </button>
          <button className="px-4 py-2 rounded-lg bg-bg-secondary text-text-primary border border-border/20 shadow-sm" onClick={handleShare}>
            📤 WhatsApp
          </button>
        </div>

        {/* View Component Blocks Routing Section */}
        {view === 'holdings' && (
          <div className="space-y-4">
            {holdingsWithData.map((h) => (
              <div key={h.symbol} className="bg-bg-surface border border-border/50 rounded-2xl p-4 shadow-sm">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-bold text-lg">{h.symbol}</span>
                    <span className="text-sm text-text-muted ml-2">{h.name}</span>
                  </div>
                  <button
                    className="text-text-muted hover:text-text-primary"
                    onClick={() => toggleExpand(h.symbol)}
                  >
                    {expandedRows[h.symbol] ? '▲' : '▼'}
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 text-sm">
                  <div>
                    <span className="text-text-muted">Shares</span>
                    <div className="font-medium">{formatNumber(h.shares, 0)}</div>
                  </div>
                  <div>
                    <span className="text-text-muted">Avg Cost</span>
                    <div className="font-medium">{h.purchasePrice ? formatCurrency(h.purchasePrice, curSymbol) : '—'}</div>
                  </div>
                  <div>
                    <span className="text-text-muted">Close Market</span>
                    <div className="font-medium">{formatCurrency(h.priceInBase, curSymbol)}</div>
                  </div>
                  <div>
                    <span className="text-text-muted">Current Value</span>
                    <div className="font-medium">{formatCurrency(h.valueInBase, curSymbol)}</div>
                  </div>
                  <div>
                    <span className="text-text-muted">Gains Matrix</span>
                    <div className={`font-medium ${h.gain >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
                      {h.gain >= 0 ? '+' : ''}{formatCurrency(h.gain, curSymbol)} ({h.gainPct >= 0 ? '+' : ''}{formatPercent(h.gainPct)})
                    </div>
                  </div>
                  <div>
                    <span className="text-text-muted">Yield</span>
                    <div className="font-medium">{formatPercent(h.yieldPct)}</div>
                  </div>
                  <div>
                    <span className="text-text-muted">Income Run</span>
                    <div className="font-medium">{formatCurrency(h.annualIncomeInBase, curSymbol)}</div>
                  </div>
                  <div>
                    <span className="text-text-muted">Actions</span>
                    <button className="text-xs text-accent-blue hover:underline" onClick={() => handleEdit(h)}>Edit</button>
                    <button className="text-xs text-accent-red hover:underline ml-2" onClick={() => removeFromPortfolio(h.symbol)}>Remove</button>
                  </div>
                </div>
                {expandedRows[h.symbol] && (
                  <div className="mt-4 border-t border-border/20 pt-4">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-text-muted">
                          <th className="px-4 py-2 text-left">Declaration Date</th>
                          <th className="px-4 py-2 text-left">Per Share Allocation</th>
                          <th className="px-4 py-2 text-left">Volume Base</th>
                          <th className="px-4 py-2 text-left">Net Cash Credit</th>
                        </tr>
                      </thead>
                      <tbody>
                        {h.dividendPayouts && h.dividendPayouts.length > 0 ? (
                          h.dividendPayouts.sort((a, b) => b.date.localeCompare(a.date)).map((p, i) => (
                            <tr key={i} className="border-b border-border/10">
                              <td className="px-4 py-2">{p.date}</td>
                              <td className="px-4 py-2">{formatCurrency(p.amount, curSymbol)}</td>
                              <td className="px-4 py-2">{formatNumber(p.shares, 0)}</td>
                              <td className="px-4 py-2">+{formatCurrency(p.amountInBase, curSymbol)}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="4" className="px-4 py-2 text-text-muted">No localized distribution matrix events recorded inside dynamic time frames.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {view === 'income' && incomeData && (
          <div className="space-y-6">
            {/* Quarterly */}
            <div className="bg-bg-surface border border-border/50 rounded-2xl p-4 shadow-sm">
              <h3 className="font-bold text-lg mb-2">Quarterly Realized Flux</h3>
              {Object.keys(incomeData.quarterMap).length === 0 ? (
                <p className="text-text-muted">No recorded movements.</p>
              ) : (
                <div className="space-y-2">
                  {Object.entries(incomeData.quarterMap).sort().map(([label, val]) => (
                    <div key={label} className="flex items-center gap-2">
                      <span className="w-20 text-sm">{label}</span>
                      <div className="flex-1 h-4 bg-bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-accent-blue rounded-full" style={{ width: `${(val / Math.max(...Object.values(incomeData.quarterMap))) * 100}%` }} />
                      </div>
                      <span className="text-sm font-medium">{formatCurrency(val, curSymbol)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Monthly */}
            <div className="bg-bg-surface border border-border/50 rounded-2xl p-4 shadow-sm">
              <h3 className="font-bold text-lg mb-2">Monthly Distributed Flow</h3>
              {Object.keys(incomeData.monthMap).length === 0 ? (
                <p className="text-text-muted">No recorded movements.</p>
              ) : (
                <div className="space-y-2">
                  {Object.entries(incomeData.monthMap).sort().slice(-6).map(([key, val]) => {
                    const [y, m] = key.split('-');
                    const name = new Date(y, m-1).toLocaleString('default', { month: 'short' });
                    return (
                      <div key={key} className="flex items-center gap-2">
                        <span className="w-20 text-sm">{name} {y}</span>
                        <div className="flex-1 h-4 bg-bg-secondary rounded-full overflow-hidden">
                          <div className="h-full bg-accent-teal rounded-full" style={{ width: `${(val / Math.max(...Object.values(incomeData.monthMap))) * 100}%` }} />
                        </div>
                        <span className="text-sm font-medium">{formatCurrency(val, curSymbol)}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Weekly */}
            <div className="bg-bg-surface border border-border/50 rounded-2xl p-4 shadow-sm">
              <h3 className="font-bold text-lg mb-2">Weekly Inflow Snapshot</h3>
              {Object.keys(incomeData.weekMap).length === 0 ? (
                <p className="text-text-muted">No recorded movements.</p>
              ) : (
                <div className="space-y-2">
                  {Object.entries(incomeData.weekMap).sort().slice(-6).map(([key, val]) => {
                    const label = new Date(key + 'T00:00:00Z').toLocaleDateString('default', { month: 'short', day: 'numeric' });
                    return (
                      <div key={key} className="flex items-center gap-2">
                        <span className="w-20 text-sm">W/C {label}</span>
                        <div className="flex-1 h-4 bg-bg-secondary rounded-full overflow-hidden">
                          <div className="h-full bg-accent-purple rounded-full" style={{ width: `${(val / Math.max(...Object.values(incomeData.weekMap))) * 100}%` }} />
                        </div>
                        <span className="text-sm font-medium">{formatCurrency(val, curSymbol)}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {view === 'calendar' && (
          <div className="bg-bg-surface border border-border/50 rounded-2xl p-4 shadow-sm">
            <h3 className="font-bold text-lg mb-2">Upcoming Ex-Dividend Timelines (90-Day Outlook)</h3>
            {futureExDates.length === 0 ? (
              <p className="text-text-muted">No estimated future distribution events found matching active records profile vectors.</p>
            ) : (
              <div className="space-y-2">
                {futureExDates.slice(0, 12).map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <span className="font-medium">{item.name}</span>
                    <span className="text-text-muted">{item.symbol}</span>
                    <span className="text-text-muted">{item.date}</span>
                    <span className="text-accent-green ml-auto">+{formatCurrency(item.amount, curSymbol)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {editingHolding && (
        <EditHoldingModal
          isOpen={!!editingHolding}
          onClose={() => setEditingHolding(null)}
          onSave={handleEditSave}
          holding={editingHolding}
          currencySymbol={curSymbol}
        />
      )}
    </>
  );
};

export default PortfolioView;