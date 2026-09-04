import React, { useState } from 'react';
import DatePicker from './DatePicker';

const AddToPortfolioModal = ({ isOpen, onClose, onAdd, symbol, name, market = 'us' }) => {
  const [quantity, setQuantity] = useState(1);
  const [purchaseDate, setPurchaseDate] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [error, setError] = useState('');

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setPurchaseDate('');
      setPurchasePrice('');
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
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
    onAdd({
      symbol,
      name,
      shares: parseInt(quantity),
      purchaseDate: purchaseDate,
      purchasePrice: parseFloat(purchasePrice),
      market: market
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-bg-secondary border border-border rounded-xl max-w-md w-full p-6 shadow-xl">
        <h3 className="text-xl font-bold mb-2">Add to Portfolio</h3>
        <p className="text-text-muted text-sm mb-4">
          <span className="font-semibold text-text-primary">{name || symbol}</span> ({symbol})
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
              placeholder="e.g. 100"
              className="w-full bg-bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue"
              required
            />
          </div>

          <div>
            <label className="block text-xs uppercase text-text-muted font-semibold mb-1">
              Purchase Date
            </label>
            <DatePicker
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
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
            <p className="text-text-muted text-xs mt-1">
              Enter the price you paid per share
            </p>
          </div>

          {/* Show total cost preview */}
          {quantity && purchasePrice && parseFloat(quantity) > 0 && parseFloat(purchasePrice) > 0 && (
            <div className="bg-bg-surface rounded-lg p-3 border border-border">
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Total Cost:</span>
                <span className="text-text-primary font-semibold">
                  ${(parseFloat(quantity) * parseFloat(purchasePrice)).toFixed(2)}
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
              Add to Portfolio
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

export default AddToPortfolioModal;