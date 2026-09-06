import React, { useState, useEffect } from 'react';
import DatePicker from './DatePicker';

const EditHoldingModal = ({ isOpen, onClose, onSave, holding, currencySymbol }) => {
  const [quantity, setQuantity] = useState(1);
  const [purchaseDate, setPurchaseDate] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && holding) {
      setQuantity(holding.shares || 1);
      setPurchaseDate(holding.purchaseDate || '');
      setPurchasePrice(holding.purchasePrice || '');
      setError('');
    }
  }, [isOpen, holding]);

  if (!isOpen || !holding) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    
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
    onSave(holding.symbol, {
      shares: parseInt(quantity),
      purchaseDate: purchaseDate,
      purchasePrice: parseFloat(purchasePrice),
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-bg-secondary border border-border/80 rounded-2xl max-w-md w-full p-6 shadow-xl animate-in zoom-in-95 duration-200">
        <div className="mb-4">
          <h3 className="text-xl font-black text-text-primary tracking-tight">Modify Transaction Position</h3>
          <p className="text-text-muted text-xs font-medium mt-0.5">
            Adjusting records for <span className="text-text-primary font-bold">{holding.name || holding.symbol}</span> ({holding.symbol})
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] uppercase text-text-muted font-bold tracking-widest mb-1.5">
              Accumulated Share Count
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min="1"
              step="1"
              className="w-full bg-bg-primary/50 border border-border/60 rounded-xl px-4 py-2.5 text-sm font-medium text-text-primary focus:outline-none focus:border-accent-blue focus:ring-4 focus:ring-accent-blue/5"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase text-text-muted font-bold tracking-widest mb-1.5">
              Execution Timeline Date
            </label>
            <DatePicker
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase text-text-muted font-bold tracking-widest mb-1.5">
              Unit Purchase Cost (Per Share)
            </label>
            <input
              type="number"
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(e.target.value)}
              placeholder="e.g. 150.50"
              step="0.01"
              min="0.01"
              className="w-full bg-bg-primary/50 border border-border/60 rounded-xl px-4 py-2.5 text-sm font-medium text-text-primary focus:outline-none focus:border-accent-blue focus:ring-4 focus:ring-accent-blue/5"
              required
            />
          </div>

          {quantity && purchasePrice && parseFloat(quantity) > 0 && parseFloat(purchasePrice) > 0 && (
            <div className="bg-bg-surface/80 rounded-xl p-3 border border-border/40 flex justify-between items-center text-xs font-bold">
              <span className="text-text-muted uppercase tracking-wider">Recalculated Capital Outlay:</span>
              <span className="text-accent-teal text-sm font-mono font-black">
                {currencySymbol}{(parseFloat(quantity) * parseFloat(purchasePrice)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          )}

          {error && <p className="text-accent-red text-xs font-semibold">⚠️ {error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 py-3 bg-gradient-to-r from-accent-blue to-accent-teal text-white font-bold text-xs tracking-wider uppercase rounded-xl shadow-md active:scale-[0.99] transition-all"
            >
              Update Ledger
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 bg-bg-surface border border-border/60 text-text-secondary font-bold text-xs tracking-wider uppercase rounded-xl hover:bg-bg-surface-hover transition-all"
            >
              Discard Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditHoldingModal;
