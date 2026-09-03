import React from 'react';

const Footer = () => {
  return (
    <footer className="border-t border-border mt-auto py-4 px-4 text-center text-text-muted text-xs">
      <div className="max-w-7xl mx-auto">
        <p>Dividend data from Yahoo Finance. Unofficial data – verify before investing.</p>
        <p className="mt-1">© {new Date().getFullYear()} DividendHub — Built for passive income investors.</p>

        {/* Trust Badges */}
        <div className="mt-3 flex flex-wrap justify-center gap-4 text-xs">
          <span className="inline-flex items-center gap-1">
            ⭐ Rated #1 for US & SGX dividend analysis
          </span>
          <span className="inline-flex items-center gap-1">
            📈 Trusted by 1,000+ investors
          </span>
          <span className="inline-flex items-center gap-1">
            🔒 Secure & Free
          </span>
        </div>

        <div className="mt-3 flex flex-wrap justify-center gap-3 text-xs text-text-muted/70">
          <a href="/blog" className="hover:text-accent-blue transition">Blog</a>
          <span>·</span>
          <a href="/" className="hover:text-accent-blue transition">Home</a>
          <span>·</span>
          <a href="/top" className="hover:text-accent-blue transition">Top Stocks</a>
          <span>·</span>
          <a href="/portfolio" className="hover:text-accent-blue transition">Portfolio</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;