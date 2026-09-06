import React from 'react';

const AnalystRatings = ({ ratings }) => {
  if (!ratings || Object.keys(ratings).length === 0) return null;

  return (
    <div className="bg-bg-surface border border-border/50 rounded-2xl p-5 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-black tracking-tight text-text-primary">🎯 Institutional Directives</h3>
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-text-muted bg-bg-secondary border border-border/40 px-2 py-0.5 rounded-md">Epoch: {ratings.period}</span>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs font-bold">
        {ratings.strongBuy > 0 && (
          <div className="bg-accent-green/5 border border-accent-green/10 rounded-xl p-3">
            <div className="text-xl font-black text-accent-green">{ratings.strongBuy}</div>
            <div className="text-[10px] uppercase tracking-wider text-text-muted mt-0.5">Strong Buy</div>
          </div>
        )}
        {ratings.buy > 0 && (
          <div className="bg-accent-teal/5 border border-accent-teal/10 rounded-xl p-3">
            <div className="text-xl font-black text-accent-teal">{ratings.buy}</div>
            <div className="text-[10px] uppercase tracking-wider text-text-muted mt-0.5">Buy Target</div>
          </div>
        )}
        {ratings.hold > 0 && (
          <div className="bg-accent-yellow/5 border border-accent-yellow/10 rounded-xl p-3">
            <div className="text-xl font-black text-accent-yellow">{ratings.hold}</div>
            <div className="text-[10px] uppercase tracking-wider text-text-muted mt-0.5">Hold Neutral</div>
          </div>
        )}
        {ratings.sell > 0 && (
          <div className="bg-accent-red/5 border border-accent-red/10 rounded-xl p-3">
            <div className="text-xl font-black text-accent-red">{ratings.sell}</div>
            <div className="text-[10px] uppercase tracking-wider text-text-muted mt-0.5">Liquidate</div>
          </div>
        )}
        {ratings.strongSell > 0 && (
          <div className="bg-accent-red/10 border border-accent-red/20 rounded-xl p-3">
            <div className="text-xl font-black text-accent-red">{ratings.strongSell}</div>
            <div className="text-[10px] uppercase tracking-wider text-text-muted mt-0.5">Strong Sell</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalystRatings;
