import React from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';

const Watchlist = () => {
  const navigate = useNavigate(); 
  const watchlist = useStore((state) => state.watchlist);
  const removeFromWatchlist = useStore((state) => state.removeFromWatchlist);

  const handleStockClick = (symbol) => {
    navigate(`/?symbol=${encodeURIComponent(symbol.toUpperCase())}`);
  };

  if (watchlist.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border/40 rounded-2xl bg-bg-surface/30 max-w-xl mx-auto mt-6">
        <span className="text-5xl mb-3">📭</span>
        <h4 className="text-base font-bold text-text-primary">Watchlist Empty</h4>
        <p className="text-text-muted text-xs font-medium mt-1 max-w-xs">Flag securities inside core analytic tools to link them to your monitoring feed panels.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-0 mt-4 animate-in fade-in duration-200">
      <h1 className="text-2xl font-black text-text-primary tracking-tight mb-6">🎯 Watchlist Vectors</h1>
      <div className="grid gap-3 sm:grid-cols-2">
        {watchlist.map((item) => (
          <div 
            key={item.symbol} 
            onClick={() => handleStockClick(item.symbol)}
            className="flex justify-between items-center bg-bg-surface border border-border/50 p-4 rounded-xl cursor-pointer hover:border-border transition-all duration-200 group hover:shadow-sm"
          >
            <div className="min-w-0 pr-4">
              <h3 className="font-bold text-sm text-text-primary truncate group-hover:text-accent-blue transition-colors">{item.name || item.symbol}</h3>
              <p className="text-xs font-mono font-bold text-accent-teal mt-0.5 tracking-wider uppercase">{item.symbol} • {item.market || 'US NODE'}</p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeFromWatchlist(item.symbol);
              }}
              className="text-xs font-bold text-accent-red bg-accent-red/5 px-3 py-1.5 border border-accent-red/10 rounded-lg hover:bg-accent-red/10 transition-colors flex-shrink-0"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Watchlist;
