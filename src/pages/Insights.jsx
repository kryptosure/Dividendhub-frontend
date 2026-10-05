import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { insights } from '../content/insights';

const Insights = () => {
  return (
    <>
      <Helmet>
        <title>Market Insights — DividendBro</title>
        <meta name="description" content="Weekly dividend analysis, earnings breakdowns, and market data for US, Canadian, and SGX investors." />
      </Helmet>

      <div className="max-w-4xl mx-auto py-10 px-4">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-accent-blue bg-accent-blue/10 border border-accent-blue/25 rounded-full mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-blue animate-pulse" />
            Updated Weekly
          </div>
          <h1 className="text-3xl font-black tracking-tight">Market Insights</h1>
          <p className="text-text-secondary text-sm mt-2">
            Short-form analysis on dividend news, earnings, and policy changes — filtered for what actually affects your income.
          </p>
        </div>

        <div className="space-y-3">
          {insights.map(insight => (
            <Link
              key={insight.slug}
              to={`/insights/${insight.slug}`}
              className="block bg-bg-surface border border-border/50 rounded-xl p-5 hover:border-accent-blue/40 transition-colors group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-accent-blue bg-accent-blue/10 px-2 py-0.5 rounded">
                      {insight.category}
                    </span>
                    <span className="text-[10px] text-text-muted font-medium">
                      {new Date(insight.date).toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <h2 className="font-bold text-base text-text-primary group-hover:text-accent-blue transition-colors leading-tight">
                    {insight.title}
                  </h2>
                  <p className="text-xs text-text-secondary mt-1.5 line-clamp-2">{insight.excerpt}</p>
                </div>
                <div className="text-2xl flex-shrink-0">{insight.emoji || '📊'}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
};

export default Insights;