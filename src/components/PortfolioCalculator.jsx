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
      setResult(data);
    } catch (err) {
      setError(err.message || 'Failed to calculate portfolio');
    } finally {
      setLoading(false);
    }
  };

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
          {/* ... existing result rendering ... */}
        </div>
      )}
    </div>
  );
};

export default PortfolioCalculator;