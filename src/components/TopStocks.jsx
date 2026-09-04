import React, { useState, useRef, useEffect } from 'react';
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
    const resp = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
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

  // Build report data for PDF
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
      <div className="bg-accent-red/10 border border-accent-red/20 rounded-xl p-4 text-accent-red">
        Error loading top stocks: {error.message}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12 text-text-secondary">
        <div className="text-5xl mb-4">📊</div>
        <p>No {type === 'stock' ? 'stocks' : 'ETFs'} found yet. Please check back later.</p>
      </div>
    );
  }

  const handleClick = (symbol) => {
    navigate(`/?symbol=${encodeURIComponent(symbol)}`);
  };

  const safetyColors = {
    Safe: 'bg-accent-green/20 text-accent-green',
    Moderate: 'bg-accent-yellow/20 text-accent-yellow',
    Caution: 'bg-accent-red/20 text-accent-red',
  };

  return (
    <>
      <Helmet>
        <title>Top Dividend Stocks – US & SGX High Yield</title>
        <meta name="description" content="Discover the highest dividend yield stocks and ETFs in the US and SGX markets. Sorted by yield." />
      </Helmet>
      <div ref={topStocksRef} className="bg-bg-surface border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border flex justify-between items-center flex-wrap gap-2">
          <div>
            <h2 className="text-xl font-bold">🏆 Top Dividend {type === 'stock' ? 'Stocks' : 'ETFs'}</h2>
            <p className="text-sm text-text-muted">
              {market === 'sg' ? 'SGX' : 'US'} {type === 'stock' ? 'stocks' : 'ETFs'} sorted by yield
            </p>
            <div className="flex gap-2 mt-2">
              <button
                className={`px-3 py-1 rounded-full text-sm font-semibold transition ${type === 'stock' ? 'bg-accent-blue text-white' : 'bg-bg-surface text-text-muted hover:text-text-primary'}`}
                onClick={() => setType('stock')}
              >
                📈 Stocks
              </button>
              <button
                className={`px-3 py-1 rounded-full text-sm font-semibold transition ${type === 'etf' ? 'bg-accent-blue text-white' : 'bg-bg-surface text-text-muted hover:text-text-primary'}`}
                onClick={() => setType('etf')}
              >
                📊 ETFs
              </button>
            </div>
          </div>
          <ExportButtons
            data={getCSVData()}
            filename={`top_${type}_${market}`}
            headers={['Name','Symbol','Price','Yield','Payouts','Safety']}
            reportData={reportData}
            title={`Top Dividend ${type === 'stock' ? 'Stocks' : 'ETFs'} (${market.toUpperCase()})`}
            shareMessage={`Check out the top dividend ${type === 'stock' ? 'stocks' : 'ETFs'} on DividendBro!`}
          />
        </div>

        <div className="table-wrapper">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-text-muted font-semibold text-xs uppercase">#</th>
                <th className="text-left py-3 px-4 text-text-muted font-semibold text-xs uppercase">Name</th>
                <th className="text-right py-3 px-4 text-text-muted font-semibold text-xs uppercase">Price</th>
                <th className="text-right py-3 px-4 text-text-muted font-semibold text-xs uppercase">Yield</th>
                <th className="text-right py-3 px-4 text-text-muted font-semibold text-xs uppercase">Payouts</th>
                <th className="text-right py-3 px-4 text-text-muted font-semibold text-xs uppercase">Safety</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr
                  key={item.symbol}
                  className="border-b border-border hover:bg-bg-surface-hover cursor-pointer transition"
                  onClick={() => handleClick(item.symbol)}
                >
                  <td className="py-2 px-4 text-text-muted">{index + 1}</td>
                  <td className="py-2 px-4">
                    <span className="font-semibold">{item.name || item.symbol}</span>
                    <span className="font-mono text-accent-teal text-xs ml-2">{item.symbol}</span>
                  </td>
                  <td className="py-2 px-4 text-right">
                    {item.currentPrice ? formatCurrency(convertPrice(item.currentPrice), curSymbol) : '—'}
                  </td>
                  <td className="py-2 px-4 text-right font-bold text-accent-green">
                    {item.currentYield ? formatPercent(item.currentYield) : '—'}
                  </td>
                  <td className="py-2 px-4 text-right">{item.payoutCount || 0}</td>
                  <td className="py-2 px-4 text-right">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      safetyColors[item.safetyScore] || 'bg-bg-surface text-text-muted'
                    }`}>
                      {item.safetyScore || '—'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-text-muted text-xs p-4 border-t border-border">
          Data from Yahoo Finance · Updated periodically
        </p>
      </div>
    </>
  );
};

export default TopStocks;