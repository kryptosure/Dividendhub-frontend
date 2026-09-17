import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const SITE_URL = 'https://dividendbro.com';

const DAILY_PAYERS = [
  {
    ticker: 'SATA',
    name: 'Strive Variable Rate Series A Perpetual Preferred Stock',
    issuer: 'Strive, Inc. (Nasdaq: ASST)',
    status: 'Live',
    firstPayment: 'June 16, 2026',
    annualRate: '13.00%',
    effectiveYield: '~13.88%',
    parValue: '$100.00',
    perDay: '~$0.0492',
    paymentDays: '~250/year',
    treasury: 'Bitcoin (23,156 BTC held unencumbered)',
    reserve: '18 months of dividend coverage',
    description:
      'SATA is the first listed security in U.S. capital markets history to pay cash dividends every business day. Strive maintains a Bitcoin treasury to back the distribution and has set aside an 18-month dividend reserve in liquid assets. Dividends are cumulative — if a payment is ever missed, it accrues and must be paid before common dividends.',
    caveat:
      'Backed by a Bitcoin treasury. If Bitcoin collapses, the reserve could deplete and the dividend rate can be adjusted by the board. Not a traditional "safe income" security.',
  },
  {
    ticker: 'CHAD',
    name: 'DeFi Development Variable Rate Series C Perpetual Preferred Stock',
    issuer: 'DeFi Development Corp. (Nasdaq: DFDV)',
    status: 'IPO priced, payments begin Oct 1, 2026',
    firstPayment: 'October 1, 2026',
    annualRate: '13.00%',
    effectiveYield: '~16.25% (at IPO price)',
    parValue: '$10.00',
    perDay: '~$0.0036',
    paymentDays: '~250/year',
    treasury: 'Solana (SOL)',
    reserve: '$1.30 per share dividend reserve',
    description:
      'CHAD is the second security attempting daily dividends. DeFi Development Corp. holds a Solana treasury and has funded a per-share dividend reserve. Dividends are cumulative and paid daily, when declared by the board.',
    caveat:
      'Backed by a Solana treasury. Even more volatile than Bitcoin. Very small offering ($11M) and highly speculative.',
  },
];

const FAQS = [
  {
    q: 'Are there any daily dividend stocks besides SATA and CHAD?',
    a: 'No. As of September 2026, SATA and CHAD are the only two securities in U.S. capital markets paying cash dividends every business day. No ETF, mutual fund, or traditional stock pays daily dividends. The concept was pioneered in June 2026 and the category is still essentially brand new.',
  },
  {
    q: 'Do daily dividend stocks actually pay every day?',
    a: 'They pay every business day — approximately 250 days per year. Weekends and market holidays are skipped. The exact number depends on the NYSE calendar each year. For SATA, the annualized rate is divided across those ~250 payment days.',
  },
  {
    q: 'How much do daily dividend payers pay per day?',
    a: 'For SATA, the per-day accrual was approximately $0.049 per share in July 2026. For CHAD, the rate is about $0.0036 per share per day (based on $10 par value and 13% annualized). These amounts adjust whenever the board resets the annual rate.',
  },
  {
    q: 'Are daily dividend stocks safe?',
    a: 'No. Both SATA and CHAD are preferred stocks issued by crypto-treasury companies. They are far riskier than blue-chip dividend stocks. The 13% rate is variable and can be reduced by the board at any time. The dividend reserve provides near-term coverage but is funded from the company\'s own assets — if the underlying crypto treasury collapses, so does the reserve.',
  },
  {
    q: 'How are daily dividends taxed?',
    a: 'In most cases, daily preferred stock distributions are taxed as ordinary income, not qualified dividends. For Singapore-based investors, U.S. preferred stock dividends are subject to the standard 30% U.S. withholding tax. That means the 13% headline rate becomes ~9.1% after tax for most non-US investors.',
  },
  {
    q: 'Will more daily dividend stocks launch?',
    a: 'Likely yes. The crypto-treasury preferred stock model (pioneered by Strategy\'s STRC and Strive\'s SATA) has been copied quickly. Two or three more Bitcoin or Solana treasury companies have filed for similar instruments. But as of September 2026, only SATA and CHAD are live or priced.',
  },
];

const FREQUENCY_COMPARISON = [
  { frequency: 'Daily', count: 2, examples: 'SATA, CHAD', note: 'Preferred stocks only. No ETF exists.' },
  { frequency: 'Weekly', count: 73, examples: 'MSTY, ULTY, XDTE', note: 'Options-income ETFs. Return of capital.' },
  { frequency: 'Monthly', count: 133, examples: 'O, MAIN, JEPI', note: 'REITs, BDCs, CEFs, covered-call ETFs.' },
  { frequency: 'Quarterly', count: 373, examples: 'KO, JNJ, SCHD', note: 'Traditional dividend stocks.' },
];

const DailyDividendStocks = () => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return (
    <>
      <Helmet>
        <title>Daily Dividend Stocks — The Complete List (2026) | DividendBro</title>
        <meta name="description" content="Every security paying daily dividends in 2026. SATA and CHAD are the only two — this page tracks them, their yields, and the risks behind the 13% rate." />
        <link rel="canonical" href={`${SITE_URL}/daily-dividend-stocks`} />
        <meta property="og:title" content="Daily Dividend Stocks — The Complete List (2026)" />
        <meta property="og:description" content="Every security paying daily dividends in 2026. SATA and CHAD are the only two — here's what you need to know." />
        <meta property="og:url" content={`${SITE_URL}/daily-dividend-stocks`} />
        <meta property="og:type" content="article" />
        <meta property="og:image" content={`${SITE_URL}/images/cover.png`} />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      </Helmet>

      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-10">

        <header className="space-y-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-accent-teal">
            DividendBro Research
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-text-primary leading-tight">
            Daily Dividend Stocks: The <span className="bg-gradient-to-r from-accent-blue to-accent-teal bg-clip-text text-transparent">Complete List</span>
          </h1>
          <p className="text-text-secondary text-base sm:text-lg leading-relaxed max-w-3xl">
            Only two securities in U.S. capital markets pay cash dividends every business day. Both launched in 2026. Here's everything you need to know about the daily dividend category — how it works, what it pays, and the risks behind the 13% headline rate.
          </p>
          <p className="text-text-muted text-xs">
            Updated September 2026 · 2 daily payers tracked · SATA + CHAD
          </p>
        </header>

        <div className="bg-accent-yellow/5 border border-accent-yellow/25 rounded-2xl p-4">
          <p className="text-[11px] text-accent-yellow font-bold uppercase tracking-wider mb-1">
            Not financial advice
          </p>
          <p className="text-[11px] text-text-muted leading-relaxed">
            Daily dividend payers are crypto-backed preferred stocks, not traditional income securities. They carry significant risk, including the potential loss of principal. The 13% rate is variable and not guaranteed. Verify all data on the issuer's website before investing.
          </p>
        </div>

        <section className="bg-bg-surface border border-border/50 rounded-2xl p-6 space-y-3">
          <h2 className="text-xl font-black text-text-primary tracking-tight">
            What is a daily dividend stock?
          </h2>
          <p className="text-text-secondary text-sm leading-relaxed">
            A daily dividend stock pays cash to shareholders every <strong className="text-text-primary">business day</strong> — approximately 250 payments per year instead of 4 (quarterly) or 12 (monthly). The concept was pioneered in June 2026 when Strive Inc. began paying daily dividends on its SATA preferred stock, marking the first time any listed security in U.S. capital markets history paid cash on a daily cadence.
          </p>
          <p className="text-text-secondary text-sm leading-relaxed">
            Daily dividends are only possible with <strong className="text-text-primary">cumulative preferred stock</strong>, not common stock. Preferred stock allows the board to set a variable rate and declare dividends monthly for the following month's payments. The daily accrual is mechanical — the annualized rate is simply divided by the number of business days in the year.
          </p>
          <p className="text-text-secondary text-sm leading-relaxed">
            The two live (or priced) products are both issued by crypto-treasury companies: SATA by Strive (Bitcoin treasury) and CHAD by DeFi Development Corp (Solana treasury). Both pay ~13% annualized.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-black text-text-primary tracking-tight">
            The only two daily dividend payers in existence
          </h2>
          <p className="text-text-secondary text-sm leading-relaxed">
            Every field below is verified against SEC filings, the issuer's investor relations page, or GlobeNewswire press releases. Yields move daily.
          </p>

          <div className="space-y-4">
            {DAILY_PAYERS.map((p) => (
              <div key={p.ticker} className="bg-bg-surface border border-border/50 rounded-2xl p-5 space-y-4">
                <div className="flex items-start justify-between flex-wrap gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-lg font-black text-accent-teal">{p.ticker}</span>
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${
                        p.status === 'Live'
                          ? 'bg-accent-green/10 border-accent-green/20 text-accent-green'
                          : 'bg-accent-yellow/10 border-accent-yellow/20 text-accent-yellow'
                      }`}>{p.status}</span>
                    </div>
                    <p className="text-sm font-bold text-text-primary mt-1">{p.name}</p>
                    <p className="text-[11px] text-text-muted mt-0.5">{p.issuer}</p>
                  </div>
                </div>

                <p className="text-sm text-text-secondary leading-relaxed">{p.description}</p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-bg-primary border border-border/40 rounded-xl p-3">
                    <p className="text-[9px] uppercase text-text-muted font-bold tracking-wider">Annual Rate</p>
                    <p className="text-base font-black text-accent-green mt-1">{p.annualRate}</p>
                  </div>
                  <div className="bg-bg-primary border border-border/40 rounded-xl p-3">
                    <p className="text-[9px] uppercase text-text-muted font-bold tracking-wider">Effective Yield</p>
                    <p className="text-base font-black text-accent-teal mt-1">{p.effectiveYield}</p>
                  </div>
                  <div className="bg-bg-primary border border-border/40 rounded-xl p-3">
                    <p className="text-[9px] uppercase text-text-muted font-bold tracking-wider">Par Value</p>
                    <p className="text-base font-black text-text-primary mt-1">{p.parValue}</p>
                  </div>
                  <div className="bg-bg-primary border border-border/40 rounded-xl p-3">
                    <p className="text-[9px] uppercase text-text-muted font-bold tracking-wider">Per Business Day</p>
                    <p className="text-base font-black text-text-primary mt-1">{p.perDay}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="flex items-start gap-2">
                    <span className="text-text-muted font-bold uppercase tracking-wider w-24 flex-shrink-0">First Payment</span>
                    <span className="text-text-primary font-semibold">{p.firstPayment}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-text-muted font-bold uppercase tracking-wider w-24 flex-shrink-0">Payment Days</span>
                    <span className="text-text-primary font-semibold">{p.paymentDays}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-text-muted font-bold uppercase tracking-wider w-24 flex-shrink-0">Treasury</span>
                    <span className="text-text-primary font-semibold">{p.treasury}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-text-muted font-bold uppercase tracking-wider w-24 flex-shrink-0">Reserve</span>
                    <span className="text-text-primary font-semibold">{p.reserve}</span>
                  </div>
                </div>

                <div className="bg-accent-red/5 border border-accent-red/20 rounded-xl p-3">
                  <p className="text-[11px] text-accent-red/90 leading-relaxed">
                    <strong className="text-accent-red font-black">Risk:</strong> {p.caveat}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-black text-text-primary tracking-tight">
            How daily dividends compare to other frequencies
          </h2>

          <div className="overflow-x-auto mobile-scroll">
            <table className="w-full text-sm border-collapse">
              <thead className="bg-bg-primary/50 text-text-muted uppercase font-bold tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3 text-left">Frequency</th>
                  <th className="px-4 py-3 text-right">Count</th>
                  <th className="px-4 py-3 text-left">Examples</th>
                  <th className="px-4 py-3 text-left">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/10">
                {FREQUENCY_COMPARISON.map((row) => (
                  <tr key={row.frequency} className={row.frequency === 'Daily' ? 'bg-accent-teal/5' : ''}>
                    <td className="px-4 py-3 font-bold text-text-primary">{row.frequency}</td>
                    <td className="px-4 py-3 text-right font-mono text-accent-blue font-bold">{row.count}</td>
                    <td className="px-4 py-3 font-mono text-xs text-accent-teal">{row.examples}</td>
                    <td className="px-4 py-3 text-xs text-text-muted">{row.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-black text-text-primary tracking-tight">
            The risks nobody talks about
          </h2>

          <div className="space-y-3">
            <div className="bg-bg-surface border border-border/50 rounded-2xl p-5">
              <h3 className="font-bold text-text-primary text-base mb-2">The rate is variable, not fixed</h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                The 13% annualized rate on SATA is set by the board of directors and reviewed monthly. It can be reduced at any time. It is not a bond coupon. Anyone comparing SATA to a 13% high-yield bond is making a category error.
              </p>
            </div>

            <div className="bg-bg-surface border border-border/50 rounded-2xl p-5">
              <h3 className="font-bold text-text-primary text-base mb-2">Crypto treasury dependency</h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                SATA's dividend reserve is funded from a Bitcoin treasury. CHAD's is funded from a Solana treasury. A sustained crypto drawdown would reduce the value of the reserve, forcing either a rate cut or a treasury sale. The reserve provides near-term coverage, not permanent safety.
              </p>
            </div>

            <div className="bg-bg-surface border border-border/50 rounded-2xl p-5">
              <h3 className="font-bold text-text-primary text-base mb-2">Preferred stock structure</h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                Preferred stock is senior to common stock in bankruptcy but junior to all debt. If the issuer becomes insolvent, preferred holders are in line behind every bondholder. SATA investors do not own a claim on the Bitcoin treasury directly — they own a preferred share whose dividend depends on the company's ongoing viability.
              </p>
            </div>

            <div className="bg-bg-surface border border-border/50 rounded-2xl p-5">
              <h3 className="font-bold text-text-primary text-base mb-2">30% US withholding tax for SG investors</h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                Singapore residents pay 30% US withholding tax on preferred stock dividends. SATA's 13% headline rate becomes ~9.1% after tax. When you factor in potential NAV drift and the variable rate, the effective yield advantage over a Singapore bank stock or SGX REIT narrows considerably.
              </p>
            </div>

            <div className="bg-bg-surface border border-border/50 rounded-2xl p-5">
              <h3 className="font-bold text-text-primary text-base mb-2">Daily isn't inherently better than monthly</h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                Strive's own marketing points out that daily compounding lifts the effective yield by ~7.6 basis points versus monthly. That's real but tiny. If the underlying security is risky, receiving dividends more frequently doesn't make it less risky.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-black text-text-primary tracking-tight">
            Frequently asked questions
          </h2>
          <div className="space-y-3">
            {FAQS.map((f, i) => (
              <details key={i} className="bg-bg-surface border border-border/50 rounded-2xl group">
                <summary className="px-5 py-4 cursor-pointer font-bold text-sm text-text-primary flex items-center justify-between hover:text-accent-blue transition-colors">
                  {f.q}
                  <span className="text-text-muted group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="px-5 pb-5 pt-0 text-sm text-text-secondary leading-relaxed border-t border-border/20 mt-2">
                  {f.a}
                </div>
              </details>
            ))}
          </div>
        </section>

        <section className="bg-gradient-to-br from-accent-blue/10 via-bg-surface to-accent-teal/10 border border-accent-blue/20 rounded-2xl p-6 sm:p-8 text-center">
          <h2 className="text-xl sm:text-2xl font-black text-text-primary tracking-tight mb-2">
            See all 643 dividend payers — daily, weekly, monthly, quarterly
          </h2>
          <p className="text-text-secondary text-sm mb-5 max-w-xl mx-auto">
            Our screener tracks every dividend-paying security across US and SGX markets. Filter by payout frequency, asset type, and risk.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to="/screener"
              className="px-6 py-3 bg-gradient-to-r from-accent-blue to-accent-teal text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md hover:opacity-95 active:scale-95 transition-all"
            >
              Open Dividend Screener
            </Link>
            <Link
              to="/weekly-dividend-etfs"
              className="px-6 py-3 bg-bg-surface border border-border/60 text-text-secondary text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-bg-surface-hover transition-all"
            >
              Weekly Dividend ETFs
            </Link>
          </div>
        </section>

        <div className="bg-bg-surface border border-border/40 rounded-2xl p-5">
          <p className="text-[10px] uppercase tracking-widest text-text-muted font-bold mb-2">
            Important Disclosures
          </p>
          <p className="text-[11px] text-text-muted leading-relaxed">
            DividendBro is not a licensed financial adviser. This page is for educational purposes only and does not constitute investment advice. Daily dividend securities carry significant risk, including loss of principal. The 13% rates shown are variable and subject to adjustment by the issuers' boards. Neither SATA nor CHAD have a payment history long enough to establish reliability. Past performance is not indicative of future results. Consult a licensed financial adviser before investing.
          </p>
        </div>
      </div>
    </>
  );
};

export default DailyDividendStocks;