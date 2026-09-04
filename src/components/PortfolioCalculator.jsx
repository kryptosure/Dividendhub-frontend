import React, { useState } from 'react';
import { calculatePortfolio } from '../services/api';
import useStore from '../store/useStore';
import { formatCurrency, formatNumber, formatPercent } from '../utils/formatters';

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
    console.log('PortfolioCalculator called with:', { symbol, market, purchaseDate, quantity });
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await calculatePortfolio(symbol, purchaseDate, parseFloat(quantity), market);
      console.log('✅ Result received:', data);
      setResult(data);
    } catch (err) {
      console.error('Portfolio error:', err);
      setError(err.message || 'Failed to calculate portfolio');
    } finally {
      setLoading(false);
    }
  };

  // If no symbol, show placeholder
  if (!symbol) {
    return (
      <div className="bg-bg-surface border border-border rounded-xl p-4">
        <h3 className="font-bold text-lg mb-2">📈 One Time Investment Return Analysis</h3>
        <p className="text-text-muted text-sm">Search a stock first to calculate gains.</p>
      </div>
    );
  }

  return (
    <div className="bg-bg-surface border border-border rounded-xl p-4">
      <h3 className="font-bold text-lg mb-2">📈 One Time Investment Return Analysis</h3>

      <form onSubmit={handleSubmit} className="flex flex-wrap gap-3 items-end mb-4">
        <div className="flex-1 min-w-[140px]">
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
        <div className="flex-1 min-w-[120px]">
          <label className="block text-xs uppercase text-text-muted font-semibold mb-1">
            Quantity
          </label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="e.g. 1000"
            className="w-full bg-bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue"
            min="0"
            step="1"
            required
          />
        </div>
        <button
          type="submit"
          className="px-6 py-2 bg-gradient-to-r from-accent-blue to-accent-teal text-white font-semibold rounded-full hover:shadow-lg transition disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Calculating...' : 'Calculate Gains'}
        </button>
      </form>

      {error && (
        <div className="bg-accent-red/10 border border-accent-red/20 rounded-lg p-3 text-accent-red text-sm mb-3">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="bg-bg-secondary p-3 rounded-lg">
              <div className="text-xs uppercase text-text-muted">Current Value</div>
              <div className="text-lg font-bold">
                {formatCurrency(result.currentValue, currencySymbol)}
              </div>
              <div className="text-xs text-text-muted">
                {formatNumber(result.sharesToday || result.quantity, 2)} shares
              </div>
            </div>
            <div className="bg-bg-secondary p-3 rounded-lg">
              <div className="text-xs uppercase text-text-muted">Invested Cost</div>
              <div className="text-lg font-bold">
                {formatCurrency(result.purchaseCost, currencySymbol)}
              </div>
              <div className="text-xs text-text-muted">
                @{formatCurrency(result.buyPrice, currencySymbol)}
              </div>
            </div>
            <div className={`bg-bg-secondary p-3 rounded-lg ${result.capitalGain >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
              <div className="text-xs uppercase text-text-muted">Capital Gains</div>
              <div className="text-lg font-bold">
                {result.capitalGain >= 0 ? '+' : ''}
                {formatCurrency(result.capitalGain, currencySymbol)}
              </div>
              <div className="text-xs">
                {result.capitalGainPct >= 0 ? '+' : ''}{formatPercent(result.capitalGainPct)}
              </div>
            </div>
            <div className="bg-bg-secondary p-3 rounded-lg text-accent-green">
              <div className="text-xs uppercase text-text-muted">Dividend Gains</div>
              <div className="text-lg font-bold">
                +{formatCurrency(result.totalDividendGain, currencySymbol)}
              </div>
              <div className="text-xs">{result.dividendCount} payouts</div>
            </div>
            <div className={`bg-bg-secondary p-3 rounded-lg col-span-2 md:col-span-1 ${result.netGain >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
              <div className="text-xs uppercase text-text-muted">Net Gains</div>
              <div className="text-lg font-bold">
                {result.netGain >= 0 ? '+' : ''}
                {formatCurrency(result.netGain, currencySymbol)}
              </div>
              <div className="text-xs">
                {result.netGainPct >= 0 ? '+' : ''}{formatPercent(result.netGainPct)} total return
              </div>
            </div>
          </div>

          {/* DRIP Section */}
          {result.reinvest && (
            <div className="bg-bg-secondary p-3 rounded-lg">
              <div className="text-xs uppercase text-text-muted font-semibold mb-2">
                Dividend Reinvestment (DRIP)
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <div className="text-xs text-text-muted">Final Shares</div>
                  <div className="font-bold">{formatNumber(result.reinvest.finalShares, 2)}</div>
                  <div className="text-xs text-accent-green">
                    +{formatNumber(result.reinvest.extraShares, 2)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-text-muted">Final Value</div>
                  <div className="font-bold">
                    {formatCurrency(result.reinvest.finalValue, currencySymbol)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-text-muted">Extra Value</div>
                  <div className="font-bold text-accent-green">
                    +{formatCurrency(result.reinvest.extraValue, currencySymbol)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-text-muted">Total Return (DRIP)</div>
                  <div className="font-bold text-accent-green">
                    {result.reinvest.totalReturnPct >= 0 ? '+' : ''}
                    {formatPercent(result.reinvest.totalReturnPct)}
                  </div>
                  <div className="text-xs text-text-muted">
                    vs {result.netGainPct >= 0 ? '+' : ''}{formatPercent(result.netGainPct)} without DRIP
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="text-text-muted text-xs">
            * {result.note || 'Dividends are per share as declared, multiplied by the quantity held since purchase. Buy price is the close on the last trading day on or before the purchase date.'}
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioCalculator;