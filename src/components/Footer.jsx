import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="border-t border-border/40 bg-bg-secondary/20 mt-20 py-6 px-2 text-center text-text-muted text-[10px] sm:text-[11px] font-medium leading-relaxed">
      <div className="max-w-md md:max-w-4xl mx-auto space-y-4">

        {/* Explore links — internal SEO signals */}
        <nav className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-[10px] font-bold uppercase tracking-wider">
          <Link to="/screener" className="text-text-secondary hover:text-accent-blue transition-colors">
            Screener
          </Link>
          <Link to="/weekly-dividend-etfs" className="text-text-secondary hover:text-accent-blue transition-colors">
            Weekly Dividend ETFs
          </Link>
          <Link to="/monthly-dividend-stocks" className="text-text-secondary hover:text-accent-blue transition-colors">
            Monthly Dividend Stocks
          </Link>
          <Link to="/reits-that-pay-monthly" className="text-text-secondary hover:text-accent-blue transition-colors">
            Monthly REITs
          </Link>
          <Link to="/daily-dividend-stocks" className="text-text-secondary hover:text-accent-blue transition-colors">
            Daily Dividend Stocks
          </Link>
          <Link to="/top" className="text-text-secondary hover:text-accent-blue transition-colors">
            Top Dividend Stocks
          </Link>
          <Link to="/compare" className="text-text-secondary hover:text-accent-blue transition-colors">
            Compare
          </Link>
          <Link to="/blog" className="text-text-secondary hover:text-accent-blue transition-colors">
            Insights
          </Link>
        </nav>

        <p>Market parsing telemetry supplied raw via Yahoo Finance. Analytical loops do not contain explicit fiduciary portfolio suggestions. Do your own research or consult your financial advisor before making any financial investments</p>

        <div className="flex flex-wrap justify-center gap-2 text-[9px] uppercase font-bold tracking-wider">
          <span className="bg-bg-surface border border-border/40 px-2.5 py-1 rounded-md text-accent-teal">⭐ US & SGX DIVIDEND ANALYTICS</span>
          <span className="bg-bg-surface border border-border/40 px-2.5 py-1 rounded-md text-accent-blue">🔒 SECURE CLIENT PLATFORM</span>
        </div>

        <p className="text-text-muted/60 font-mono mt-2">© {new Date().getFullYear()} DividendBro Ai Ecosystem. All property bounds reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;