import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import useStore from '../store/useStore';
import { getBatchStocks } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatCurrency, formatPercent } from '../utils/formatters';

const Watchlist = () => {
  const { watchlist, removeFromWatchlist, currency, market } = useStore();
  const curSymbol = currency === 'sgd' ? 'S$' : '$';

  const symbols = watchlist.map(item => item.symbol);

  const { data, isLoading, error } = useQuery({
    queryKey: ['watchlist', symbols, market],
    queryFn: () => getBatchStocks(symbols, market),
    enabled: symbols.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  const stocksWithData = useMemo(() => {
    if (!data) return [];
    return data.filter(r => !r.error && r.data).map(r => ({
      symbol: r.symbol,
      name: r.data.name || r.symbol,
      currentPrice: r.data.currentPrice,
      currentYield: r.data.currentYield,
      safetyScore: r.data.safetyScore,
      totalDividend: r.data.totalDividend,
      lastExDate: r.data.lastExDate,
      currencySymbol: r.data.currencySymbol || curSymbol,
    }));
  }, [data, curSymbol]);

  return (
    <>
      <Helmet>
        <title>My Watchlist – DividendBro</title>
      </Helmet>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-black tracking-tight text-text-primary mb-6">⭐ My Watchlist</h1>

        {watchlist.length === 0 ? (
          <div className="bg-bg-surface border border-dashed border-border/50 rounded-2xl p-12 text-center">
            <p className="text-lg font-bold text-text-secondary">Your watchlist is empty</p>
            <p className="text-sm text-text-muted mt-1">Search for stocks and click "☆ Add to Watchlist" to track them here.</p>
            <Link to="/" className="inline-block mt-4 px-5 py-2 bg-accent-blue text-white text-xs font-bold rounded-xl">Go to Search</Link>
          </div>
        ) : isLoading ? (
          <LoadingSpinner />
        ) : error ? (
          <div className="text-accent-red">Failed to load watchlist data.</div>
        ) : (
          <div className="bg-bg-surface border border-border/50 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-bg-secondary/40 text-[10px] uppercase font-bold text-text-muted tracking-wider">
                <tr>
                  <th className="px-4 py-3 text-left">Stock</th>
                  <th className="px-4 py-3 text-right">Price</th>
                  <th className="px-4 py-3 text-right">Yield</th>
                  <th className="px-4 py-3 text-right">Safety</th>
                  <th className="px-4 py-3 text-right">Last Ex-Date</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/10">
                {stocksWithData.map(stock => (
                  <tr key={stock.symbol} className="hover:bg-bg-surface-hover/50 transition-colors">
                    <td className="px-4 py-3">
                      <Link to={`/?symbol=${stock.symbol}`} className="font-bold text-text-primary hover:text-accent-blue transition-colors">
                        {stock.name}
                      </Link>
                      <div className="text-xs text-text-muted font-mono">{stock.symbol}</div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono">{stock.currentPrice ? formatCurrency(stock.currentPrice, stock.currencySymbol) : '—'}</td>
                    <td className="px-4 py-3 text-right text-accent-green font-bold">{stock.currentYield ? formatPercent(stock.currentYield) : '—'}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md border ${
                        stock.safetyScore === 'Safe' ? 'bg-accent-green/10 border-accent-green/20 text-accent-green' :
                        stock.safetyScore === 'Moderate' ? 'bg-accent-yellow/10 border-accent-yellow/20 text-accent-yellow' :
                        'bg-accent-red/10 border-accent-red/20 text-accent-red'
                      }`}>
                        {stock.safetyScore || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-text-muted">{stock.lastExDate || '—'}</td>
                    <td className="px-4 py-3 text-right">
                      <button 
                        onClick={() => removeFromWatchlist(stock.symbol)}
                        className="text-accent-red text-xs font-bold hover:underline"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default Watchlist;