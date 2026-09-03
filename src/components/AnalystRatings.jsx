import React from 'react';

const AnalystRatings = ({ ratings }) => {
  if (!ratings || Object.keys(ratings).length === 0) {
    return null;
  }

  return (
    <div className="bg-bg-surface border border-border rounded-xl p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">Analyst Ratings</h3>
        <span className="text-xs text-text-muted">Period: {ratings.period}</span>
      </div>
      
      <div className="flex gap-4">
        {ratings.strongBuy > 0 && (
          <div className="flex-1 text-center bg-green-500/10 rounded-lg p-3">
            <div className="text-2xl font-bold text-green-500">{ratings.strongBuy}</div>
            <div className="text-xs text-text-muted">Strong Buy</div>
          </div>
        )}
        {ratings.buy > 0 && (
          <div className="flex-1 text-center bg-green-400/10 rounded-lg p-3">
            <div className="text-2xl font-bold text-green-400">{ratings.buy}</div>
            <div className="text-xs text-text-muted">Buy</div>
          </div>
        )}
        {ratings.hold > 0 && (
          <div className="flex-1 text-center bg-yellow-500/10 rounded-lg p-3">
            <div className="text-2xl font-bold text-yellow-500">{ratings.hold}</div>
            <div className="text-xs text-text-muted">Hold</div>
          </div>
        )}
        {ratings.sell > 0 && (
          <div className="flex-1 text-center bg-red-500/10 rounded-lg p-3">
            <div className="text-2xl font-bold text-red-500">{ratings.sell}</div>
            <div className="text-xs text-text-muted">Sell</div>
          </div>
        )}
        {ratings.strongSell > 0 && (
          <div className="flex-1 text-center bg-red-400/10 rounded-lg p-3">
            <div className="text-2xl font-bold text-red-400">{ratings.strongSell}</div>
            <div className="text-xs text-text-muted">Strong Sell</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalystRatings;