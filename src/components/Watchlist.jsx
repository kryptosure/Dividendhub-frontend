// src/components/Watchlist.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom'; // Imported for navigation
import useStore from '../store/useStore';

const Watchlist = () => {
  // Hook for navigation
  const navigate = useNavigate(); 

  // Select only what is needed from the store for performance
  const watchlist = useStore((state) => state.watchlist);
  const removeFromWatchlist = useStore((state) => state.removeFromWatchlist);

  // Function to handle clicking a stock
  const handleStockClick = (symbol) => {
    // Navigates to the home page and sets the ?symbol= query parameter
    navigate(`/?symbol=${symbol}`);
  };

  if (watchlist.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <span className="text-6xl mb-4">📭</span>
        <h2 className="text-2xl font-bold mb-2">Your Watchlist is empty</h2>
        <p className="text-text-muted">Search for a stock above and click the + button to add it here.</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">My Watchlist</h1>
      <div className="grid gap-4">
        {watchlist.map((item) => (
          <div 
            key={item.symbol} 
            // Added onClick, cursor-pointer, and a hover effect
            onClick={() => handleStockClick(item.symbol)}
            className="flex justify-between items-center bg-bg-secondary p-4 rounded-lg border border-border cursor-pointer transition hover:bg-bg-tertiary"
          >
            <div>
              <h3 className="font-bold text-lg">{item.name}</h3>
              <p className="text-sm text-text-muted">{item.symbol} • {item.market?.toUpperCase()}</p>
            </div>
            <button
              // e.stopPropagation() stops the click from bubbling up to the parent div
              onClick={(e) => {
                e.stopPropagation();
                removeFromWatchlist(item.symbol);
              }}
              className="text-red-400 hover:text-red-600 px-3 py-1"
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