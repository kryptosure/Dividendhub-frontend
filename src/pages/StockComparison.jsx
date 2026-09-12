import React, { useState, useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { getBatchStocks, getLongTermGrowth } from '../services/api';
import useStore from '../store/useStore';
import { formatCurrency, formatPercent } from '../utils/formatters';

const StockComparison = () => {
  const { compareList, addToCompare, removeFromCompare, clearCompare, market, currency } = useStore();
  const curSymbol = currency === 'sgd' ? 'S$' : '$';
  const [inputValue, setInputValue] = useState('');

  const handleAddSymbol = (e) => {
    e.preventDefault();
    const val = inputValue.trim().toUpperCase();
    if (val && !compareList.some(s => s.symbol === val) && compareList.length < 5) {
      addToCompare({ symbol: val, name: val, market });
      setInputValue('');
    }
  };

  const symbols = compareList.map(item => item.symbol);

  const stockQueries = useQueries({
    queries: symbols.map(sym => ({
      queryKey: ['compare-stock', sym, market],
      queryFn: () => getBatchStocks([sym], market),
      enabled: !!sym,
    })),
  });

  const growthQueries = useQueries({
    queries: symbols.map(sym => ({
      queryKey: ['compare-growth', sym, market],
      queryFn: () => getLongTermGrowth(sym, market, 1000),
      enabled: !!sym,
    })),
  });

  const stocksWithData = useMemo(() => {
    return symbols.map((sym, index) => {
      const stockRes = stockQueries[index]?.data?.[0];
      const growthRes = growthQueries[index]?.data;

      const byYear = stockRes?.data?.byYear || [];
      const lastYear = byYear[0];
      const frequency = lastYear ? lastYear.count : 0;
      const streak = byYear.length;

      let priceCAGR = null;
      if (growthRes && Array.isArray(growthRes.noDrip) && growthRes.noDrip[1] && growthRes.noDrip[1] > 0) {
        const multiplier = growthRes.noDrip[1] / 1000;
        priceCAGR = (Math.pow(multiplier, 1/5) - 1) * 100;
      }

      return {
        symbol: stockRes?.symbol || sym,
        name: stockRes?.data?.name || sym,
        currentPrice: stockRes?.data?.currentPrice,
        currentYield: stockRes?.data?.currentYield,
        totalDividend: stockRes?.data?.totalDividend,
        payoutRatio: stockRes?.data?.payoutRatio,
        dividendCAGR: stockRes?.data?.dividendCAGR,
        safetyScore: stockRes?.data?.safetyScore,
        lastExDate: stockRes?.data?.lastExDate,
        frequency,
        streak,
        priceCAGR,
        isLoading: stockQueries[index]?.isLoading,
      };
    });
  }, [symbols, stockQueries, growthQueries]);

  return (
    <>
      <Helmet>
        <title>Stock Comparison Tool – Compare Dividend Stocks Side by Side</title>
        <meta name="description" content="Compare up to 5 dividend stocks side by side. Yield, payout ratio, dividend CAGR, safety score, and dividend streak in one clean table." />
        {/* ✅ Fixed: Static canonical URL */}
        <link rel="canonical" href="https://dividendbro.com/compare" />
        <meta property="og:title" content="Stock Comparison Tool – DividendBro" />
        <meta property="og:description" content="Compare up to 5 dividend stocks side by side." />
        <meta property="og:url" content="https://dividendbro.com/compare" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://dividendbro.com/images/cover.png" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-black tracking-tight text-text-primary mb-2">
            📊 Stock <span className="bg-gradient-to-r from-accent-blue to-accent-teal bg-clip-text text-transparent">Comparison</span>
          </h1>
          <p className="text-text-muted text-sm">Compare up to 5 stocks side-by-side. KPIs are on the left, stocks are the columns.</p>
        </div>

        <form onSubmit={handleAddSymbol} className="flex gap-3 mb-8 bg-bg-surface border border-border/50 rounded-2xl p-4 shadow-sm">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter ticker symbol (e.g. AAPL)"
            className="flex-1 bg-bg-primary/50 border border-border/60 rounded-xl px-4 py-2.5 text-sm font-medium text-text-primary placeholder-text-muted/60 focus:outline-none focus:border-accent-blue focus:ring-4 focus:ring-accent-blue/5"
          />
          <button 
            type="submit"
            className="px-6 py-2.5 bg-gradient-to-r from-accent-blue to-accent-teal text-white text-xs font-bold tracking-wide uppercase rounded-xl shadow-sm hover:opacity-95 active:scale-95 transition-all disabled:opacity-40"
            disabled={compareList.length >= 5}
          >
            {compareList.length >= 5 ? 'Max Reached' : 'Add to Compare'}
          </button>
        </form>

        {compareList.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {compareList.map(item => (
              <div key={item.symbol} className="flex items-center gap-2 bg-bg-surface border border-border/60 px-3 py-1.5 rounded-lg text-sm font-mono font-bold text-accent-teal">
                {item.symbol}
                <button onClick={() => removeFromCompare(item.symbol)} className="text-text-muted hover:text-accent-red transition-colors">✕</button>
              </div>
            ))}
            <button onClick={clearCompare} className="text-xs text-accent-red font-bold hover:underline ml-auto">Clear All</button>
          </div>
        )}

        {compareList.length === 0 ? (
          <div className="bg-bg-surface border border-dashed border-border/40 rounded-2xl p-12 text-center">
            <p className="text-text-secondary font-bold text-base">Add stocks to compare</p>
            <p className="text-xs text-text-muted font-medium mt-1">Use the search bar or the "Add to Compare" button on any stock page.</p>
          </div>
        ) : (
          <div className="bg-bg-surface border border-border/50 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-bg-secondary/40 text-[10px] uppercase font-bold text-text-muted tracking-wider">
                  <tr>
                    <th className="px-4 py-3 text-left w-40">KPI / Stock</th>
                    {stocksWithData.map(stock => (
                      <th key={stock.symbol} className="px-4 py-3 text-center min-w-[150px]">
                        <div className="flex flex-col items-center">
                          <Link to={`/?symbol=${stock.symbol}`} className="font-bold text-text-primary hover:text-accent-blue transition-colors">
                            {stock.name}
                          </Link>
                          <span className="text-text-muted font-mono text-xs">{stock.symbol}</span>
                          <button 
                            onClick={() => removeFromCompare(stock.symbol)}
                            className="text-accent-red text-[10px] font-bold hover:underline mt-1"
                          >
                            Remove
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/10">
                  <tr>
                    <td className="px-4 py-3 text-text-muted font-semibold">Current Price</td>
                    {stocksWithData.map(stock => (
                      <td key={stock.symbol} className="px-4 py-3 text-center font-mono font-bold text-text-primary">
                        {stock.currentPrice ? formatCurrency(stock.currentPrice, curSymbol) : '—'}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-text-muted font-semibold">Dividend Yield</td>
                    {stocksWithData.map(stock => (
                      <td key={stock.symbol} className={`px-4 py-3 text-center font-bold ${stock.currentYield >= 3 ? 'text-accent-green' : 'text-text-secondary'}`}>
                        {stock.currentYield ? formatPercent(stock.currentYield) : '—'}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-text-muted font-semibold">Dividend Payout Ratio</td>
                    {stocksWithData.map(stock => (
                      <td key={stock.symbol} className="px-4 py-3 text-center font-mono text-text-secondary">
                        {stock.payoutRatio ? formatPercent(stock.payoutRatio) : '—'}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-text-muted font-semibold">Dividend CAGR (5Y)</td>
                    {stocksWithData.map(stock => (
                      <td key={stock.symbol} className={`px-4 py-3 text-center font-mono font-bold ${stock.dividendCAGR >= 0 ? 'text-accent-teal' : 'text-accent-red'}`}>
                        {stock.dividendCAGR ? (stock.dividendCAGR >= 0 ? '+' : '') + stock.dividendCAGR.toFixed(2) + '%' : '—'}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-text-muted font-semibold">Dividend Streak (Years)</td>
                    {stocksWithData.map(stock => (
                      <td key={stock.symbol} className="px-4 py-3 text-center font-mono font-bold text-accent-yellow">
                        {stock.streak || '—'}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-text-muted font-semibold">Dividend Frequency (Annually)</td>
                    {stocksWithData.map(stock => (
                      <td key={stock.symbol} className="px-4 py-3 text-center font-mono text-text-secondary">
                        {stock.frequency ? `${stock.frequency} times/yr` : '—'}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-text-muted font-semibold">Stock Price CAGR (5Y)</td>
                    {stocksWithData.map(stock => (
                      <td key={stock.symbol} className={`px-4 py-3 text-center font-mono font-bold ${stock.priceCAGR >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
                        {stock.priceCAGR != null ? (stock.priceCAGR >= 0 ? '+' : '') + stock.priceCAGR.toFixed(2) + '%' : '—'}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-text-muted font-semibold">Safety Score</td>
                    {stocksWithData.map(stock => (
                      <td key={stock.symbol} className="px-4 py-3 text-center">
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md border ${
                          stock.safetyScore === 'Safe' ? 'bg-accent-green/10 border-accent-green/20 text-accent-green' :
                          stock.safetyScore === 'Moderate' ? 'bg-accent-yellow/10 border-accent-yellow/20 text-accent-yellow' :
                          'bg-accent-red/10 border-accent-red/20 text-accent-red'
                        }`}>
                          {stock.safetyScore || '—'}
                        </span>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default StockComparison;