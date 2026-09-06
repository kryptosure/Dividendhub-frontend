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
  d.setUTCHours(0,0,0,0);
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

