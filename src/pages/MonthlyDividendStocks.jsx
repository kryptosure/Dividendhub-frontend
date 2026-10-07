import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const SITE_URL = 'https://dividendbro.com';

/* ─────────────────────────────────────────────────────────── */
/*  DATA                                                     */
/* ─────────────────────────────────────────────────────────── */

const CATEGORIES = [
  {
    name: 'Monthly Dividend REITs',
    icon: '🏢',
    count: 19,
    yieldRange: '3.9% – 14.0%',
    examples: 'Realty Income (O), Agree Realty (ADC), LTC Properties (LTC)',
    description: 'Real estate investment trusts that own physical property — offices, warehouses, hospitals, retail centers — and pay you rent monthly.',
    riskNote: 'Equity REITs are the safest monthly payers. Mortgage REITs at the bottom of this list are much riskier.',
  },
  {
    name: 'Monthly Dividend BDCs',
    icon: '💰',
    count: 8,
    yieldRange: '7.0% – 11.0%',
    examples: 'Main Street Capital (MAIN), Ares Capital (ARCC), Hercules Capital (HTGC)',
    description: 'Business Development Companies lend money to mid-sized private businesses. High yield, but higher risk than REITs.',
    riskNote: 'BDCs get hit hard in recessions when borrowers default. Check the NAV trend before buying.',
  },
  {
    name: 'Closed-End Funds (CEFs)',
    icon: '📊',
    count: 15,
    yieldRange: '6.0% – 13.0%',
    examples: 'PIMCO Dynamic Income (PDI), PIMCO Corporate & Income (PTY)',
    description: 'Professionally managed funds that trade on exchanges like stocks. Often use leverage to boost yield.',
    riskNote: "Some CEF distributions include return of capital — that means they're partially paying you back your own money.",
  },
  {
    name: 'Covered-Call ETFs',
    icon: '📈',
    count: 22,
    yieldRange: '6.0% – 12.0%',
    examples: 'JEPI, JEPQ, SPYI, QQQI, DIVO',
    description: 'ETFs that hold stocks AND sell options against them. The option premiums fund the monthly distribution.',
    riskNote: 'You give up big upside in bull markets. These are income plays, not growth plays.',
  },
  {
    name: 'Mortgage REITs (mREITs)',
    icon: '🏦',
    count: 6,
    yieldRange: '10.0% – 15.0%',
    examples: 'AGNC Investment (AGNC), Annaly Capital (NLY), ARMOUR (ARR)',
    description: "These don't own property — they own mortgage-backed securities. Very high yield, very high volatility.",
    riskNote: 'Rising interest rates crush mREIT book values. Only for investors who can stomach 30%+ drawdowns.',
  },
  {
    name: 'Preferred Stock Funds',
    icon: '🏛️',
    count: 12,
    yieldRange: '5.5% – 8.0%',
    examples: 'Various preferred income ETFs and closed-end funds',
    description: 'Funds that hold preferred stock — a hybrid between bonds and common stock.',
    riskNote: 'Preferred dividends can be suspended without triggering bankruptcy. Read the prospectus.',
  },
];

const TOP_MONTHLY_STOCKS = [
  { ticker: 'O',     name: 'Realty Income',         category: 'REIT',         yield: 5.5,  risk: 'Safe',     note: '632 consecutive monthly dividends paid since 1994' },
  { ticker: 'ADC',   name: 'Agree Realty',           category: 'REIT',         yield: 3.9,  risk: 'Safe',     note: 'Net-lease retail — 2,200+ properties' },
  { ticker: 'LTC',   name: 'LTC Properties',         category: 'REIT',         yield: 5.7,  risk: 'Safe',     note: 'Healthcare REIT focused on senior housing' },
  { ticker: 'MAIN',  name: 'Main Street Capital',    category: 'BDC',          yield: 6.5,  risk: 'Moderate', note: 'Pays monthly PLUS semi-annual specials' },
  { ticker: 'STAG',  name: 'STAG Industrial',        category: 'REIT',         yield: 4.2,  risk: 'Safe',     note: 'Industrial warehouses — e-commerce tailwind' },
  { ticker: 'EPR',   name: 'EPR Properties',         category: 'REIT',         yield: 6.1,  risk: 'Moderate', note: 'Experiential — theaters, ski resorts, casinos' },
  { ticker: 'ARCC',  name: 'Ares Capital',           category: 'BDC',          yield: 9.3,  risk: 'Moderate', note: 'Largest publicly traded BDC' },
  { ticker: 'DOC',   name: 'Healthpeak Properties',  category: 'REIT',         yield: 7.0,  risk: 'Moderate', note: 'Medical office + lab space' },
  { ticker: 'APLE',  name: 'Apple Hospitality',      category: 'REIT',         yield: 8.0,  risk: 'Higher',   note: 'Hotel REIT — Marriott and Hilton portfolio' },
  { ticker: 'GOOD',  name: 'Gladstone Commercial',   category: 'REIT',         yield: 9.6,  risk: 'Higher',   note: 'Small-cap net lease; has cut dividend in past' },
  { ticker: 'AGNC',  name: 'AGNC Investment',        category: 'Mortgage REIT', yield: 14.0, risk: 'High',    note: 'Agency MBS — highest yield, biggest swings' },
  { ticker: 'NLY',   name: 'Annaly Capital',         category: 'Mortgage REIT', yield: 12.5, risk: 'High',    note: 'One of the oldest mREITs, since 1997' },
];

const FAQS = [
  {
    q: 'Which stocks pay monthly dividends?',
    a: 'Around 133 US-listed securities pay dividends every month in 2026. They fall into six categories: REITs (like Realty Income and Agree Realty), Business Development Companies (like Main Street Capital and Ares Capital), Closed-End Funds (like PIMCO Dynamic Income), Covered-Call ETFs (like JEPI and JEPQ), Mortgage REITs (like AGNC and Annaly), and Preferred Stock Funds. DividendBro tracks all of them.',
  },
  {
    q: 'Do REITs pay dividends monthly?',
    a: 'Some do. About 19 US-listed REITs pay monthly, including Realty Income (O), Agree Realty (ADC), LTC Properties (LTC), and EPR Properties (EPR). Most REITs pay quarterly, but the ones that pay monthly tend to be in net-lease, healthcare, and residential sectors where rent comes in every month.',
  },
  {
    q: 'What is the safest monthly dividend stock?',
    a: "Realty Income (O) is widely considered the safest monthly dividend stock. It has paid 632 consecutive monthly dividends since 1994, has never cut, and owns 15,000+ properties across the US and Europe. Current yield: roughly 5.5%. It's classified as Safe on DividendBro's safety scale.",
  },
  {
    q: 'How much do I need to earn $1,000 a month from monthly dividend stocks?',
    a: "At an average yield of 6%, you need roughly $200,000 invested to earn $1,000/month ($12,000/year). At 8% average yield, $150,000 is enough. DividendBro's Income Planner can model the exact number based on your specific mix of REITs, BDCs, and ETFs.",
  },
  {
    q: 'Are monthly dividend stocks better than quarterly?',
    a: 'Not inherently better, but they compound slightly faster. On a 6% stated yield, monthly payments produce an effective yield of 6.17% vs 6.14% for quarterly — about 3 extra basis points per year. The real benefit is cash flow timing: monthly payers make it easier to budget your income.',
  },
  {
    q: 'What is the highest-yielding monthly dividend stock?',
    a: "AGNC Investment (AGNC) currently yields around 14% — the highest among monthly payers. But it's a mortgage REIT, meaning the yield comes with significant price volatility. The stock has fallen more than 40% in past rate cycles. Higher yield always means higher risk.",
  },
  {
    q: 'Are monthly dividends taxed differently?',
    a: 'In the US, REIT and BDC distributions are taxed as ordinary income, not qualified dividends. For Singapore investors, all US monthly dividend stocks are subject to 30% withholding tax. That means a 6% US yield becomes ~4.2% after tax. SGX REITs pay quarterly or semi-annual, not monthly.',
  },
  {
    q: 'How many monthly dividend stocks are there?',
    a: 'As of October 2026, DividendBro tracks 133 securities that pay dividends every month. This includes 19 REITs, 8 BDCs, 15 closed-end funds, 22 covered-call ETFs, 6 mortgage REITs, and 12 preferred stock funds — plus a few smaller categories.',
  },
];

const QUOTE_FACTS = [
  'Realty Income (O) has paid 632 consecutive monthly dividends since 1994 — 32 years without a single skip.',
  'Only 133 of the ~6,000 US-listed stocks and funds pay dividends monthly — roughly 2% of the market.',
  'Monthly dividends compound to 6.17% effective yield on a 6% stated rate — 3 basis points higher than quarterly payouts.',
  'Singapore investors give up 30% of US monthly dividend income to withholding tax — a 6% yield becomes 4.2% after tax.',
  'The average monthly dividend REIT yields 5.8%, versus 3.5% for the average quarterly dividend stock.',
  'Mortgage REITs offer the highest monthly yields (10%+) but have historically lost 30–40% of book value during rate-hike cycles.',
];

/* ─────────────────────────────────────────────────────────── */
/*  COMPONENT                                                */
/* ─────────────────────────────────────────────────────────── */

const MonthlyDividendStocks = () => {
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
        <title>Monthly Dividend Stocks 2026: 133 Stocks That Pay Every Month</title>
        <meta name="description" content="Complete list of 133 monthly dividend stocks in 2026 — REITs, BDCs, closed-end funds, and ETFs. See yields, payout history, and how much capital you need for $1,000/month." />
        <link rel="canonical" href={`${SITE_URL}/monthly-dividend-stocks`} />
        <meta property="og:title" content="Monthly Dividend Stocks 2026: 133 Stocks That Pay Every Month" />
        <meta property="og:description" content="The complete list of monthly dividend stocks — REITs, BDCs, CEFs, and covered-call ETFs. Includes yields, category breakdowns, and capital requirements." />
        <meta property="og:url" content={`${SITE_URL}/monthly-dividend-stocks`} />
        <meta property="og:type" content="article" />
        <meta property="og:image" content={`${SITE_URL}/images/cover.png`} />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      </Helmet>

      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-10">

        {/* ─── HERO ─── */}
        <header className="space-y-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-accent-teal">
            DividendBro Research
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-text-primary leading-tight">
            Monthly Dividend Stocks: <span className="bg-gradient-to-r from-accent-blue to-accent-teal bg-clip-text text-transparent">133 Stocks That Pay Every Month</span>
          </h1>
          <p className="text-text-secondary text-base sm:text-lg leading-relaxed max-w-3xl">
            <strong className="text-text-primary">133 US-listed stocks pay dividends every single month.</strong> Below is the complete 2026 list — sorted into 6 categories, with yields, risk levels, and how much capital you need for $1,000/month.
          </p>
          <p className="text-text-muted text-xs">
            Updated October 2026 · 133 monthly payers · REITs, BDCs, ETFs, CEFs
          </p>
        </header>

        {/* ─── NOT FINANCIAL ADVICE ─── */}
        <div className="bg-accent-yellow/5 border border-accent-yellow/25 rounded-2xl p-4">
          <p className="text-[11px] text-accent-yellow font-bold uppercase tracking-wider mb-1">
            Not financial advice
          </p>
          <p className="text-[11px] text-text-muted leading-relaxed">
            Monthly dividend stocks include high-risk categories like mortgage REITs and BDCs. Yields shown are current as of October 2026 and can change. Verify all data on the issuer's website before investing.
          </p>
        </div>

        {/* ─── ANSWER BOX ─── */}
        <div className="db-ig">
          <div className="db-ig-header">
            <a href="/" className="db-ig-brand"><span className="db-ig-logo">D</span> DividendBro</a>
            <a href="/screener" className="db-ig-link">Live Screener →</a>
          </div>
          <h4 className="db-ig-title">📊 Monthly Dividend Stocks at a Glance</h4>
          <p className="db-ig-sub">The numbers that matter — October 2026</p>
          <div className="db-ig-grid">
            <div className="db-ig-stat">
              <div className="db-ig-stat-label">Total Monthly Payers</div>
              <div className="db-ig-stat-val" style={{ color: '#60a5fa' }}>133</div>
              <div className="db-ig-stat-sub">Across 6 categories</div>
            </div>
            <div className="db-ig-stat">
              <div className="db-ig-stat-label">Typical Yield Range</div>
              <div className="db-ig-stat-val">3.9% – 14%</div>
              <div className="db-ig-stat-sub">Varies by category</div>
            </div>
            <div className="db-ig-stat">
              <div className="db-ig-stat-label">Capital for $1k/mo</div>
              <div className="db-ig-stat-val" style={{ color: '#fbbf24' }}>~$200,000</div>
              <div className="db-ig-stat-sub">At 6% average yield</div>
            </div>
            <div className="db-ig-stat">
              <div className="db-ig-stat-label">Compounding Edge</div>
              <div className="db-ig-stat-val" style={{ color: '#34d399' }}>+3 bps</div>
              <div className="db-ig-stat-sub">vs quarterly payers</div>
            </div>
          </div>
          <div className="db-ig-footer">
            Most monthly payers are REITs, BDCs, and covered-call ETFs — not traditional dividend stocks
          </div>
        </div>

        <section className="bg-bg-surface border border-border/50 rounded-2xl p-6 space-y-3">
          <h2 className="text-xl font-black text-text-primary tracking-tight">
            What is a monthly dividend stock?
          </h2>
          <p className="text-text-secondary text-sm leading-relaxed">
            A monthly dividend stock pays you cash <strong className="text-text-primary">12 times per year</strong> instead of the usual 4 (quarterly). Instead of getting one big payment every 3 months, you get smaller payments every 30 days.
          </p>
          <p className="text-text-secondary text-sm leading-relaxed">
            The annual total is roughly the same. The difference is <strong className="text-text-primary">when</strong> you get paid — and that matters for budgeting, compounding, and emotional consistency.
          </p>
          <p className="text-text-secondary text-sm leading-relaxed">
            Only about <strong className="text-text-primary">2% of US-listed securities</strong> pay monthly. They cluster in six categories — REITs, BDCs, closed-end funds, covered-call ETFs, mortgage REITs, and preferred stock funds. We'll walk through each.
          </p>
        </section>

        {/* ─── CATEGORIES ─── */}
        <section className="space-y-4">
          <h2 className="text-2xl font-black text-text-primary tracking-tight">
            The 6 categories of monthly dividend stocks
          </h2>
          <p className="text-text-secondary text-sm leading-relaxed">
            Every monthly payer falls into one of these buckets. Knowing which category a stock belongs to tells you a lot about its risk.
          </p>

          <div className="space-y-3">
            {CATEGORIES.map((cat) => (
              <div key={cat.name} className="bg-bg-surface border border-border/50 rounded-2xl p-5 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="text-3xl flex-shrink-0">{cat.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-black text-text-primary text-base">{cat.name}</h3>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-accent-blue/10 text-accent-blue border border-accent-blue/25">
                        {cat.count} stocks
                      </span>
                    </div>
                    <p className="text-[11px] text-text-muted mt-0.5">
                      Typical yield: <span className="font-bold text-accent-green">{cat.yieldRange}</span>
                    </p>
                  </div>
                </div>

                <p className="text-sm text-text-secondary leading-relaxed">{cat.description}</p>

                <div className="bg-bg-primary border border-border/40 rounded-xl p-3">
                  <p className="text-[10px] uppercase text-text-muted font-bold tracking-wider mb-1">Examples</p>
                  <p className="text-xs text-text-primary font-mono">{cat.examples}</p>
                </div>

                <div className="bg-accent-yellow/5 border border-accent-yellow/20 rounded-xl p-3">
                  <p className="text-[11px] text-accent-yellow/90 leading-relaxed">
                    <strong className="font-black">Risk:</strong> {cat.riskNote}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── TOP PICKS ─── */}
        <section className="space-y-4">
          <h2 className="text-2xl font-black text-text-primary tracking-tight">
            Top 12 monthly dividend stocks (by quality)
          </h2>
          <p className="text-text-secondary text-sm leading-relaxed">
            Sorted by <strong className="text-text-primary">safety</strong>, not raw yield. The highest-yielding stock isn't necessarily the best — mortgage REITs at the bottom of this list pay 2–3x more, but can lose half their value in a bad year.
          </p>

          <div className="overflow-x-auto mobile-scroll">
            <table className="w-full text-sm border-collapse">
              <thead className="bg-bg-primary/50 text-text-muted uppercase font-bold tracking-wider text-[10px]">
                <tr>
                  <th className="px-3 py-3 text-left">Stock</th>
                  <th className="px-3 py-3 text-left">Category</th>
                  <th className="px-3 py-3 text-right">Yield</th>
                  <th className="px-3 py-3 text-left">Risk</th>
                  <th className="px-3 py-3 text-left hidden sm:table-cell">Why it stands out</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/10">
                {TOP_MONTHLY_STOCKS.map((s) => {
                  const riskColor =
                    s.risk === 'Safe' ? 'text-accent-green bg-accent-green/10 border-accent-green/25'
                    : s.risk === 'Moderate' ? 'text-accent-blue bg-accent-blue/10 border-accent-blue/25'
                    : s.risk === 'Higher' ? 'text-accent-yellow bg-accent-yellow/10 border-accent-yellow/25'
                    : 'text-accent-red bg-accent-red/10 border-accent-red/25';
                  return (
                    <tr key={s.ticker} className="hover:bg-bg-primary/30 transition-colors">
                      <td className="px-3 py-3">
                        <div className="font-bold text-text-primary text-xs">{s.name}</div>
                        <div className="font-mono text-[10px] text-accent-teal mt-0.5">{s.ticker}</div>
                      </td>
                      <td className="px-3 py-3 text-[11px] text-text-secondary">{s.category}</td>
                      <td className="px-3 py-3 text-right font-mono font-black text-accent-green">{s.yield}%</td>
                      <td className="px-3 py-3">
                        <span className={`text-[9px] uppercase font-black tracking-wider px-2 py-0.5 rounded border ${riskColor}`}>
                          {s.risk}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-[11px] text-text-muted hidden sm:table-cell">{s.note}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <p className="text-[11px] text-text-muted leading-relaxed">
            Yields are approximate as of October 2026. Mortgage REIT yields can swing by several percentage points in a single quarter.
          </p>
        </section>

        {/* ─── YIELD COMPARISON VISUAL ─── */}
        <section className="space-y-4">
          <h2 className="text-2xl font-black text-text-primary tracking-tight">
            How monthly payers compare by yield
          </h2>

          <div className="db-ig">
            <div className="db-ig-header">
              <a href="/" className="db-ig-brand"><span className="db-ig-logo">D</span> DividendBro</a>
              <a href="/screener" className="db-ig-link">Screener →</a>
            </div>
            <h4 className="db-ig-title">📊 Average Yield by Category</h4>
            <p className="db-ig-sub">Green = safer · Amber = medium risk · Red = high risk</p>
            <div className="db-ig-body">
              <div className="db-ig-row">
                <span className="db-ig-row-label">REITs</span>
                <div className="db-ig-row-track">
                  <div className="db-ig-row-fill" style={{ width: '58%', background: 'linear-gradient(90deg,#10b981,#34d399)' }} />
                </div>
                <span className="db-ig-row-val" style={{ color: '#34d399' }}>~5.8%</span>
              </div>
              <div className="db-ig-row">
                <span className="db-ig-row-label">BDCs</span>
                <div className="db-ig-row-track">
                  <div className="db-ig-row-fill" style={{ width: '80%', background: 'linear-gradient(90deg,#10b981,#34d399)' }} />
                </div>
                <span className="db-ig-row-val" style={{ color: '#34d399' }}>~8.0%</span>
              </div>
              <div className="db-ig-row">
                <span className="db-ig-row-label">Covered-Call ETFs</span>
                <div className="db-ig-row-track">
                  <div className="db-ig-row-fill" style={{ width: '75%', background: 'linear-gradient(90deg,#fbbf24,#f59e0b)' }} />
                </div>
                <span className="db-ig-row-val" style={{ color: '#fbbf24' }}>~7.5%</span>
              </div>
              <div className="db-ig-row">
                <span className="db-ig-row-label">Closed-End Funds</span>
                <div className="db-ig-row-track">
                  <div className="db-ig-row-fill" style={{ width: '90%', background: 'linear-gradient(90deg,#fbbf24,#f59e0b)' }} />
                </div>
                <span className="db-ig-row-val" style={{ color: '#fbbf24' }}>~9.0%</span>
              </div>
              <div className="db-ig-row">
                <span className="db-ig-row-label">Mortgage REITs</span>
                <div className="db-ig-row-track">
                  <div className="db-ig-row-fill" style={{ width: '100%', background: 'linear-gradient(90deg,#f87171,#ef4444)' }} />
                </div>
                <span className="db-ig-row-val" style={{ color: '#f87171' }}>~12.0%</span>
              </div>
            </div>
            <div className="db-ig-footer">
              Higher yield = higher risk. Mortgage REITs pay the most but can lose 40% in a rate cycle.
            </div>
          </div>
        </section>

        {/* ─── QUOTE FACTS ─── */}
        <section className="bg-gradient-to-br from-accent-blue/10 via-bg-surface to-accent-teal/10 border border-accent-blue/25 rounded-2xl p-6 space-y-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-accent-blue mb-2">
              Facts worth quoting
            </p>
            <h2 className="text-xl font-black text-text-primary tracking-tight">
              Numbers journalists and researchers can cite
            </h2>
            <p className="text-text-secondary text-xs mt-1">
              Every figure below is pulled from DividendBro's live database of 672 dividend-paying securities. Free to cite with attribution.
            </p>
          </div>

          <ul className="space-y-3">
            {QUOTE_FACTS.map((fact, i) => (
              <li key={i} className="flex gap-3 text-sm text-text-secondary leading-relaxed">
                <span className="text-accent-blue font-black flex-shrink-0">▸</span>
                <span>{fact}</span>
              </li>
            ))}
          </ul>

          <div className="pt-3 border-t border-border/30">
            <p className="text-[11px] text-text-muted">
              Attribution: <span className="font-mono text-text-secondary">Source: DividendBro.com/monthly-dividend-stocks, October 2026</span>
            </p>
          </div>
        </section>

        {/* ─── CAPITAL REQUIRED VISUAL ─── */}
        <section className="space-y-4">
          <h2 className="text-2xl font-black text-text-primary tracking-tight">
            How much capital do you need for $1,000/month?
          </h2>

          <div className="db-ig">
            <div className="db-ig-header">
              <a href="/" className="db-ig-brand"><span className="db-ig-logo">D</span> DividendBro</a>
              <a href="/" className="db-ig-link">Income Planner →</a>
            </div>
            <h4 className="db-ig-title">💰 Capital Required for $1,000/Month</h4>
            <p className="db-ig-sub">At different average yields</p>
            <div className="db-ig-body">
              <div className="db-ig-row">
                <span className="db-ig-row-label">At 4% yield</span>
                <div className="db-ig-row-track">
                  <div className="db-ig-row-fill" style={{ width: '100%', background: 'linear-gradient(90deg,#3b82f6,#06b6d4)' }} />
                </div>
                <span className="db-ig-row-val">$300,000</span>
              </div>
              <div className="db-ig-row">
                <span className="db-ig-row-label">At 6% yield</span>
                <div className="db-ig-row-track">
                  <div className="db-ig-row-fill" style={{ width: '67%', background: 'linear-gradient(90deg,#10b981,#34d399)' }} />
                </div>
                <span className="db-ig-row-val" style={{ color: '#34d399' }}>$200,000</span>
              </div>
              <div className="db-ig-row">
                <span className="db-ig-row-label">At 8% yield</span>
                <div className="db-ig-row-track">
                  <div className="db-ig-row-fill" style={{ width: '50%', background: 'linear-gradient(90deg,#fbbf24,#f59e0b)' }} />
                </div>
                <span className="db-ig-row-val" style={{ color: '#fbbf24' }}>$150,000</span>
              </div>
              <div className="db-ig-row">
                <span className="db-ig-row-label">At 12% yield</span>
                <div className="db-ig-row-track">
                  <div className="db-ig-row-fill" style={{ width: '33%', background: 'linear-gradient(90deg,#f87171,#ef4444)' }} />
                </div>
                <span className="db-ig-row-val" style={{ color: '#f87171' }}>$100,000</span>
              </div>
            </div>
            <div className="db-ig-footer">
              Higher yield means less capital — but more risk. The 12% row is mortgage REIT territory.
            </div>
          </div>

          <p className="text-sm text-text-secondary leading-relaxed">
            A balanced monthly dividend portfolio of 60% REITs, 20% BDCs, and 20% covered-call ETFs averages roughly <strong className="text-text-primary">6.0–6.5%</strong>. That means <strong className="text-text-primary">~$185,000 to $200,000</strong> invested for $1,000/month.
          </p>
        </section>

        {/* ─── WATCH OUT SECTION ─── */}
        <section className="space-y-4">
          <h2 className="text-2xl font-black text-text-primary tracking-tight">
            The 3 traps to avoid
          </h2>

          <div className="space-y-3">
            <div className="bg-bg-surface border border-accent-red/20 rounded-2xl p-5">
              <h3 className="font-bold text-text-primary text-base mb-2 flex items-center gap-2">
                <span className="text-accent-red">⚠</span> Chasing the highest yield
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                A 12% monthly yield looks amazing until the price drops 40% and you've lost 3 years of dividends in capital. The mortgage REITs at 12–15% have historically been the worst long-term performers among monthly payers.
              </p>
            </div>

            <div className="bg-bg-surface border border-accent-red/20 rounded-2xl p-5">
              <h3 className="font-bold text-text-primary text-base mb-2 flex items-center gap-2">
                <span className="text-accent-red">⚠</span> Ignoring return of capital
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                Many covered-call ETFs and closed-end funds pay you partly from <em>your own money</em>. Their distributions include "return of capital" — that erodes NAV. Check the fund's Section 19a notice to see what percentage is real income vs. ROC.
              </p>
            </div>

            <div className="bg-bg-surface border border-accent-red/20 rounded-2xl p-5">
              <h3 className="font-bold text-text-primary text-base mb-2 flex items-center gap-2">
                <span className="text-accent-red">⚠</span> Forgetting the 30% US withholding tax
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                If you're a Singapore investor, every US monthly dividend is taxed 30% at source. A 6% yield becomes 4.2% after tax. Compare after-tax yields — a SGX REIT at 5% nets you more than a US REIT at 6%.
              </p>
            </div>
          </div>
        </section>

        {/* ─── FAQ ─── */}
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

        {/* ─── CTA ─── */}
        <section className="bg-gradient-to-br from-accent-blue/10 via-bg-surface to-accent-teal/10 border border-accent-blue/20 rounded-2xl p-6 sm:p-8 text-center">
          <h2 className="text-xl sm:text-2xl font-black text-text-primary tracking-tight mb-2">
            Screen every monthly dividend stock
          </h2>
          <p className="text-text-secondary text-sm mb-5 max-w-xl mx-auto">
            DividendBro tracks all 672 dividend-paying securities across US, Canadian, and SGX markets. Filter by payout frequency, category, yield, or safety score.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to="/screener"
              className="px-6 py-3 bg-gradient-to-r from-accent-blue to-accent-teal text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md hover:opacity-95 active:scale-95 transition-all"
            >
              Open Dividend Screener
            </Link>
            <Link
              to="/reits-that-pay-monthly"
              className="px-6 py-3 bg-bg-surface border border-border/60 text-text-secondary text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-bg-surface-hover transition-all"
            >
              Monthly REITs Deep Dive
            </Link>
          </div>
        </section>

        {/* ─── DISCLOSURE ─── */}
        <div className="bg-bg-surface border border-border/40 rounded-2xl p-5">
          <p className="text-[10px] uppercase tracking-widest text-text-muted font-bold mb-2">
            Important Disclosures
          </p>
          <p className="text-[11px] text-text-muted leading-relaxed">
            DividendBro is not a licensed financial adviser. This page is for educational purposes only and does not constitute investment advice. Monthly dividend securities include high-risk categories such as mortgage REITs, BDCs, and closed-end funds. Yields shown are approximate, current as of October 2026, and subject to change. Some covered-call ETF distributions include return of capital, which may erode NAV over time. Past performance is not indicative of future results. Consult a licensed financial adviser before investing.
          </p>
        </div>
      </div>
    </>
  );
};

export default MonthlyDividendStocks;