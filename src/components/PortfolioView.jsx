import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { getBatchStocks } from '../services/api';
import useStore from '../store/useStore';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatCurrency, formatNumber, formatPercent } from '../utils/formatters';

function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getUTCDay();
  const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1);
  d.setUTCDate(diff);
  d.setUTCHours(0,0,0,0);
  return d;
}

async function fetchExchangeRate() {
  try {
    const resp = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
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
  const avgAmount = recentAmounts.reduce((a,b) => a+b, 0) / recentAmounts.length;
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
      date: currentDate.toISOString().slice(0,10),
      amount: amountInBase,
      shares: shares,
      perShare: estAmount,
    });
  }
  return futureDates;
}

// Edit Holding Modal Component (inline)
const EditHoldingModal = ({ isOpen, onClose, onSave, holding, currencySymbol }) => {
  const [quantity, setQuantity] = useState(1);
  const [purchaseDate, setPurchaseDate] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && holding) {
      setQuantity(holding.shares || 1);
      setPurchaseDate(holding.purchaseDate || '');
      setPurchasePrice(holding.purchasePrice || '');
      setError('');
    }
  }, [isOpen, holding]);

  if (!isOpen || !holding) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!quantity || quantity < 1) {
      setError('Please enter a valid quantity (minimum 1)');
      return;
    }
    if (!purchaseDate) {
      setError('Please select a purchase date');
      return;
    }
    if (!purchasePrice || parseFloat(purchasePrice) <= 0) {
      setError('Please enter a valid purchase price');
      return;
    }

    setError('');
    onSave(holding.symbol, {
      shares: parseInt(quantity),
      purchaseDate: purchaseDate,
      purchasePrice: parseFloat(purchasePrice),
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-bg-secondary border border-border rounded-xl max-w-md w-full p-6 shadow-xl">
        <h3 className="text-xl font-bold mb-2">Edit Holding</h3>
        <p className="text-text-muted text-sm mb-4">
          <span className="font-semibold text-text-primary">{holding.name || holding.symbol}</span> ({holding.symbol})
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase text-text-muted font-semibold mb-1">
              Quantity / Shares
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min="1"
              step="1"
              className="w-full bg-bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue"
              required
            />
          </div>

          <div>
            <label className="block text-xs uppercase text-text-muted font-semibold mb-1">
              Purchase Date
            </label>
            <input
              type="date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              className="w-full bg-bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue"
              required
            />
          </div>

          <div>
            <label className="block text-xs uppercase text-text-muted font-semibold mb-1">
              Purchase Price (per share)
            </label>
            <input
              type="number"
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(e.target.value)}
              placeholder="e.g. 150.50"
              step="0.01"
              min="0.01"
              className="w-full bg-bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue"
              required
            />
          </div>

          {quantity && purchasePrice && parseFloat(quantity) > 0 && parseFloat(purchasePrice) > 0 && (
            <div className="bg-bg-surface rounded-lg p-3 border border-border">
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Total Cost:</span>
                <span className="text-text-primary font-semibold">
                  {currencySymbol}{(parseFloat(quantity) * parseFloat(purchasePrice)).toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {error && <p className="text-accent-red text-sm">{error}</p>}

          <div className="flex gap-3 mt-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-gradient-to-r from-accent-blue to-accent-teal text-white font-semibold rounded-full hover:shadow-lg transition"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-bg-surface border border-border rounded-full hover:bg-bg-surface-hover transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const PortfolioView = () => {
  const { portfolio, market, currency, removeFromPortfolio, updatePortfolioItem } = useStore();
  const [view, setView] = useState('holdings');
  const [exchangeRate, setExchangeRate] = useState(null);
  const [editingHolding, setEditingHolding] = useState(null);
  const [expandedRows, setExpandedRows] = useState({});
  const symbols = portfolio.map(item => item.symbol);
  const portfolioRef = useRef(null);

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
                const weekKey = weekStart.toISOString().slice(0,10);
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

  // ---------- PDF Export using html2canvas with clean white background ----------
  const handleExportPDF = async () => {
    try {
      // Build a clean HTML report
      const reportHTML = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { 
                font-family: Arial, Helvetica, sans-serif; 
                background: #ffffff; 
                color: #1a1a2e;
                padding: 40px;
                width: 800px;
                margin: 0 auto;
              }
              .header {
                background: #0a0e1a;
                padding: 25px 30px;
                border-radius: 8px 8px 0 0;
                margin-bottom: 0;
              }
              .header h1 {
                color: #ffffff;
                font-size: 24px;
                font-weight: bold;
              }
              .header .subtitle {
                color: #9ca3af;
                font-size: 12px;
                margin-top: 4px;
              }
              .header .date {
                color: #9ca3af;
                font-size: 11px;
                float: right;
                margin-top: -30px;
              }
              .section-title {
                font-size: 18px;
                font-weight: bold;
                color: #1a1a2e;
                margin-top: 25px;
                margin-bottom: 15px;
                padding-bottom: 8px;
                border-bottom: 2px solid #3b82f6;
              }
              .kpi-grid {
                display: grid;
                grid-template-columns: repeat(5, 1fr);
                gap: 12px;
                margin: 20px 0;
              }
              .kpi-card {
                background: #f9fafb;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                padding: 14px 16px;
                text-align: center;
              }
              .kpi-card .label {
                font-size: 10px;
                color: #6b7280;
                text-transform: uppercase;
                letter-spacing: 0.5px;
              }
              .kpi-card .value {
                font-size: 16px;
                font-weight: bold;
                color: #1a1a2e;
                margin-top: 4px;
              }
              .kpi-card .value.green { color: #10b981; }
              .kpi-card .value.blue { color: #3b82f6; }
              .kpi-card .value.gold { color: #f59e0b; }
              table {
                width: 100%;
                border-collapse: collapse;
                font-size: 12px;
                margin-top: 15px;
              }
              th {
                background: #3b82f6;
                color: #ffffff;
                padding: 10px 12px;
                text-align: left;
                font-weight: bold;
              }
              th.right { text-align: right; }
              td {
                padding: 9px 12px;
                border-bottom: 1px solid #e5e7eb;
              }
              td.right { text-align: right; }
              td.green { color: #10b981; font-weight: 600; }
              td.red { color: #ef4444; font-weight: 600; }
              td.dividend { color: #10b981; font-weight: 600; }
              tr:nth-child(even) { background: #f9fafb; }
              .footer {
                margin-top: 30px;
                padding-top: 15px;
                border-top: 1px solid #e5e7eb;
                font-size: 10px;
                color: #6b7280;
                text-align: center;
              }
              .footer a {
                color: #3b82f6;
                text-decoration: none;
                font-weight: bold;
              }
              .footer .brand {
                color: #3b82f6;
                font-weight: bold;
                font-size: 12px;
              }
              .dividend-section {
                margin-top: 25px;
                padding: 20px;
                background: #f0fdf4;
                border-radius: 8px;
                border: 1px solid #10b981;
              }
              .dividend-section h3 {
                color: #10b981;
                font-size: 16px;
                margin-bottom: 8px;
              }
              .dividend-item {
                display: flex;
                justify-content: space-between;
                padding: 6px 0;
                border-bottom: 1px solid #d1fae5;
                font-size: 12px;
              }
              .dividend-item:last-child { border-bottom: none; }
              .dividend-item .amount { color: #10b981; font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>📊 DividendBro</h1>
              <div class="subtitle">Smart Dividend Investing</div>
              <div class="date">${new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</div>
            </div>

            <div style="padding: 0 0 10px 0;">
              <h2 style="font-size: 20px; margin: 20px 0 5px 0;">Investment Portfolio Report</h2>
              <p style="color: #6b7280; font-size: 12px;">Portfolio Summary • ${holdingsWithData.length} holdings • ${currency.toUpperCase()}</p>
            </div>

            <div class="kpi-grid">
              <div class="kpi-card">
                <div class="label">Total Value</div>
                <div class="value blue">${formatCurrency(totalValue, curSymbol)}</div>
              </div>
              <div class="kpi-card">
                <div class="label">Total Cost</div>
                <div class="value">${formatCurrency(totalCostBasis, curSymbol)}</div>
              </div>
              <div class="kpi-card">
                <div class="label">Total Gain/Loss</div>
                <div class="value ${totalGain >= 0 ? 'green' : ''}">${totalGain >= 0 ? '+' : ''}${formatCurrency(totalGain, curSymbol)}</div>
                <div style="font-size: 10px; color: ${totalGain >= 0 ? '#10b981' : '#ef4444'};">${totalGainPct >= 0 ? '+' : ''}${formatPercent(totalGainPct)}</div>
              </div>
              <div class="kpi-card">
                <div class="label">Portfolio Yield</div>
                <div class="value gold">${formatPercent(avgYield)}</div>
              </div>
              <div class="kpi-card">
                <div class="label">Dividend Income</div>
                <div class="value green">+${formatCurrency(totalDividendIncome, curSymbol)}</div>
              </div>
            </div>

            <h3 class="section-title">📈 Holdings</h3>
            <p style="color: #6b7280; font-size: 11px; margin-bottom: 10px;">Detailed breakdown of your ${holdingsWithData.length} stock holdings</p>

            <table>
              <thead>
                <tr>
                  <th>Stock</th>
                  <th class="right">Shares</th>
                  <th class="right">Price</th>
                  <th class="right">Value</th>
                  <th class="right">Gain</th>
                  <th class="right">Yield</th>
                  <th class="right">Div Income</th>
                </tr>
              </thead>
              <tbody>
                ${holdingsWithData.slice(0, 25).map(row => `
                  <tr>
                    <td>${row.name.length > 14 ? row.name.slice(0, 12) + '…' : row.name}</td>
                    <td class="right">${row.shares}</td>
                    <td class="right">${formatCurrency(row.priceInBase, '')}</td>
                    <td class="right">${formatCurrency(row.valueInBase, '')}</td>
                    <td class="right ${row.gain >= 0 ? 'green' : 'red'}">${row.gain >= 0 ? '+' : ''}${formatCurrency(row.gain, '')}</td>
                    <td class="right">${row.yieldPct ? row.yieldPct.toFixed(2) + '%' : '—'}</td>
                    <td class="right dividend">+${formatCurrency(row.dividendIncome, '')}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            ${totalDividendIncome > 0 ? `
              <div class="dividend-section">
                <h3>💰 Dividend Income Summary</h3>
                <p style="font-size: 12px; color: #6b7280; margin-bottom: 10px;">Total dividends received across all holdings: <strong style="color: #10b981;">${formatCurrency(totalDividendIncome, curSymbol)}</strong></p>
                ${holdingsWithData.filter(h => h.dividendIncome > 0).map(h => `
                  <div class="dividend-item">
                    <span>${h.name.length > 20 ? h.name.slice(0, 18) + '…' : h.name}</span>
                    <span class="amount">+${formatCurrency(h.dividendIncome, curSymbol)}</span>
                  </div>
                `).join('')}
              </div>
            ` : ''}

            <div class="footer">
              <span>Generated by <span class="brand">DividendBro</span> — Smart Dividend Investing</span><br>
              <span style="font-size: 9px; color: #9ca3af;">Visit us at <a href="https://dividendbro.com">dividendbro.com</a></span>
            </div>
          </body>
        </html>
      `;

      // Create a temporary div to render the report
      const container = document.createElement('div');
      container.innerHTML = reportHTML;
      container.style.position = 'fixed';
      container.style.top = '-9999px';
      container.style.left = '0';
      container.style.width = '800px';
      container.style.background = '#ffffff';
      container.style.zIndex = '-9999';
      document.body.appendChild(container);

      // Wait for rendering
      await new Promise(resolve => setTimeout(resolve, 300));

      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(container, {
        scale: 2.5,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
        width: 800,
        height: container.scrollHeight,
      });

      document.body.removeChild(container);

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = 190;
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      // Add the image to PDF
      doc.addImage(imgData, 'JPEG', 10, 10, pdfWidth, pdfHeight);

      // Add footer with hyperlink
      const pageHeight = doc.internal.pageSize.getHeight();
      doc.setDrawColor(209, 213, 219);
      doc.line(15, pageHeight - 12, 195, pageHeight - 12);

      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(107, 114, 128);
      doc.text('Generated by', 15, pageHeight - 5);

      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(59, 130, 246);
      doc.text('DividendBro', 40, pageHeight - 5);
      doc.link(40, pageHeight - 10, 35, 8, { url: 'https://dividendbro.com' });

      doc.setTextColor(107, 114, 128);
      doc.text('dividendbro.com', 195, pageHeight - 5, { align: 'right' });
      doc.link(195 - 45, pageHeight - 10, 45, 8, { url: 'https://dividendbro.com' });

      doc.save(`DividendBro_Portfolio_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (error) {
      console.error('PDF generation error:', error);
      alert(`Failed to generate PDF: ${error.message || 'Unknown error'}`);
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
    link.download = `portfolio_holdings_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  // ---------- WhatsApp Share ----------
  const handleShare = () => {
    let message = '📊 *DividendBro Portfolio Report*\n\n';
    message += `📅 ${new Date().toLocaleDateString()}\n\n`;
    message += `• Total Value: *${formatCurrency(totalValue, curSymbol)}*\n`;
    message += `• Total Cost: *${formatCurrency(totalCostBasis, curSymbol)}*\n`;
    message += `• Total Gain: *${totalGain >= 0 ? '+' : ''}${formatCurrency(totalGain, curSymbol)} (${totalGainPct >= 0 ? '+' : ''}${formatPercent(totalGainPct)})\n`;
    message += `• Portfolio Yield: *${formatPercent(avgYield)}*\n`;
    message += `• Dividend Income: *${formatCurrency(totalDividendIncome, curSymbol)}*\n`;
    message += `• Holdings: *${holdingsWithData.length} stocks*\n\n`;
    message += `🔗 View full report: dividendbro.com/portfolio`;
    message += `\n\nBuilt with ❤️ by DividendBro`;
    
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  if (!symbols.length) {
    return (
      <div className="text-center py-12 text-text-secondary">
        <div className="text-5xl mb-4">📭</div>
        <p className="text-lg">Your portfolio is empty.</p>
        <p className="text-sm text-text-muted mt-2">
          Search for stocks and click "Add to Portfolio" to start tracking.
        </p>
      </div>
    );
  }

  if (isLoading) return <LoadingSpinner fullPage />;
  if (error) {
    return (
      <div className="bg-accent-red/10 border border-accent-red/20 rounded-xl p-4 text-accent-red">
        Error loading portfolio: {error.message}
      </div>
    );
  }

  const curSymbol = currency === 'sgd' ? 'S$' : '$';

  return (
    <>
      <Helmet>
        <title>My Dividend Portfolio – Track Your Passive Income</title>
        <meta name="description" content="View your dividend portfolio, total value, yield, and upcoming ex‑dividend dates." />
      </Helmet>
      <div ref={portfolioRef} className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="bg-bg-surface border border-border rounded-xl p-4">
            <div className="text-xs uppercase text-text-muted">Total Value</div>
            <div className="text-xl font-bold text-accent-teal">
              {formatCurrency(totalValue, curSymbol)}
            </div>
          </div>
          <div className="bg-bg-surface border border-border rounded-xl p-4">
            <div className="text-xs uppercase text-text-muted">Total Cost</div>
            <div className="text-xl font-bold">
              {formatCurrency(totalCostBasis, curSymbol)}
            </div>
          </div>
          <div className={`bg-bg-surface border border-border rounded-xl p-4 ${totalGain >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
            <div className="text-xs uppercase text-text-muted">Total Gain/Loss</div>
            <div className="text-xl font-bold">
              {totalGain >= 0 ? '+' : ''}{formatCurrency(totalGain, curSymbol)}
            </div>
            <div className="text-xs">
              {totalGainPct >= 0 ? '+' : ''}{formatPercent(totalGainPct)}
            </div>
          </div>
          <div className="bg-bg-surface border border-border rounded-xl p-4">
            <div className="text-xs uppercase text-text-muted">Portfolio Yield</div>
            <div className="text-xl font-bold">
              {formatPercent(avgYield)}
            </div>
          </div>
          <div className="bg-bg-surface border border-border rounded-xl p-4">
            <div className="text-xs uppercase text-text-muted">Dividend Income</div>
            <div className="text-xl font-bold text-accent-green">
              +{formatCurrency(totalDividendIncome, curSymbol)}
            </div>
            <div className="text-xs text-text-muted">All time</div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-1">
          <div className="flex gap-2">
            <button
              className={`px-4 py-1.5 text-sm font-medium rounded-t-lg transition ${view === 'holdings' ? 'bg-accent-blue/10 text-accent-blue border-b-2 border-accent-blue' : 'text-text-muted hover:text-text-primary'}`}
              onClick={() => setView('holdings')}
            >
              📋 Holdings
            </button>
            <button
              className={`px-4 py-1.5 text-sm font-medium rounded-t-lg transition ${view === 'income' ? 'bg-accent-blue/10 text-accent-blue border-b-2 border-accent-blue' : 'text-text-muted hover:text-text-primary'}`}
              onClick={() => setView('income')}
            >
              💰 Income
            </button>
            <button
              className={`px-4 py-1.5 text-sm font-medium rounded-t-lg transition ${view === 'calendar' ? 'bg-accent-blue/10 text-accent-blue border-b-2 border-accent-blue' : 'text-text-muted hover:text-text-primary'}`}
              onClick={() => setView('calendar')}
            >
              📅 Calendar
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleExportCSV}
              className="text-xs px-3 py-1.5 bg-bg-surface border border-border rounded-full hover:bg-bg-surface-hover transition flex items-center gap-1"
            >
              📊 CSV
            </button>
            <button
              onClick={handleExportPDF}
              className="text-xs px-3 py-1.5 bg-bg-surface border border-border rounded-full hover:bg-bg-surface-hover transition flex items-center gap-1"
            >
              📄 PDF
            </button>
            <button
              onClick={handleShare}
              className="text-xs px-3 py-1.5 bg-accent-green/10 border border-accent-green/30 rounded-full hover:bg-accent-green/20 transition flex items-center gap-1 text-accent-green"
            >
              📤 Share
            </button>
          </div>
        </div>

        {view === 'holdings' && (
          <div className="bg-bg-surface border border-border rounded-xl p-4">
            <h3 className="font-bold text-lg mb-2">Holdings</h3>
            <div className="table-wrapper">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-3 text-text-muted font-semibold text-xs uppercase">Stock</th>
                    <th className="text-right py-2 px-3 text-text-muted font-semibold text-xs uppercase">Shares</th>
                    <th className="text-right py-2 px-3 text-text-muted font-semibold text-xs uppercase">Avg Cost</th>
                    <th className="text-right py-2 px-3 text-text-muted font-semibold text-xs uppercase">Current</th>
                    <th className="text-right py-2 px-3 text-text-muted font-semibold text-xs uppercase">Value</th>
                    <th className="text-right py-2 px-3 text-text-muted font-semibold text-xs uppercase">Gain</th>
                    <th className="text-right py-2 px-3 text-text-muted font-semibold text-xs uppercase">Yield</th>
                    <th className="text-right py-2 px-3 text-text-muted font-semibold text-xs uppercase text-accent-green">Dividend Income</th>
                    <th className="text-right py-2 px-3 text-text-muted font-semibold text-xs uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {holdingsWithData.map((h) => (
                    <React.Fragment key={h.symbol}>
                      <tr className="border-b border-border hover:bg-bg-surface-hover">
                        <td className="py-2 px-3 font-semibold">
                          <button
                            onClick={() => toggleExpand(h.symbol)}
                            className="mr-2 text-text-muted hover:text-text-primary transition-transform"
                            style={{ transform: expandedRows[h.symbol] ? 'rotate(90deg)' : 'rotate(0deg)' }}
                          >
                            ▶
                          </button>
                          {h.name}
                          <span className="text-text-muted text-xs ml-1 font-mono">{h.symbol}</span>
                        </td>
                        <td className="py-2 px-3 text-right">{formatNumber(h.shares, 0)}</td>
                        <td className="py-2 px-3 text-right">
                          {h.purchasePrice ? formatCurrency(h.purchasePrice, curSymbol) : '—'}
                        </td>
                        <td className="py-2 px-3 text-right">{formatCurrency(h.priceInBase, curSymbol)}</td>
                        <td className="py-2 px-3 text-right font-semibold">{formatCurrency(h.valueInBase, curSymbol)}</td>
                        <td className={`py-2 px-3 text-right ${h.gain >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
                          {h.gain >= 0 ? '+' : ''}{formatCurrency(h.gain, curSymbol)}
                          <div className="text-xs">
                            {h.gainPct >= 0 ? '+' : ''}{formatPercent(h.gainPct)}
                          </div>
                        </td>
                        <td className="py-2 px-3 text-right">{h.yieldPct ? formatPercent(h.yieldPct) : '—'}</td>
                        <td className="py-2 px-3 text-right text-accent-green font-semibold">
                          +{formatCurrency(h.dividendIncome, curSymbol)}
                        </td>
                        <td className="py-2 px-3 text-right">
                          <div className="flex justify-end gap-1">
                            <button
                              onClick={() => handleEdit(h)}
                              className="text-accent-blue hover:text-blue-400 transition text-sm px-2 py-1 rounded hover:bg-accent-blue/10"
                              title="Edit holding"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => removeFromPortfolio(h.symbol)}
                              className="text-accent-red hover:text-red-400 transition text-sm px-2 py-1 rounded hover:bg-accent-red/10"
                              title="Remove holding"
                            >
                              ✕
                            </button>
                          </div>
                        </td>
                      </tr>
                      {expandedRows[h.symbol] && (
                        <tr>
                          <td colSpan="9" className="py-3 px-3 bg-bg-secondary/50">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <h4 className="font-semibold text-sm">📊 Dividend History</h4>
                                <span className="text-xs text-text-muted">
                                  Total: <span className="text-accent-green font-semibold">+{formatCurrency(h.dividendIncome, curSymbol)}</span>
                                </span>
                              </div>
                              {h.dividendPayouts && h.dividendPayouts.length > 0 ? (
                                <div className="max-h-48 overflow-y-auto">
                                  <table className="w-full text-xs">
                                    <thead className="sticky top-0 bg-bg-secondary/50">
                                      <tr className="border-b border-border">
                                        <th className="text-left py-1 text-text-muted font-semibold">Date</th>
                                        <th className="text-right py-1 text-text-muted font-semibold">Per Share</th>
                                        <th className="text-right py-1 text-text-muted font-semibold">Shares</th>
                                        <th className="text-right py-1 text-text-muted font-semibold text-accent-green">Amount</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {h.dividendPayouts
                                        .sort((a, b) => b.date.localeCompare(a.date))
                                        .map((payout, idx) => (
                                          <tr key={idx} className="border-b border-border/50">
                                            <td className="py-1 font-mono">{payout.date}</td>
                                            <td className="py-1 text-right">{formatCurrency(payout.amount, curSymbol)}</td>
                                            <td className="py-1 text-right">{formatNumber(payout.shares, 0)}</td>
                                            <td className="py-1 text-right text-accent-green font-semibold">
                                              +{formatCurrency(payout.amountInBase, curSymbol)}
                                            </td>
                                          </tr>
                                        ))}
                                    </tbody>
                                  </table>
                                </div>
                              ) : (
                                <p className="text-text-muted text-sm">No dividend history available.</p>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {view === 'income' && incomeData && (
          <div className="space-y-4">
            <div className="bg-bg-surface border border-border rounded-xl p-4">
              <h4 className="font-semibold text-md mb-2">📊 Quarterly Dividend Income (Last 12 Months)</h4>
              {Object.keys(incomeData.quarterMap).length === 0 ? (
                <p className="text-text-muted text-sm">No dividend income in the last 12 months.</p>
              ) : (
                <div className="space-y-2">
                  {Object.entries(incomeData.quarterMap).sort().map(([label, amount]) => (
                    <div key={label} className="flex items-center gap-3">
                      <span className="w-20 text-sm font-medium">{label}</span>
                      <div className="flex-1 h-2 bg-bg-surface rounded-full overflow-hidden">
                        <div className="h-full bg-accent-blue rounded-full" style={{ width: `${(amount / Math.max(...Object.values(incomeData.quarterMap))) * 100}%` }}></div>
                      </div>
                      <span className="text-sm font-mono">{formatCurrency(amount, curSymbol)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="bg-bg-surface border border-border rounded-xl p-4">
              <h4 className="font-semibold text-md mb-2">📆 Monthly Dividend Income (Last 12 Months)</h4>
              {Object.keys(incomeData.monthMap).length === 0 ? (
                <p className="text-text-muted text-sm">No dividend income in the last 12 months.</p>
              ) : (
                <div className="space-y-2">
                  {Object.entries(incomeData.monthMap).sort().slice(-12).map(([key, amount]) => {
                    const [year, month] = key.split('-');
                    const monthName = new Date(year, month-1).toLocaleString('default', { month: 'short' });
                    return (
                      <div key={key} className="flex items-center gap-3">
                        <span className="w-16 text-sm font-medium">{monthName} {year}</span>
                        <div className="flex-1 h-2 bg-bg-surface rounded-full overflow-hidden">
                          <div className="h-full bg-accent-teal rounded-full" style={{ width: `${(amount / Math.max(...Object.values(incomeData.monthMap))) * 100}%` }}></div>
                        </div>
                        <span className="text-sm font-mono">{formatCurrency(amount, curSymbol)}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="bg-bg-surface border border-border rounded-xl p-4">
              <h4 className="font-semibold text-md mb-2">📅 Weekly Dividend Income (Last 12 Months)</h4>
              {Object.keys(incomeData.weekMap).length === 0 ? (
                <p className="text-text-muted text-sm">No dividend income in the last 12 months.</p>
              ) : (
                <div className="space-y-2">
                  {Object.entries(incomeData.weekMap).sort().slice(-12).map(([key, amount]) => {
                    const date = new Date(key + 'T00:00:00Z');
                    const label = date.toLocaleDateString('default', { month: 'short', day: 'numeric' });
                    return (
                      <div key={key} className="flex items-center gap-3">
                        <span className="w-16 text-sm font-medium">{label}</span>
                        <div className="flex-1 h-2 bg-bg-surface rounded-full overflow-hidden">
                          <div className="h-full bg-accent-purple rounded-full" style={{ width: `${(amount / Math.max(...Object.values(incomeData.weekMap))) * 100}%` }}></div>
                        </div>
                        <span className="text-sm font-mono">{formatCurrency(amount, curSymbol)}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {view === 'calendar' && (
          <div className="bg-bg-surface border border-border rounded-xl p-4">
            <h4 className="font-semibold text-md mb-2">📅 Upcoming Ex‑Dividend Dates (Next 3 Months)</h4>
            {futureExDates.length === 0 ? (
              <p className="text-text-muted text-sm">No estimated future ex‑dividend dates for your holdings.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {futureExDates.map((item, idx) => (
                  <div key={idx} className="bg-bg-secondary p-3 rounded-lg border border-border">
                    <div className="text-sm font-semibold">{item.name}</div>
                    <div className="text-xs text-text-muted">{item.symbol}</div>
                    <div className="flex justify-between mt-1">
                      <span className="text-xs font-mono">{item.date}</span>
                      <span className="text-sm font-bold text-accent-green">
                        {formatCurrency(item.amount, curSymbol)}
                      </span>
                    </div>
                    <div className="text-xs text-text-muted mt-1">
                      Est. {formatCurrency(item.perShare, curSymbol)} per share
                    </div>
                  </div>
                ))}
              </div>
            )}
            <p className="text-text-muted text-xs mt-3">
              * Estimated based on historical payout patterns. Actual dates may vary.
            </p>
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