import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getScreenerStocks } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const SITE_URL = 'https://dividendbro.com';

// ---------- Curated editorial data ----------
// Yields shown are indicative of recent distribution rates, not guarantees.
const ISSUERS = [
  {
    name: 'YieldMax',
    tickers: ['MSTY', 'CONY', 'ULTY', 'TSLY', 'NVDY', 'YMAX', 'YMAG', 'SLTY', 'CHPY', 'GPTY', 'LFGY'],
    strategy: 'Single-stock option income — sells call spreads on one underlying company. Captures premium, but caps upside.',
    note: 'Largest weekly-payer family. Distribution rates range from ~30% to ~200%+ annualised.',
  },
  {
    name: 'Roundhill',
    tickers: ['XDTE', 'QDTE', 'RDTE', 'MAGY', 'WEEK', 'AAPW', 'NVW', 'TSLW', 'MSTW', 'PLTW', 'COIW'],
    strategy: '0DTE covered calls on broad indices, plus WeeklyPay single-stock leverage. WEEK is a T-bill ladder — the only non-options weekly payer.',
    note: 'WEEK is the only "safe" weekly payer in the market. Everything else is an options strategy.',
  },
  {
    name: 'Defiance',
    tickers: ['QQQY', 'IWMY', 'WDTE', 'SPYT', 'GLDY', 'MST'],
    strategy: 'Weekly distribution ETFs tracking Nasdaq-100, Russell 2000, and S&P 500 with call-overlay income.',
    note: 'Lower headline yields than YieldMax, but broader index exposure reduces single-stock concentration.',
  },
  {
    name: 'GraniteShares',
    tickers: ['NVYY', 'XBTY', 'COYY', 'TSYY', 'AMYY', 'TQQY', 'IOYY', 'YSPY', 'QBY', 'RGYY'],
    strategy: 'YieldBOOST — leverages the underlying stock and writes puts to generate weekly premium.',
    note: 'Highest-yielding group. TSYY and COYY frequently show 200%+ headline yields.',
  },
  {
    name: 'REX Shares',
    tickers: ['FEPI', 'AIPI', 'CEPI'],
    strategy: 'Income-focused ETFs with weekly distributions on concentrated tech and AI themes.',
    note: 'FEPI and AIPI pay on Thursdays; XDTE and QDTE pay on Fridays.',
  },
];

// ---------- Curated frequency table for the "how it works" section ----------
const FREQUENCY_COMPARISON = [
  { frequency: 'Daily', count: 0, examples: 'None at scale', note: 'SATA and CHAD are preferred stocks, not ETFs. No mass-market daily ETF exists yet.' },
  { frequency: 'Weekly', count: 73, examples: 'MSTY, ULTY, XDTE, COYY', note: 'All options-income strategies except WEEK (T-bills).' },
  { frequency: 'Monthly', count: 133, examples: 'JEPI, JEPQ, O, MAIN', note: 'REITs, BDCs, CEFs, and covered-call ETFs.' },
  { frequency: 'Quarterly', count: 338, examples: 'KO, JNJ, SCHD, VYM', note: 'Traditional dividend stocks and index funds.' },
];

const WeeklyDividendETFs = () => {
  // Pull live weekly data from the screener API
  const { data: weeklyData, isLoading } = useQuery({
    queryKey: ['weekly-etfs-landing'],
    queryFn: () => getScreenerStocks({
      market: 'us',
      frequency: 'weekly',
      assetType: 'all',
      sort: 'yield-desc',
      limit: 500,
    }),
    staleTime: 30 * 60 * 1000,
  });

  const weeklyEtfs = weeklyData?.stocks || [];

  // Group by issuer for the issuers section
  const byTicker = useMemo(() => {
    const map = {};
    for (const e of weeklyEtfs) map[e.symbol] = e;
    return map;
  }, [weeklyEtfs]);

  const fmt = (n) => (n == null || isNaN(n) ? '—' : Number(n).toFixed(2));

  // Structured data for Google
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What are weekly dividend ETFs?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Weekly dividend ETFs are exchange-traded funds that distribute cash to shareholders every week instead of the traditional quarterly or monthly schedule. Most use options-selling strategies to generate the income, which means distributions often include return of capital rather than pure dividend income.',
        },
      },
      {
        '@type': 'Question',
        name: 'Are weekly dividend ETFs safe?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Most weekly dividend ETFs are high-risk. Their headline yields of 30% to 200%+ come from selling options, not from underlying dividend income. Many experience NAV erosion — the fund pays out more than it earns, reducing the share price over time. The Roundhill Weekly T-Bill ETF (WEEK) is the only widely-held weekly payer that generates income from Treasury bills rather than options.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is the highest-yielding weekly dividend ETF?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'As of September 2026, MSTY (YieldMax MSTR Option Income Strategy ETF) and TSYY (GraniteShares YieldBOOST TSLA) have shown the highest headline distribution rates, occasionally exceeding 400% annualised. These figures are misleading — they reflect return of capital and are not sustainable. Always check the 30-day SEC yield alongside the distribution rate.',
        },
      },
      {
        '@type': 'Question',
        name: 'Do weekly dividend ETFs pay qualified dividends?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Rarely. Most weekly distributions from options-income ETFs are classified as ordinary income or return of capital, not qualified dividends. Return of capital is not immediately taxed — it reduces your cost basis — but the tax bill is deferred, not eliminated. This makes weekly ETFs less tax-efficient than traditional dividend stocks in a taxable account.',
        },
      },
    ],
  };

  return (
    <>
      <Helmet>
        <title>Weekly Dividend ETFs — Full List of 73 Weekly Payers (2026) | DividendBro</title>
        <meta name="description" content="Complete list of every weekly dividend ETF in 2026, filtered by issuer, yield, and strategy. Includes YieldMax, Roundhill, Defiance, and GraniteShares weekly payers. Updated live." />
        <link rel="canonical" href={`${SITE_URL}/weekly-dividend-etfs`} />
        <meta property="og:title" content="Weekly Dividend ETFs — Full List of 73 Weekly Payers (2026)" />
        <meta property="og:description" content="Every weekly dividend ETF in one place. Live yields, issuer breakdown, and the risks nobody talks about." />
        <meta property="og:url" content={`${SITE_URL}/weekly-dividend-etfs`} />
        <meta property="og:type" content="article" />
        <meta property="og:image" content={`${SITE_URL}/images/cover.png`} />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      </Helmet>

      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-10">

        {/* ========== Hero ========== */}
        <header className="space-y-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-accent-teal">
            DividendBro Research
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-text-primary leading-tight">
            Weekly Dividend ETFs: The Full List of <span className="bg-gradient-to-r from-accent-blue to-accent-teal bg-clip-text text-transparent">{weeklyEtfs.length || 73} Weekly Payers</span>
          </h1>
          <p className="text-text-secondary text-base sm:text-lg leading-relaxed max-w-3xl">
            Every ETF that pays cash to shareholders every week — YieldMax, Roundhill, Defiance, GraniteShares, and REX. Live yields, strategies, and the risks most YouTube videos won't tell you about.
          </p>
          <p className="text-text-muted text-xs">
            Updated September 2026 · {weeklyEtfs.length || 73} tickers tracked · Data from Yahoo Finance + issuer disclosures
          </p>
        </header>

        {/* ========== Compliance banner ========== */}
        <div className="bg-accent-yellow/5 border border-accent-yellow/25 rounded-2xl p-4">
          <p className="text-[11px] text-accent-yellow font-bold uppercase tracking-wider mb-1">
            Not financial advice
          </p>
          <p className="text-[11px] text-text-muted leading-relaxed">
            Weekly dividend ETFs carry significant risk. Many use leverage and options strategies that can erode your principal. This page is educational only. Verify all data on the issuer's website before investing.
          </p>
        </div>

        {/* ========== Quick answer box ========== */}
        <section className="bg-bg-surface border border-border/50 rounded-2xl p-6 space-y-3">
          <h2 className="text-xl font-black text-text-primary tracking-tight">
            What is a weekly dividend ETF?
          </h2>
          <p className="text-text-secondary text-sm leading-relaxed">
            A weekly dividend ETF distributes cash to shareholders every week instead of the traditional quarterly or monthly schedule. Almost all of them use <strong className="text-text-primary">options-selling strategies</strong> — they sell call options on an underlying stock or index and pass the premium to shareholders as a "dividend."
          </p>
          <p className="text-text-secondary text-sm leading-relaxed">
            That distinction matters. These aren't dividends in the traditional sense. Most distributions are classified as <strong className="text-text-primary">return of capital</strong>, which means the fund is partly paying you back your own money. Your share price (NAV) typically declines over time as a result.
          </p>
          <p className="text-text-secondary text-sm leading-relaxed">
            The only major exception is <strong className="text-text-primary">WEEK</strong> (Roundhill Weekly T-Bill ETF), which holds short-term U.S. Treasury bills and distributes real interest income weekly.
          </p>
        </section>

        {/* ========== Frequency table ========== */}
        <section className="space-y-4">
          <h2 className="text-2xl font-black text-text-primary tracking-tight">
            How often do ETFs pay dividends?
          </h2>
          <p className="text-text-secondary text-sm leading-relaxed">
            Most dividend ETFs pay quarterly. A small but growing group pays monthly. Weekly payers are a niche within a niche — all launched since 2022.
          </p>

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
                  <tr key={row.frequency}>
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

        {/* ========== Full live table ========== */}
        <section className="space-y-4">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-2xl font-black text-text-primary tracking-tight">
                Every weekly dividend ETF, ranked by yield
              </h2>
              <p className="text-text-muted text-sm mt-1">
                Live data pulled from our screener. Sorted by distribution rate, highest first.
              </p>
            </div>
            <Link
              to="/screener"
              className="text-xs font-bold text-accent-blue hover:underline"
            >
              Open full screener →
            </Link>
          </div>

          {isLoading && (
            <div className="py-12"><LoadingSpinner /></div>
          )}

          {!isLoading && weeklyEtfs.length > 0 && (
            <div className="bg-bg-surface border border-border/50 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto mobile-scroll">
                <table className="w-full text-sm">
                  <thead className="bg-bg-primary/50 text-text-muted uppercase font-bold tracking-wider text-[10px]">
                    <tr>
                      <th className="px-3 py-3 text-left">Ticker</th>
                      <th className="px-3 py-3 text-left">Name</th>
                      <th className="px-3 py-3 text-right">Yield</th>
                      <th className="px-3 py-3 text-right">Price</th>
                      <th className="px-3 py-3 text-center">Risk</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/10">
                    {weeklyEtfs.slice(0, 30).map((etf) => (
                      <tr key={etf.symbol} className="hover:bg-bg-primary/30 transition-colors">
                        <td className="px-3 py-2.5">
                          <Link
                            to={`/search?symbol=${etf.symbol}`}
                            className="font-mono font-bold text-accent-teal hover:underline"
                          >
                            {etf.symbol}
                          </Link>
                        </td>
                        <td className="px-3 py-2.5 text-text-primary text-xs truncate max-w-[200px]">
                          {etf.name}
                        </td>
                        <td className="px-3 py-2.5 text-right font-mono font-bold text-accent-green">
                          {fmt(etf.currentYield)}%
                        </td>
                        <td className="px-3 py-2.5 text-right font-mono text-text-secondary text-xs">
                          {etf.currentPrice ? `$${fmt(etf.currentPrice)}` : '—'}
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border ${
                            etf.safetyScore === 'Safe' ? 'bg-accent-green/10 border-accent-green/20 text-accent-green' :
                            etf.safetyScore === 'Moderate' ? 'bg-accent-yellow/10 border-accent-yellow/20 text-accent-yellow' :
                            'bg-accent-red/10 border-accent-red/20 text-accent-red'
                          }`}>
                            {etf.safetyScore}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {weeklyEtfs.length > 30 && (
                <div className="px-4 py-3 border-t border-border/40 bg-bg-primary/30 text-center">
                  <Link to="/screener" className="text-xs font-bold text-accent-blue hover:underline">
                    See all {weeklyEtfs.length} weekly payers in the screener →
                  </Link>
                </div>
              )}
            </div>
          )}
        </section>

        {/* ========== Issuer breakdown ========== */}
        <section className="space-y-6">
          <h2 className="text-2xl font-black text-text-primary tracking-tight">
            The five issuers behind weekly dividend ETFs
          </h2>
          <p className="text-text-secondary text-sm leading-relaxed">
            Almost every weekly payer comes from one of these five firms. Each has a different strategy, risk profile, and distribution history.
          </p>

          <div className="space-y-4">
            {ISSUERS.map((issuer) => (
              <div key={issuer.name} className="bg-bg-surface border border-border/50 rounded-2xl p-5 space-y-3">
                <div className="flex items-start justify-between flex-wrap gap-2">
                  <h3 className="text-lg font-black text-text-primary tracking-tight">{issuer.name}</h3>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">
                    {issuer.tickers.length} weekly ETFs
                  </span>
                </div>
                <p className="text-sm text-text-secondary leading-relaxed">{issuer.strategy}</p>
                <div className="flex flex-wrap gap-1.5">
                  {issuer.tickers.map((t) => (
                    <Link
                      key={t}
                      to={`/search?symbol=${t}`}
                      className="text-[10px] font-mono font-bold px-2 py-1 rounded-md bg-bg-primary border border-border/40 text-accent-teal hover:border-accent-teal/40 transition-colors"
                    >
                      {t}
                    </Link>
                  ))}
                </div>
                <p className="text-[11px] text-text-muted italic">{issuer.note}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ========== The risks nobody mentions ========== */}
        <section className="space-y-4">
          <h2 className="text-2xl font-black text-text-primary tracking-tight">
            The risks most YouTube videos skip
          </h2>

          <div className="space-y-3">
            <div className="bg-bg-surface border border-border/50 rounded-2xl p-5">
              <h3 className="font-bold text-text-primary text-base mb-2">Return of capital, not dividends</h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                YieldMax's own August 2026 estimate classified 100% of TSLY's distributions as return of capital. That means the fund isn't earning that income — it's paying you back from its own assets. The distribution looks like income on a statement, but your cost basis is being reduced.
              </p>
            </div>

            <div className="bg-bg-surface border border-border/50 rounded-2xl p-5">
              <h3 className="font-bold text-text-primary text-base mb-2">NAV erosion</h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                If a fund pays out more than it earns, the share price must fall. ULTY has distributed over 100% of its NAV since launch and its share price has declined accordingly. The headline yield looks spectacular, but total return (price change + distributions) is often negative.
              </p>
            </div>

            <div className="bg-bg-surface border border-border/50 rounded-2xl p-5">
              <h3 className="font-bold text-text-primary text-base mb-2">Distribution rate vs. SEC yield</h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                The "distribution rate" is an annualised guess based on the latest payment. The 30-day SEC yield shows what the portfolio actually earned from investments. For TSLY, the gap was ~50% distribution rate vs. ~3% SEC yield. That gap is return of capital.
              </p>
            </div>

            <div className="bg-bg-surface border border-border/50 rounded-2xl p-5">
              <h3 className="font-bold text-text-primary text-base mb-2">Tax treatment</h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                Return of capital isn't immediately taxable, which sounds good. But it reduces your cost basis. When you eventually sell, you pay capital gains on the difference — often at less favorable rates than if you'd received qualified dividends. The tax bill is deferred, not eliminated.
              </p>
            </div>

            <div className="bg-bg-surface border border-border/50 rounded-2xl p-5">
              <h3 className="font-bold text-text-primary text-base mb-2">Leverage in WeeklyPay ETFs</h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                Roundhill's WeeklyPay products target 1.2× weekly returns on a single underlying stock. That leverage magnifies both gains and losses. MSFW (Microsoft WeeklyPay) fell 28.6% in a year Microsoft was down 24%. "There is no assurance a Fund will achieve its weekly leveraged investment objective. An investment in a Fund could lose money, including the full principal value, within a single week."
              </p>
            </div>
          </div>
        </section>

        {/* ========== FAQ ========== */}
        <section className="space-y-4">
          <h2 className="text-2xl font-black text-text-primary tracking-tight">
            Frequently asked questions
          </h2>

          <div className="space-y-3">
            {schema.mainEntity.map((q, i) => (
              <details key={i} className="bg-bg-surface border border-border/50 rounded-2xl group">
                <summary className="px-5 py-4 cursor-pointer font-bold text-sm text-text-primary flex items-center justify-between hover:text-accent-blue transition-colors">
                  {q.name}
                  <span className="text-text-muted group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="px-5 pb-5 pt-0 text-sm text-text-secondary leading-relaxed border-t border-border/20 mt-2">
                  {q.acceptedAnswer.text}
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* ========== CTA ========== */}
        <section className="bg-gradient-to-br from-accent-blue/10 via-bg-surface to-accent-teal/10 border border-accent-blue/20 rounded-2xl p-6 sm:p-8 text-center">
          <h2 className="text-xl sm:text-2xl font-black text-text-primary tracking-tight mb-2">
            See all 643 dividend payers — weekly, monthly, and quarterly
          </h2>
          <p className="text-text-secondary text-sm mb-5 max-w-xl mx-auto">
            Our screener tracks every dividend-paying stock, REIT, ETF, and preferred stock across US and SGX markets. Filter by frequency, asset type, and risk.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to="/screener"
              className="px-6 py-3 bg-gradient-to-r from-accent-blue to-accent-teal text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md hover:opacity-95 active:scale-95 transition-all"
            >
              Open Dividend Screener
            </Link>
            <Link
              to="/"
              className="px-6 py-3 bg-bg-surface border border-border/60 text-text-secondary text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-bg-surface-hover transition-all"
            >
              Monthly Income Planner
            </Link>
          </div>
        </section>

        {/* ========== Disclaimer ========== */}
        <div className="bg-bg-surface border border-border/40 rounded-2xl p-5">
          <p className="text-[10px] uppercase tracking-widest text-text-muted font-bold mb-2">
            Important Disclosures
          </p>
          <p className="text-[11px] text-text-muted leading-relaxed">
            DividendBro is not a licensed financial adviser. This page is for educational purposes only and does not constitute investment advice, a recommendation, or a solicitation to buy or sell any securities. Weekly dividend ETFs carry significant risk, including the potential loss of principal. Distribution rates shown are indicative of recent payments and are not guaranteed. Past performance is not indicative of future results. Consult a licensed financial adviser before making any investment decisions.
          </p>
        </div>
      </div>
    </>
  );
};

export default WeeklyDividendETFs;