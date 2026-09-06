import React, { useState } from 'react';
import { calculatePortfolio } from '../services/api';
import useStore from '../store/useStore';
import { formatCurrency, formatNumber, formatPercent } from '../utils/formatters';
import DatePicker from './DatePicker';
import SimulatorExport from './SimulatorExport';

const PortfolioCalculator = ({ symbol, market }) => {
  const [purchaseDate, setPurchaseDate] = useState('');
  const [quantity, setQuantity] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const currencySymbol = useStore(state => state.currency === 'sgd' ? 'S$' : '$');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!purchaseDate || !quantity || !symbol) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await calculatePortfolio(symbol, purchaseDate, parseFloat(quantity), market);
      setResult(data);
    } catch (err) {
      setError(err.message || 'Failed to calculate portfolio');
    } finally {
      setLoading(false);
    }
  };

  if (!symbol) {
    return (
      <div className="bg-bg-surface border border-border/50 rounded-2xl p-5 shadow-sm">
        <h3 className="font-black tracking-tight text-lg text-text-primary">📈 Single Purchase Return Matrix</h3>
        <p className="text-text-muted text-xs font-medium">Please process an active asset vector configuration above to track growth limits.</p>
      </div>
    );
  }

  return (
    <div className="bg-bg-surface border border-border/50 rounded-2xl p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="font-black tracking-tight text-lg text-text-primary">📈 Single Purchase Return Matrix</h3>
        <p className="text-text-muted text-xs font-medium">Verify absolute historical capital performance metrics across single ledger acquisitions.</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end bg-bg-primary/40 border border-border/30 p-4 rounded-xl mb-6">
        <div>
          <label className="block text-[10px] uppercase text-text-muted font-bold tracking-widest mb-1.5">Purchase Ingestion Date</label>
          <DatePicker value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} required />
        </div>
        <div>
          <label className="block text-[10px] uppercase text-text-muted font-bold tracking-widest mb-1.5">Volume Shares Quantity</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="e.g. 1000"
            className="w-full bg-bg-secondary border border-border/60 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-4 focus:ring-accent-blue/5 focus:border-accent-blue focus:outline-none"
            min="1"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full py-3 bg-gradient-to-r from-accent-blue to-accent-teal hover:opacity-95 text-white font-bold text-xs tracking-wider uppercase rounded-xl transition-all active:scale-[0.99] disabled:opacity-40"
          disabled={loading}
        >
          {loading ? 'Processing Ledger...' : 'Compute Balances'}
        </button>
      </form>

      {error && <div className="bg-accent-red/5 border border-accent-red/20 rounded-xl p-4 text-xs font-semibold text-accent-red mb-4">⚠️ {error}</div>}

      {result && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="bg-bg-secondary/60 border border-border/40 rounded-xl p-4">
              <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Current Net Equity</span>
              <div className="text-lg font-black text-text-primary mt-1">{formatCurrency(result.currentValue, currencySymbol)}</div>
              <div className="text-[11px] text-text-muted font-medium mt-0.5">{formatNumber(result.sharesToday || result.quantity, 2)} positions</div>
            </div>
            <div className="bg-bg-secondary/60 border border-border/40 rounded-xl p-4">
              <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Ingested Cost Basis</span>
              <div className="text-lg font-black text-text-primary mt-1">{formatCurrency(result.purchaseCost, currencySymbol)}</div>
              <div className="text-[11px] text-text-muted font-medium mt-0.5">@{formatCurrency(result.buyPrice, currencySymbol)}</div>
            </div>
            <div className={`bg-bg-secondary/60 border border-border/40 rounded-xl p-4 ${result.capitalGain >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
              <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Capital Delta Balance</span>
              <div className="text-lg font-black mt-1">{result.capitalGain >= 0 ? '+' : ''}{formatCurrency(result.capitalGain, currencySymbol)}</div>
              <div className="text-[11px] font-bold mt-0.5">{result.capitalGainPct >= 0 ? '+' : ''}{formatPercent(result.capitalGainPct)}</div>
            </div>
            <div className="bg-bg-secondary/60 border border-border/40 rounded-xl p-4 text-accent-green">
              <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Cash Dividends Realized</span>
              <div className="text-lg font-black mt-1">+{formatCurrency(result.totalDividendGain, currencySymbol)}</div>
              <div className="text-[11px] text-text-muted font-medium mt-0.5">{result.dividendCount} distributions</div>
            </div>
            <div className={`bg-bg-secondary/60 border border-border/40 rounded-xl p-4 col-span-2 lg:col-span-1 ${result.netGain >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
              <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Aggregate Matrix Gains</span>
              <div className="text-lg font-black mt-1">{result.netGain >= 0 ? '+' : ''}{formatCurrency(result.netGain, currencySymbol)}</div>
              <div className="text-[11px] font-bold mt-0.5">{formatPercent(result.netGainPct)} ROI</div>
            </div>
          </div>

          {result.reinvest && (
            <div className="bg-gradient-to-br from-accent-blue/5 to-accent-teal/5 border border-border/50 rounded-xl p-4">
              <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Dividend Reinvestment Metrics (DRIP)</span>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-left">
                <div>
                  <span className="text-xs text-text-muted font-medium">Final Compounded Volume</span>
                  <div className="text-base font-extrabold text-text-primary mt-0.5">{formatNumber(result.reinvest.finalShares, 2)}</div>
                  <div className="text-xs text-accent-green font-bold">+{formatNumber(result.reinvest.extraShares, 2)} units</div>
                </div>
                <div>
                  <span className="text-xs text-text-muted font-medium">Aggregated DRIP Value</span>
                  <div className="text-base font-extrabold text-text-primary mt-0.5">{formatCurrency(result.reinvest.finalValue, currencySymbol)}</div>
                </div>
                <div>
                  <span className="text-xs text-text-muted font-medium">Compounded Revenue Delta</span>
                  <div className="text-base font-extrabold text-accent-green mt-0.5">+{formatCurrency(result.reinvest.extraValue, currencySymbol)}</div>
                </div>
                <div>
                  <span className="text-xs text-text-muted font-medium">Optimized Compounded Return</span>
                  <div className="text-base font-extrabold text-accent-green mt-0.5">{formatPercent(result.reinvest.totalReturnPct)}</div>
                  <div className="text-[11px] text-text-muted font-medium">Alpha gap: +{formatPercent(result.reinvest.totalReturnPct - result.netGainPct)}</div>
                </div>
              </div>
            </div>
          )}

          <SimulatorExport result={result} symbol={symbol} currencySymbol={currencySymbol} type="single" />
        </div>
      )}
    </div>
  );
};

export default PortfolioCalculator;
