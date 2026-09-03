import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { getBatchStocks } from '../services/api';
import useStore from '../store/useStore';
import LoadingSpinner from './LoadingSpinner';
import { formatCurrency, formatNumber, formatPercent } from '../utils/formatters';
import ExportButtons from './ExportButtons';

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

const PortfolioView = () => {
  const { portfolio, market, currency, removeFromPortfolio } = useStore();
  const [view, setView] = useState('holdings');
  const [exchangeRate, setExchangeRate] = useState(null);
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

  const convertedHoldings = useMemo(() => {
    if (!data) return [];
    const holdings = data.filter(r => !r.error && r.data);
    const baseCurrencyCode = currency.toUpperCase();
    const rate = exchangeRate || 1.35;

    return holdings.map(r => {
      const shares = portfolio.find(p => p.symbol === r.symbol)?.shares || 1;
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
      
      return {
        ...r,
        shares,
        priceOrig: price,
        priceInBase,
        valueInBase,
        annualIncomeInBase,
        yieldPct,
        origCurrency,
        currencySymbol: r.data.currencySymbol || (origCurrency === 'SGD' ? 'S$' : '$'),
        name: r.data.name || r.symbol,
        dividendData: r.data,
      };
    });
  }, [data, portfolio, currency, exchangeRate]);

  const totalValue = convertedHoldings.reduce((sum, h) => sum + h.valueInBase, 0);
  const totalAnnualDividend = convertedHoldings.reduce((sum, h) => sum + h.annualIncomeInBase, 0);
  const avgYield = totalValue > 0 ? (totalAnnualDividend / totalValue) * 100 : 0;

  const futureExDates = useMemo(() => {
    if (!convertedHoldings.length) return [];
    const allFuture = [];
    for (const h of convertedHoldings) {
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
  }, [convertedHoldings, currency, exchangeRate]);

  const incomeData = useMemo(() => {
    if (!convertedHoldings.length) return null;
    const now = new Date();
    const oneYearAgo = new Date(now);
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const quarterMap = {};
    const monthMap = {};
    const weekMap = {};

    for (const h of convertedHoldings) {
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
  }, [convertedHoldings, currency, exchangeRate]);

  const getHoldingsCSV = () => {
    return convertedHoldings.map(h => ({
      Stock: h.name,
      Symbol: h.symbol,
      Shares: h.shares,
      Price: h.priceInBase,
      Yield: h.yieldPct,
      Value: h.valueInBase,
    }));
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

  const getCSVDataForView = () => {
    if (view === 'holdings') {
      return getHoldingsCSV();
    }
    if (view === 'income') {
      const qData = Object.entries(incomeData?.quarterMap || {}).map(([label, amount]) => ({ Period: label, Amount: amount }));
      return qData;
    }
    if (view === 'calendar') {
      return futureExDates.map(d => ({
        Date: d.date,
        Stock: d.name,
        Symbol: d.symbol,
        Amount: d.amount,
        'Per Share': d.perShare,
      }));
    }
    return [];
  };

  const getCSVHeaders = () => {
    if (view === 'holdings') return ['Stock','Symbol','Shares','Price','Yield','Value'];
    if (view === 'income') return ['Period','Amount'];
    if (view === 'calendar') return ['Date','Stock','Symbol','Amount','Per Share'];
    return [];
  };

  return (
    <>
      <Helmet>
        <title>My Dividend Portfolio – Track Your Passive Income</title>
        <meta name="description" content="View your dividend portfolio, total value, yield, and upcoming ex‑dividend dates." />
      </Helmet>
      <div ref={portfolioRef} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-bg-surface border border-border rounded-xl p-4">
            <div className="text-xs uppercase text-text-muted">Total Value</div>
            <div className="text-2xl font-bold text-accent-teal">
              {formatCurrency(totalValue, curSymbol)}
            </div>
          </div>
          <div className="bg-bg-surface border border-border rounded-xl p-4">
            <div className="text-xs uppercase text-text-muted">Portfolio Yield</div>
            <div className="text-2xl font-bold">
              {formatPercent(avgYield)}
            </div>
          </div>
          <div className="bg-bg-surface border border-border rounded-xl p-4">
            <div className="text-xs uppercase text-text-muted">Holdings</div>
            <div className="text-2xl font-bold">{convertedHoldings.length}</div>
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
          <ExportButtons
            data={getCSVDataForView()}
            filename={`portfolio_${view}`}
            headers={getCSVHeaders()}
            elementRef={portfolioRef}
            title={`Portfolio - ${view.charAt(0).toUpperCase() + view.slice(1)}`}
            shareMessage={`Check out my dividend portfolio (${view}) on DividendHub!`}
          />
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
                    <th className="text-right py-2 px-3 text-text-muted font-semibold text-xs uppercase">Price</th>
                    <th className="text-right py-2 px-3 text-text-muted font-semibold text-xs uppercase">Yield</th>
                    <th className="text-right py-2 px-3 text-text-muted font-semibold text-xs uppercase">Value</th>
                    <th className="text-right py-2 px-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {convertedHoldings.map((h) => (
                    <tr key={h.symbol} className="border-b border-border hover:bg-bg-surface-hover">
                      <td className="py-2 px-3 font-semibold">
                        {h.name}
                        <span className="text-text-muted text-xs ml-1 font-mono">{h.symbol}</span>
                      </td>
                      <td className="py-2 px-3 text-right">{formatNumber(h.shares, 0)}</td>
                      <td className="py-2 px-3 text-right">{formatCurrency(h.priceInBase, curSymbol)}</td>
                      <td className="py-2 px-3 text-right">{h.yieldPct ? formatPercent(h.yieldPct) : '—'}</td>
                      <td className="py-2 px-3 text-right font-semibold">{formatCurrency(h.valueInBase, curSymbol)}</td>
                      <td className="py-2 px-3 text-right">
                        <button
                          onClick={() => removeFromPortfolio(h.symbol)}
                          className="text-accent-red hover:text-red-400 transition text-sm px-2 py-1 rounded hover:bg-accent-red/10"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
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
    </>
  );
};

export default PortfolioView;