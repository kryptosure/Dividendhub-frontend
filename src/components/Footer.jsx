import React from 'react';

const Footer = () => {
  return (
    <footer className="border-t border-border/40 bg-bg-secondary/20 mt-20 py-8 px-4 text-center text-text-muted text-[11px] font-medium leading-relaxed">
      <div className="max-w-4xl mx-auto space-y-4">
        <p>Market parsing telemetry supplied raw via Yahoo Finance. Analytical loops do not contain explicit fiduciary portfolio suggestions. Do your own research or consult your financial advisor before making any financial investments</p>
        
        {/* Modern Trust Chips */}
        <div className="flex flex-wrap justify-center gap-2 text-[10px] uppercase font-bold tracking-wider">
          <span className="bg-bg-surface border border-border/40 px-3 py-1 rounded-md text-accent-teal">⭐ US & SGX DIVIDEND ANALYTICS</span>
          <span className="bg-bg-surface border border-border/40 px-3 py-1 rounded-md text-accent-blue">🔒 SECURE CLIENT PLATFORM</span>
        </div>

        <p className="text-text-muted/60 font-mono mt-2">© {new Date().getFullYear()} DividendBro Ai Ecosystem. All property bounds reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
