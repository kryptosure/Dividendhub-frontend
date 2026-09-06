import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { getTopStocks } from '../services/api';
import useStore from '../store/useStore';
import LoadingSpinner from './LoadingSpinner';
import { formatCurrency, formatPercent } from '../utils/formatters';
import ExportButtons from './ExportButtons';

async function fetchExchangeRate() {
  try {
    const resp = await fetch('https://exchangerate-api.com');
    const data = await resp.json();
    return data.rates.SGD;
  } catch {
    return 1.35;
  }
}

const TopStocks = () => {
  const { market, currency } = useStore();
  const navigate = useNavigate();
  const [type, setType] = useState('stock');
  const [exchangeRate, setExchangeRate] = useState(null);
  const topStocksRef = useRef(null);
  const curSymbol = currency === 'sgd' ? 'S$' : '$';

  useEffect(() => {
    const getRate = async () => {
      const rate = await fetchExchangeRate();
      setExchangeRate(rate);
    };
    getRate();
  }, [currency]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['topStocks', market, type],
    queryFn: () => getTopStocks(market, type),
    staleTime: 60 * 60 * 1000,
    retry: 1,
  });

  const convertPrice = (price) => {
    if (!exchangeRate) return price;
    const baseCurrency = market === 'us' ? 'USD' : 'SGD';
    const targetCurrency = currency.toUpperCase();
    if (baseCurrency === targetCurrency) return price;
    if (baseCurrency === 'USD' && targetCurrency === 'SGD') return price * exchangeRate;
    if (baseCurrency === 'SGD' && targetCurrency === 'USD') return price / exchangeRate;
    return price;
  };

  const getCSVData = () => {
    if (!data) return [];
    return data.map(item => ({
      Name: item.name,
      Symbol: item.symbol,
      Price: convertPrice(item.currentPrice),
      Yield: item.currentYield,
      Payouts: item.payoutCount,
      Safety: item.safetyScore,
    }));
  };

  const reportData = {
    title: `Top Dividend ${type === 'stock' ? 'Stocks' : 'ETFs'} (${market.toUpperCase()})`,
    subtitle: `Sorted by yield • ${data?.length || 0} entries`,
    kpis: [
      { label: 'Total Entries', value: data?.length || 0 },
      { label: 'Market', value: market.toUpperCase() },
      { label: 'Type', value: type === 'stock' ? 'Stocks' : 'ETFs' },
    ],
    tables: [
      {
        title: 'Top Dividend Rankings',
        headers: ['#', 'Name', 'Symbol', 'Price', 'Yield', 'Payouts', 'Safety'],
        rows: (data || []).map((item, i) => [
          i + 1,
          item.name || item.symbol,
          item.symbol,
          item.currentPrice ? formatCurrency(convertPrice(item.currentPrice), curSymbol) : '—',
          item.currentYield ? `${item.currentYield.toFixed(2)}%` : '—',
          item.payoutCount || 0,
          item.safetyScore || '—',
        ]),
      }
    ],
    currencySymbol: curSymbol,
  };

  if (isLoading) return <LoadingSpinner fullPage />;
  if (error) {
    return (
      <div className="bg-accent-red/5 border border-accent-red/20 rounded-2xl p-5 text-accent-red text-xs font-semibold">
        🛑 Internal feed synchronization channel failed: {error.message}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12 text-text-secondary border border-dashed border-border/40 rounded-2xl bg-bg-surface/40">
        <div className="text-4xl mb-3">📊</div>
        <p className="text-sm font-bold">No active indices available inside target region criteria loops.</p>
      </div>
    );
  }

  const safetyColors = {
    Safe: 'bg-accent-green/10 border-accent-green/20 text-accent-green',
    Moderate: 'bg-accent-yellow/10 border-accent-yellow/20 text-accent-yellow',
    Caution: 'bg-accent-red/10 border-accent-red/20 text-accent-red',
  };

  return (
    <>
      <Helmet>
        <title>Top Dividend Stocks – US & SGX High Yield</title>
        <meta name="description" content="Discover the highest dividend yield stocks and ETFs in the US and SGX markets. Sorted by yield." />
      </Helmet>
      <div ref={topStocksRef} className="bg-bg-surface border border-border/50 rounded-2xl overflow-hidden shadow-sm animate-in fade-in duration-300">
        <div className="p-5 border-b border-border/40 flex justify-between items-start flex-wrap gap-4 bg-bg-secondary/20">
          <div>
            <h2 className="text-xl font-black text-text-primary tracking-tight">🏆 High-Dividend Yield Board</h2>
            <p className="text-xs text-text-muted font-medium mt-0.5">Segmented and rank ordered via trailing distribution returns loops.</p>
            <div className="flex gap-1.5 mt-3 bg-bg-primary/40 border border-border/30 p-0.5 rounded-lg text-xs font-bold w-fit">
              <button
                className={`px-4 py-1.5 rounded-md transition-all ${type === 'stock' ? 'bg-bg-secondary text-text-primary border border-border/20 shadow-sm font-extrabold' : 'text-text-muted'}`}
                onClick={() => setType('stock')}
              >
                📈 Stocks
              </button>
              <button
                className={`px-4 py-1.5 rounded-md transition-all ${type === 'etf' ? 'bg-bg-secondary text-text-primary border border-border/20 shadow-sm font-extrabold' : 'text-text-muted'}`}
                onClick={() => setType('etf')}
              >
                📊 ETFs
              </button>
            </div>
          </div>
          <ExportButtons data={getCSVData()} filename={`top_${type}_${market}`} headers={['Name','Symbol','Price','Yield','Payouts','Safety']} reportData={reportData} shareMessage={`Reviewing top high yield dividend index sets maps on DividendBro.`} />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm divide-y divide-border/20">
            <thead className="bg-bg-secondary/40 text-[10px] uppercase font-bold text-text-muted tracking-wider">
              <tr>
                <th className="px-4 py-3">Rank</th>
                <th className="px-4 py-3">Asset Instrument</th>
                <th className="px-4 py-3 text-right">Value Close</th>
                <th className="px-4 py-3 text-right">Yield Return</th>
                <th className="px-4 py-3 text-right">Frequency</th>
                <th className="px-4 py-3 text-right">Risk Factor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/10 font-medium">
              {data.map((item, index) => (
                <tr
                  key={item.symbol}
                  className="hover:bg-bg-secondary/30 cursor-pointer transition-colors"
                  onClick={() => navigate(`/?symbol=${encodeURIComponent(item.symbol)}`)}
                >
                  <td className="px-4 py-3.5 text-text-muted font-mono text-xs">{index + 1}</td>
                  <td className="px-4 py-3.5 flex flex-col sm:flex-row sm:items-center gap-1">
                    <span className="font-bold text-text-primary">{item.name || item.symbol}</span>
                    <span className="font-mono text-accent-teal text-xs tracking-wide bg-bg-secondary px-1.5 py-0.5 border border-border/30 rounded w-fit">{item.symbol}</span>
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono text-xs text-text-secondary">
                    {item.currentPrice ? formatCurrency(convertPrice(item.currentPrice), curSymbol) : '—'}
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono text-sm font-black text-accent-green">
                    {item.currentYield ? formatPercent(item.currentYield) : '—'}
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono text-xs text-text-muted">{item.payoutCount || 0} intervals</td>
                  <td className="px-4 py-3.5 text-right">
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md border ${
                      safetyColors[item.safetyScore] || 'bg-bg-primary text-text-muted border-border/40'
                    }`}>
                      {item.safetyScore || '—'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default TopStocks;
