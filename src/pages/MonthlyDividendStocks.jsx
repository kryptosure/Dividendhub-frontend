import React, { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getScreenerStocks } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const SITE_URL = 'https://dividendbro.com';

// ---------- Curated asset class data ----------
const ASSET_CLASSES = [
  {
    name: 'Monthly Dividend REITs',
    tickers: ['O', 'STAG', 'LTC', 'GOOD', 'ADC', 'EPR', 'LAND', 'PECO', 'IRM', 'GLPI'],
    description:
      'Real Estate Investment Trusts that distribute rent income monthly instead of quarterly. Realty Income (O) has paid monthly since 1994 and coined the "Monthly Dividend Company" tagline. Most own physical property portfolios — warehouses, medical offices, retail plazas — and pass through 90%+ of taxable income to shareholders.',
    risk:
      'Rate-sensitive. REIT values often fall when interest rates rise, even if rents are stable. Distributions are usually taxed as ordinary income, not qualified dividends.',
  },
  {
    name: 'Monthly Dividend BDCs',
    tickers: ['MAIN', 'ARCC', 'HTGC', 'PFLT', 'GAIN', 'PSEC', 'BXSL', 'OBDC', 'CSWC', 'FSK'],
    description:
      'Business Development Companies lend to small and medium-sized private businesses. They generate interest income and pass most of it to shareholders monthly. Main Street Capital (MAIN) is the category leader and has paid monthly distributions since 2008, with frequent special dividends on top.',
    risk:
      'Credit risk. If the underlying companies struggle to repay loans, BDC distributions get cut. Most BDCs use leverage, which magnifies losses in a downturn.',
  },
  {
    name: 'Monthly Closed-End Funds (CEFs)',
    tickers: ['PDI', 'PTY', 'PCN', 'PCM', 'RCS', 'UTF', 'ETV', 'ETB', 'ETY', 'BDJ', 'HPI', 'HPF'],
    description:
      'PIMCO and BlackRock dominate this category. CEFs hold bond or equity portfolios and pay monthly distributions from a mix of income and capital gains. Some offer headline yields over 10%. PIMCO Dynamic Income (PDI) and PIMCO Corporate & Income Opportunity (PTY) are the most widely held.',
    risk:
      'Distributions often include return of capital, eroding NAV. Many CEFs trade at premiums to net asset value, which can collapse quickly if sentiment shifts. Management fees are typically 1–2% annually.',
  },
  {
    name: 'Monthly Covered-Call ETFs',
    tickers: ['JEPI', 'JEPQ', 'SPYI', 'QQQI', 'DIVO', 'QYLD', 'XYLD', 'GPIQ'],
    description:
      'Equity funds that sell call options against their holdings and pass the option premium to shareholders monthly. JPMorgan Equity Premium Income (JEPI) is the largest with $35B+ in assets. Yields are typically 7–10% and distributions are more tax-efficient than weekly options ETFs because the underlying holdings still generate qualified dividends.',
    risk:
      'Upside is capped during bull markets — you give up capital gains in exchange for income. Downside is not protected. NAV drifts lower in prolonged sideways markets.',
  },
  {
    name: 'Mortgage REITs (mREITs)',
    tickers: ['AGNC', 'NLY', 'ARR', 'ORC', 'TWO', 'IVR', 'MFA', 'RITM', 'PMT', 'CIM'],
    description:
      'These firms borrow short-term and lend long-term in mortgage-backed securities, capturing the spread. AGNC and Annaly (NLY) are the two largest. Monthly distributions have historically offered double-digit headline yields.',
    risk:
      'Extremely rate-sensitive. Book value can fall 20–40% in a rising-rate cycle. Distributions have been cut repeatedly across the sector. Not suitable for conservative income investors.',
  },
];

const FREQUENCY_COMPARISON = [
  {
    frequency: 'Daily',
    count: 0,
    examples: 'None',
    note: 'No mass-market daily ETF exists. SATA and CHAD are preferred stocks.',
  },
  {
    frequency: 'Weekly',
    count: 73,
    examples: 'MSTY, ULTY, XDTE',
    note: 'Options-income ETFs. Distributions mostly return of capital.',
  },
  {
    frequency: 'Monthly',
    count: 133,
    examples: 'O, MAIN, JEPI, PDI',
    note: 'REITs, BDCs, CEFs, and covered-call ETFs. Established category since 1994.',
  },
  {
    frequency: 'Quarterly',
    count: 373,
    examples: 'KO, JNJ, SCHD',
    note: 'Traditional dividend stocks and index funds. Largest category.',
  },
];

const MonthlyDividendStocks = () => {
  const { data: monthlyData, isLoading } = useQuery({
    queryKey: ['monthly-stocks-landing'],
    queryFn: () => getScreenerStocks({
      market: 'us',
      frequency: 'monthly',
      assetType: 'all',
      sort: 'yield-desc',
      limit: 500,
    }),
    staleTime: 30 * 60 * 1000,
  });

  const monthlyStocks = monthlyData?.stocks || [];
  const bySymbol = useMemo(() => {
    const map = {};
    for (const s of monthlyStocks) map[s.symbol] = s;
    return map;
  }, [monthlyStocks]);

  const fmt = (n) => (n == null || isNaN(n) ? '—' : Number(n).toFixed(2));

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What are the best monthly dividend stocks?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Realty Income (O) is the most widely held monthly dividend stock, having paid monthly since 1994. Main Street Capital (MAIN) is the largest monthly-paying BDC, and PIMCO Dynamic Income (PDI) is the most popular monthly CEF. For diversified monthly income, JPMorgan Equity Premium Income (JEPI) offers around 7–8% yield with less volatility.',
        },
      },
      {
        '@type': 'Question',
        name: 'Are monthly dividends better than quarterly?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Monthly dividends offer smoother cash flow and faster compounding if you reinvest, but the difference in total return versus quarterly is small. The bigger factor is the underlying asset quality, not the payment frequency. Some investors prefer monthly payers simply because the regular income is easier to budget around.',
        },
      },
      {
        '@type': 'Question',
        name: 'How often do REITs pay dividends?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Most REITs pay quarterly, matching their reporting cycle. A smaller group pays monthly — including Realty Income, STAG Industrial, LTC Properties, and Gladstone Commercial. Monthly-paying REITs tend to be more established with large property portfolios.',
        },
      },
      {
        '@type': 'Question',
        name: 'Are monthly dividend stocks taxed differently?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, in most cases. REIT dividends are usually taxed as ordinary income, not qualified dividends. BDC and CEF distributions often contain return of capital, which is tax-deferred but reduces your cost basis. Covered-call ETF distributions like JEPI are usually a mix of qualified dividends and short-term gains, making them slightly more tax-efficient than weekly options ETFs.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is the highest-yielding monthly dividend stock?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The highest-yielding monthly payers are mortgage REITs (ORC, ARR, IVR) and covered-call ETFs (RYLD, QYLD), which often show yields above 12%. These yields reflect elevated risk — NAV erosion is common, and distributions are frequently cut. Yield alone is a poor way to compare monthly dividend stocks.',
        },
      },
    ],
  };

  return (
    <>
      <Helmet>
        <title>Monthly Dividend Stocks — Full List of 133 Monthly Payers (2026) | DividendBro</title>
        <meta name="description" content="Complete list of every monthly dividend stock in 2026 — REITs, BDCs, CEFs, and covered-call ETFs. Live yields, asset class breakdown, and the risks behind the headline yields." />
        <link rel="canonical" href={`${SITE_URL}/monthly-dividend-stocks`} />
        <meta property="og:title" content="Monthly Dividend Stocks — Full List of 133 Monthly Payers (2026)" />
        <meta property="og:description" content="Every monthly dividend stock in one place. Live yields, asset class breakdown, and the risks behind the headline yields." />
        <meta property="og:url" content={`${SITE_URL}/monthly-dividend-stocks`} />
        <meta property="og:type" content="article" />
        <meta property="og:image" content={`${SITE_URL}/images/cover.png`} />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      </Helmet>

      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-10">

        {/* Hero */}
        <header className="space-y-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-accent-teal">
            DividendBro Research
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-text-primary leading-tight">
            Monthly Dividend Stocks: The Full List of <span className="bg-gradient-to-r from-accent-blue to-accent-teal bg-clip-text text-transparent">{monthlyStocks.length || 133} Monthly Payers</span>
          </h1>
          <p className="text-text-secondary text-base sm:text-lg leading-relaxed max-w-3xl">
            Every stock, REIT, BDC, closed-end fund, and ETF that pays dividends every month. Live yields, asset class breakdowns, and the risks behind the headline numbers.
          </p>
          <p className="text-text-muted text-xs">
            Updated September 2026 · {monthlyStocks.length || 133} tickers tracked · Data from Yahoo Finance + issuer filings
          </p>
        </header>

        {/* Compliance banner */}
        <div className="bg-accent-yellow/5 border border-accent-yellow/25 rounded-2xl p-4">
          <p className="text-[11px] text-accent-yellow font-bold uppercase tracking-wider mb-1">
            Not financial advice
          </p>
          <p className="text-[11px] text-text-muted leading-relaxed">
            Monthly dividend stocks include high-risk categories like mortgage REITs and closed-end funds. Some distributions include return of capital, which erodes NAV over time. Verify all data on the issuer's website before investing.
          </p>
        </div>

        {/* Quick answer */}
        <section className="bg-bg-surface border border-border/50 rounded-2xl p-6 space-y-3">
          <h2 className="text-xl font-black text-text-primary tracking-tight">
            What is a monthly dividend stock?
          </h2>
          <p className="text-text-secondary text-sm leading-relaxed">
            A monthly dividend stock pays shareholders once a month instead of the traditional quarterly cycle. Almost all monthly payers fall into one of five categories: <strong className="text-text-primary">REITs</strong>, <strong className="text-text-primary">BDCs</strong>, <strong className="text-text-primary">closed-end funds</strong>, <strong className="text-text-primary">covered-call ETFs</strong>, and <strong className="text-text-primary">mortgage REITs</strong>.
          </p>
          <p className="text-text-secondary text-sm leading-relaxed">
            The oldest continuous monthly payer is <strong className="text-text-primary">Realty Income (O)</strong>, which has paid monthly since 1994. Most other monthly payers launched or switched to monthly distributions after 2005, as retail demand for regular income grew.
          </p>
          <p className="text-text-secondary text-sm leading-relaxed">
            The main appeal is simpler budgeting and faster compounding on reinvestment. The main trade-off is that a large share of monthly payers use leverage or return-of-capital distributions — which can quietly erode your principal.
          </p>
        </section>

        {/* Frequency comparison */}
        <section className="space-y-4">
          <h2 className="text-2xl font-black text-text-primary tracking-tight">
            How often do dividend stocks pay?
          </h2>
          <p className="text-text-secondary text-sm leading-relaxed">
            Quarterly is still the default for large-cap dividend stocks. Monthly is a smaller but well-established category — and unlike weekly payers, it includes traditional businesses like Realty Income and Main Street Capital, not just options-income ETFs.
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

        {/* Live table */}
        <section className="space-y-4">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-2xl font-black text-text-primary tracking-tight">
                Every monthly dividend stock, ranked by yield
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

          {!isLoading && monthlyStocks.length > 0 && (
            <div className="bg-bg-surface border border-border/50 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto mobile-scroll">
                <table className="w-full text-sm">
                  <thead className="bg-bg-primary/50 text-text-muted uppercase font-bold tracking-wider text-[10px]">
                    <tr>
                      <th className="px-3 py-3 text-left">Ticker</th>
                      <th className="px-3 py-3 text-left">Name</th>
                      <th className="px-3 py-3 text-center">Type</th>
                      <th className="px-3 py-3 text-right">Yield</th>
                      <th className="px-3 py-3 text-right">Price</th>
                      <th className="px-3 py-3 text-center">Risk</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/10">
                    {monthlyStocks.slice(0, 30).map((s) => (
                      <tr key={s.symbol} className="hover:bg-bg-primary/30 transition-colors">
                        <td className="px-3 py-2.5">
                          <Link
                            to={`/search?symbol=${s.symbol}`}
                            className="font-mono font-bold text-accent-teal hover:underline"
                          >
                            {s.symbol}
                          </Link>
                        </td>
                        <td className="px-3 py-2.5 text-text-primary text-xs truncate max-w-[200px]">
                          {s.name}
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border bg-accent-blue/10 border-accent-blue/20 text-accent-blue">
                            {s.assetType}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-right font-mono font-bold text-accent-green">
                          {fmt(s.currentYield)}%
                        </td>
                        <td className="px-3 py-2.5 text-right font-mono text-text-secondary text-xs">
                          {s.currentPrice ? `$${fmt(s.currentPrice)}` : '—'}
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border ${
                            s.safetyScore === 'Safe' ? 'bg-accent-green/10 border-accent-green/20 text-accent-green' :
                            s.safetyScore === 'Moderate' ? 'bg-accent-yellow/10 border-accent-yellow/20 text-accent-yellow' :
                            'bg-accent-red/10 border-accent-red/20 text-accent-red'
                          }`}>
                            {s.safetyScore}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {monthlyStocks.length > 30 && (
                <div className="px-4 py-3 border-t border-border/40 bg-bg-primary/30 text-center">
                  <Link to="/screener" className="text-xs font-bold text-accent-blue hover:underline">
                    See all {monthlyStocks.length} monthly payers in the screener →
                  </Link>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Asset class breakdown */}
        <section className="space-y-6">
          <h2 className="text-2xl font-black text-text-primary tracking-tight">
            The five categories of monthly dividend stocks
          </h2>
          <p className="text-text-secondary text-sm leading-relaxed">
            Nearly every monthly payer fits into one of these five buckets. Each has a distinct risk profile, tax treatment, and historical pattern of distribution cuts.
          </p>

          <div className="space-y-4">
            {ASSET_CLASSES.map((cls) => (
              <div key={cls.name} className="bg-bg-surface border border-border/50 rounded-2xl p-5 space-y-3">
                <div className="flex items-start justify-between flex-wrap gap-2">
                  <h3 className="text-lg font-black text-text-primary tracking-tight">{cls.name}</h3>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">
                    {cls.tickers.length}+ tracked
                  </span>
                </div>
                <p className="text-sm text-text-secondary leading-relaxed">{cls.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {cls.tickers.map((t) => (
                    <Link
                      key={t}
                      to={`/search?symbol=${t}`}
                      className="text-[10px] font-mono font-bold px-2 py-1 rounded-md bg-bg-primary border border-border/40 text-accent-teal hover:border-accent-teal/40 transition-colors"
                    >
                      {t}
                    </Link>
                  ))}
                </div>
                <p className="text-[11px] text-accent-red/80 italic">
                  ⚠ {cls.risk}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Comparison table */}
        <section className="space-y-4">
          <h2 className="text-2xl font-black text-text-primary tracking-tight">
            Monthly vs. quarterly — does frequency actually matter?
          </h2>
          <p className="text-text-secondary text-sm leading-relaxed">
            The math is closer than most YouTube videos suggest. Here's the honest comparison.
          </p>

          <div className="overflow-x-auto mobile-scroll">
            <table className="w-full text-sm border-collapse">
              <thead className="bg-bg-primary/50 text-text-muted uppercase font-bold tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3 text-left">Factor</th>
                  <th className="px-4 py-3 text-left">Monthly</th>
                  <th className="px-4 py-3 text-left">Quarterly</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/10">
                <tr>
                  <td className="px-4 py-3 text-text-muted font-semibold">Compounding advantage</td>
                  <td className="px-4 py-3 text-text-secondary text-xs">Slightly higher (reinvesting earlier)</td>
                  <td className="px-4 py-3 text-text-secondary text-xs">Slightly lower</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-text-muted font-semibold">Real difference over 30 years</td>
                  <td className="px-4 py-3 text-text-secondary text-xs" colSpan="2">~0.3%–0.5% total return — negligible at portfolio level</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-text-muted font-semibold">Universe size</td>
                  <td className="px-4 py-3 text-text-secondary text-xs">~133 stocks</td>
                  <td className="px-4 py-3 text-text-secondary text-xs">~373 stocks</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-text-muted font-semibold">Dividend growth</td>
                  <td className="px-4 py-3 text-text-secondary text-xs">Generally lower (REITs, BDCs grow slowly)</td>
                  <td className="px-4 py-3 text-text-secondary text-xs">Higher (Dividend Kings live here)</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-text-muted font-semibold">Tax treatment</td>
                  <td className="px-4 py-3 text-text-secondary text-xs">Often ordinary income or ROC</td>
                  <td className="px-4 py-3 text-text-secondary text-xs">Often qualified dividends</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-text-muted font-semibold">Behavioural benefit</td>
                  <td className="px-4 py-3 text-text-secondary text-xs">Easier to budget around</td>
                  <td className="px-4 py-3 text-text-secondary text-xs">Lumpier cash flow</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-text-muted text-xs italic">
            Bottom line: monthly frequency is a convenience, not an edge. What matters more is whether the underlying business can sustain and grow the distribution.
          </p>
        </section>

        {/* Risks */}
        <section className="space-y-4">
          <h2 className="text-2xl font-black text-text-primary tracking-tight">
            The risks most articles don't mention
          </h2>

          <div className="space-y-3">
            <div className="bg-bg-surface border border-border/50 rounded-2xl p-5">
              <h3 className="font-bold text-text-primary text-base mb-2">NAV erosion from return of capital</h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                Many monthly CEFs and covered-call ETFs distribute more than they earn. The excess is return of capital — technically your own money coming back. Over years, this erodes the share price. A 10% yield with 5% NAV erosion is really a 5% net return.
              </p>
            </div>

            <div className="bg-bg-surface border border-border/50 rounded-2xl p-5">
              <h3 className="font-bold text-text-primary text-base mb-2">Rate sensitivity in REITs and mREITs</h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                REIT values fall when rates rise — even if rents are stable. Mortgage REITs like ORC and ARR can lose 30%+ of book value in a rising-rate cycle, and their distributions are frequently cut. The headline yield doesn't capture this.
              </p>
            </div>

            <div className="bg-bg-surface border border-border/50 rounded-2xl p-5">
              <h3 className="font-bold text-text-primary text-base mb-2">Tax inefficiency for Singapore investors</h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                US REIT and BDC distributions are subject to the standard 30% US withholding tax for Singapore residents. Combined with the fact that most are taxed as ordinary income in the US, this makes monthly US payers significantly less tax-efficient than SGX REITs (which have no withholding tax).
              </p>
            </div>

            <div className="bg-bg-surface border border-border/50 rounded-2xl p-5">
              <h3 className="font-bold text-text-primary text-base mb-2">Distribution cuts happen</h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                Mortgage REITs and CEFs cut distributions regularly during rate cycles. A 12% yield on paper can become a 6% yield on a lower NAV after a cut. Historical data shows most mREITs have reduced distributions at least once since 2020.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
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

        {/* CTA */}
        <section className="bg-gradient-to-br from-accent-blue/10 via-bg-surface to-accent-teal/10 border border-accent-blue/20 rounded-2xl p-6 sm:p-8 text-center">
          <h2 className="text-xl sm:text-2xl font-black text-text-primary tracking-tight mb-2">
            Find monthly dividend stocks that match your goals
          </h2>
          <p className="text-text-secondary text-sm mb-5 max-w-xl mx-auto">
            Use our screener to filter by frequency, asset class, yield, and risk. Or use the Income Planner to see what a monthly dividend portfolio could look like for your target income.
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

        {/* Disclaimer */}
        <div className="bg-bg-surface border border-border/40 rounded-2xl p-5">
          <p className="text-[10px] uppercase tracking-widest text-text-muted font-bold mb-2">
            Important Disclosures
          </p>
          <p className="text-[11px] text-text-muted leading-relaxed">
            DividendBro is not a licensed financial adviser. This page is for educational purposes only and does not constitute investment advice, a recommendation, or a solicitation to buy or sell any securities. Monthly dividend stocks carry significant risk, including the potential loss of principal. Distribution rates shown are indicative of recent payments and are not guaranteed. Many distributions include return of capital, which reduces cost basis. Past performance is not indicative of future results. Consult a licensed financial adviser before making any investment decisions.
          </p>
        </div>
      </div>
    </>
  );
};

export default MonthlyDividendStocks;