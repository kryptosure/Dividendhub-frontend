import React, { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getScreenerStocks } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const SITE_URL = 'https://dividendbro.com';

// Curated monthly REIT list — verified against 2026 press releases and SEC filings
const MONTHLY_REITS = [
  {
    ticker: 'O',
    name: 'Realty Income',
    sector: 'Net Lease',
    yield: '~5.0%',
    tier: 'Blue Chip',
    note: 'Trademarked "The Monthly Dividend Company." 668+ consecutive monthly dividends since 1994. $60B market cap, 15,500+ properties.',
  },
  {
    ticker: 'ADC',
    name: 'Agree Realty',
    sector: 'Net Lease',
    yield: '~3.9%',
    tier: 'Blue Chip',
    note: 'Retail-focused net lease REIT. Investment-grade tenants. Has grown its monthly dividend consistently since IPO.',
  },
  {
    ticker: 'LTC',
    name: 'LTC Properties',
    sector: 'Healthcare / Senior Housing',
    yield: '~5.7%',
    tier: 'Blue Chip',
    note: 'Skilled nursing and senior housing focus. Monthly payer for over 20 years. Steady $0.19/month distribution.',
  },
  {
    ticker: 'EPR',
    name: 'EPR Properties',
    sector: 'Experiential (theaters, ski, eat & play)',
    yield: '~6.1%',
    tier: 'Core',
    note: 'Specialty REIT with non-traditional properties. Higher yield reflects higher concentration risk in entertainment venues.',
  },
  {
    ticker: 'DOC',
    name: 'Healthpeak Properties',
    sector: 'Healthcare',
    yield: '~7.0%',
    tier: 'Core',
    note: 'Lab and medical office focus. $27B market cap. Notable for higher-than-average yield in the healthcare REIT sector.',
  },
  {
    ticker: 'APLE',
    name: 'Apple Hospitality',
    sector: 'Hotels',
    yield: '~8.0%',
    tier: 'Higher Risk',
    note: 'Upscale hotel REIT — Marriott and Hilton brands. Hospitality is cyclical; distributions were cut during COVID.',
  },
  {
    ticker: 'GOOD',
    name: 'Gladstone Commercial',
    sector: 'Industrial / Office',
    yield: '~9.6%',
    tier: 'Higher Risk',
    note: 'Net lease industrial and office. Smaller cap REIT with higher yield to compensate for size and leverage.',
  },
  {
    ticker: 'AGNC',
    name: 'AGNC Investment',
    sector: 'Mortgage REIT',
    yield: '~14.0%',
    tier: 'Speculative',
    note: 'Mortgage-backed securities investor. Distribution has been cut multiple times. Book value erodes in rising-rate cycles.',
  },
];

const NEW_MONTHLY_CONVERTS = [
  { ticker: 'UDR', name: 'UDR Inc.', sector: 'Residential', note: 'First residential REIT to convert to monthly, April 2026.' },
  { ticker: 'FCPT', name: 'Four Corners Property Trust', sector: 'Net Lease', note: 'Converted to monthly in June 2026.' },
  { ticker: 'IVR', name: 'Invesco Mortgage Capital', sector: 'Mortgage REIT', note: 'Converted to monthly in January 2026.' },
];

const MOVED_TO_QUARTERLY = [
  { ticker: 'STAG', name: 'STAG Industrial' },
  { ticker: 'WSR', name: 'Whitestone REIT' },
  { ticker: 'SLG', name: 'SL Green Realty' },
];

const FAQS = [
  {
    q: 'How many REITs pay monthly dividends in 2026?',
    a: 'Approximately 19 US-listed REITs paid monthly dividends as of August 2026 — split between 13 equity REITs and 6 mortgage REITs. The count changes as boards change policies. In 2026, three well-known REITs (STAG, Whitestone, SL Green) moved to quarterly, while three others (UDR, Four Corners, Invesco Mortgage) moved to monthly.',
  },
  {
    q: 'Which monthly REIT has the longest track record?',
    a: 'Realty Income (O). It has paid monthly dividends without interruption since its 1994 NYSE listing and has trademarked the phrase "The Monthly Dividend Company." Its payment history dates back further, to 1969 as a private entity.',
  },
  {
    q: 'Are monthly REIT dividends better than quarterly?',
    a: 'The compounding advantage of monthly over quarterly is roughly 2 basis points per year — real but trivial. The real reason to prefer monthly REITs is cash-flow convenience for retirees who need to match expenses to income. The underlying quality of the REIT matters far more than the payment calendar.',
  },
  {
    q: 'Why do some REITs stop paying monthly?',
    a: 'Monthly payment is a board policy, not a REIT structural feature. In 2026, STAG Industrial, Whitestone, and SL Green all moved to quarterly. In every case, the dividend itself was not cut — only the payment cadence changed. This can be disruptive to income budgeting even when the total annual payout stays the same.',
  },
  {
    q: 'What does a monthly REIT yield look like in 2026?',
    a: 'Yields range from roughly 3.9% (Agree Realty) to 14% (AGNC, a mortgage REIT). Equity REITs typically yield 4–7%. Mortgage REITs yield 10–14% but have underperformed on total return — the mREIT index carried a ~13% dividend yield but delivered under 2% total return in 2026.',
  },
  {
    q: 'Are there SGX REITs that pay monthly?',
    a: 'No. SGX REITs pay quarterly or semi-annually. None pay monthly. For Singapore investors wanting monthly income, the available options are US monthly REITs (with 30% withholding tax) or the Monthly Dividend Income Planner on DividendBro to construct a diversified schedule from quarterly payers.',
  },
];

const ReitsThatPayMonthly = () => {
  const { data: monthlyData, isLoading } = useQuery({
    queryKey: ['reits-monthly-landing'],
    queryFn: () => getScreenerStocks({
      market: 'us',
      frequency: 'monthly',
      assetType: 'reit',
      sort: 'yield-desc',
      limit: 500,
    }),
    staleTime: 30 * 60 * 1000,
  });

  const liveReits = monthlyData?.stocks || [];

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
        <title>REITs That Pay Monthly Dividends — Full Verified List (2026) | DividendBro</title>
        <meta name="description" content="Every US-listed REIT paying monthly dividends in 2026. Verified list, yields, tax treatment, and the cadence changes most articles miss." />
        <link rel="canonical" href={`${SITE_URL}/reits-that-pay-monthly`} />
        <meta property="og:title" content="REITs That Pay Monthly Dividends — Full Verified List (2026)" />
        <meta property="og:description" content="Every US-listed REIT paying monthly dividends in 2026. Verified list, yields, tax treatment, and cadence changes." />
        <meta property="og:url" content={`${SITE_URL}/reits-that-pay-monthly`} />
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
            REITs That Pay Monthly Dividends: The <span className="bg-gradient-to-r from-accent-blue to-accent-teal bg-clip-text text-transparent">Verified 2026 List</span>
          </h1>
          <p className="text-text-secondary text-base sm:text-lg leading-relaxed max-w-3xl">
            Roughly 19 US-listed REITs paid monthly dividends as of August 2026. Three well-known names moved to quarterly this year, and three others converted to monthly for the first time. Here's the current list — verified against 2026 company press releases.
          </p>
          <p className="text-text-muted text-xs">
            Updated September 2026 · {liveReits.length || 19} monthly REITs · Yields verified against August 2026 prices
          </p>
        </header>

        <div className="bg-accent-yellow/5 border border-accent-yellow/25 rounded-2xl p-4">
          <p className="text-[11px] text-accent-yellow font-bold uppercase tracking-wider mb-1">
            Not financial advice
          </p>
          <p className="text-[11px] text-text-muted leading-relaxed">
            REIT investing carries risk, including distribution cuts and capital loss. Monthly payment is a board policy that can change at any time. Yields shown move daily. This page is educational only — verify all data on the issuer's investor relations page before investing.
          </p>
        </div>

        <section className="bg-bg-surface border border-border/50 rounded-2xl p-6 space-y-3">
          <h2 className="text-xl font-black text-text-primary tracking-tight">
            Why REITs pay monthly (and why most don't)
          </h2>
          <p className="text-text-secondary text-sm leading-relaxed">
            REITs are legally required to distribute at least <strong className="text-text-primary">90% of taxable income</strong> to shareholders, which is why they yield 3–5× the S&P 500 average. That yield isn't a red flag — it's the structural trade-off for the REIT's corporate tax exemption.
          </p>
          <p className="text-text-secondary text-sm leading-relaxed">
            Monthly payment, though, is a <strong className="text-text-primary">board policy decision</strong>, not a structural REIT feature. Most REITs pay quarterly because their rent rolls arrive quarterly. The subset that pays monthly tends to be net-lease REITs (which collect rent monthly), healthcare REITs, and mortgage REITs (which collect interest monthly).
          </p>
          <p className="text-text-secondary text-sm leading-relaxed">
            Payment frequency can be changed easily. In 2026, three well-known REITs switched from monthly to quarterly without cutting the dividend. The cadence change made no headlines, but it disrupted monthly budgets for income investors.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-black text-text-primary tracking-tight">
            The full list of monthly REITs, ranked by quality
          </h2>
          <p className="text-text-secondary text-sm leading-relaxed">
            Sorted by tier, not yield. Blue Chip = decades of track record. Speculative = high yield with material risk of principal loss.
          </p>

          <div className="space-y-3">
            {MONTHLY_REITS.map((r) => (
              <div key={r.ticker} className="bg-bg-surface border border-border/50 rounded-2xl p-4">
                <div className="flex items-start justify-between flex-wrap gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        to={`/search?symbol=${r.ticker}`}
                        className="font-mono font-bold text-accent-teal hover:underline text-base"
                      >
                        {r.ticker}
                      </Link>
                      <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border ${
                        r.tier === 'Blue Chip' ? 'bg-accent-green/10 border-accent-green/20 text-accent-green' :
                        r.tier === 'Core' ? 'bg-accent-blue/10 border-accent-blue/20 text-accent-blue' :
                        r.tier === 'Higher Risk' ? 'bg-accent-yellow/10 border-accent-yellow/20 text-accent-yellow' :
                        'bg-accent-red/10 border-accent-red/20 text-accent-red'
                      }`}>
                        {r.tier}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-text-primary mt-1">{r.name}</p>
                    <p className="text-[11px] text-text-muted mt-0.5">{r.sector}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] uppercase text-text-muted font-bold tracking-wider">Yield</p>
                    <p className="text-lg font-black text-accent-green mt-0.5">{r.yield}</p>
                  </div>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed mt-3">{r.note}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-black text-text-primary tracking-tight">
            The list changed in 2026 — here's what moved
          </h2>
          <p className="text-text-secondary text-sm leading-relaxed">
            Most articles on this topic are outdated. Here are the cadence changes verified against 2026 filings.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-bg-surface border border-accent-green/20 rounded-2xl p-4">
              <h3 className="font-bold text-accent-green text-sm mb-3 uppercase tracking-wider">Moved to monthly in 2026</h3>
              <div className="space-y-3">
                {NEW_MONTHLY_CONVERTS.map((m) => (
                  <div key={m.ticker}>
                    <p className="text-sm">
                      <Link to={`/search?symbol=${m.ticker}`} className="font-mono font-bold text-accent-teal hover:underline">{m.ticker}</Link>
                      <span className="text-text-primary font-bold ml-2">{m.name}</span>
                    </p>
                    <p className="text-[11px] text-text-muted mt-0.5">{m.sector} · {m.note}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-bg-surface border border-accent-red/20 rounded-2xl p-4">
              <h3 className="font-bold text-accent-red text-sm mb-3 uppercase tracking-wider">Moved to quarterly in 2026</h3>
              <div className="space-y-3">
                {MOVED_TO_QUARTERLY.map((m) => (
                  <div key={m.ticker}>
                    <p className="text-sm">
                      <Link to={`/search?symbol=${m.ticker}`} className="font-mono font-bold text-accent-teal hover:underline">{m.ticker}</Link>
                      <span className="text-text-primary font-bold ml-2">{m.name}</span>
                    </p>
                    <p className="text-[11px] text-text-muted mt-0.5">Dividend not cut — cadence only</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {liveReits.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div>
                <h2 className="text-2xl font-black text-text-primary tracking-tight">
                  All monthly REITs in our screener
                </h2>
                <p className="text-text-muted text-sm mt-1">
                  Live data pulled from DividendBro. Sorted by yield, highest first.
                </p>
              </div>
              <Link to="/screener" className="text-xs font-bold text-accent-blue hover:underline">
                Open full screener →
              </Link>
            </div>

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
                    {liveReits.slice(0, 25).map((s) => (
                      <tr key={s.symbol} className="hover:bg-bg-primary/30 transition-colors">
                        <td className="px-3 py-2.5">
                          <Link to={`/search?symbol=${s.symbol}`} className="font-mono font-bold text-accent-teal hover:underline">
                            {s.symbol}
                          </Link>
                        </td>
                        <td className="px-3 py-2.5 text-text-primary text-xs truncate max-w-[200px]">
                          {s.name}
                        </td>
                        <td className="px-3 py-2.5 text-right font-mono font-bold text-accent-green">
                          {s.currentYield ? `${Number(s.currentYield).toFixed(2)}%` : '—'}
                        </td>
                        <td className="px-3 py-2.5 text-right font-mono text-text-secondary text-xs">
                          {s.currentPrice ? `$${Number(s.currentPrice).toFixed(2)}` : '—'}
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
            </div>
          </section>
        )}

        <section className="space-y-4">
          <h2 className="text-2xl font-black text-text-primary tracking-tight">
            The tax reality for Singapore investors
          </h2>

          <div className="space-y-3">
            <div className="bg-bg-surface border border-border/50 rounded-2xl p-5">
              <h3 className="font-bold text-text-primary text-base mb-2">US REITs — 30% withholding tax</h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                Most REIT distributions are classified as ordinary income in the US, not qualified dividends. For Singapore residents, the standard 30% withholding tax applies. A 5% REIT yield becomes 3.5% after tax. A 14% mortgage REIT yield becomes 9.8% after tax — on a security whose book value may be falling.
              </p>
            </div>

            <div className="bg-bg-surface border border-border/50 rounded-2xl p-5">
              <h3 className="font-bold text-text-primary text-base mb-2">SGX REITs — 0% withholding tax</h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                SGX REIT distributions are tax-exempt for individual investors in Singapore. A 5% SGX REIT yield is a full 5% after tax. This is the main reason most SG investors hold S-REITs for income despite the lower growth profile.
              </p>
            </div>

            <div className="bg-bg-surface border border-border/50 rounded-2xl p-5">
              <h3 className="font-bold text-text-primary text-base mb-2">The after-tax math</h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                A US monthly REIT at 5% after tax = 3.5%. To match the after-tax income of a 5% SGX REIT, the US REIT needs a pre-tax yield of ~7.1%. Only the higher-yielding US REITs (EPR, APLE, GOOD, AGNC) clear that bar — and they carry higher risk.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-black text-text-primary tracking-tight">
            The risks most articles skip
          </h2>

          <div className="space-y-3">
            <div className="bg-bg-surface border border-border/50 rounded-2xl p-5">
              <h3 className="font-bold text-text-primary text-base mb-2">Monthly is a policy, not a guarantee</h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                STAG, Whitestone, and SL Green all moved to quarterly in 2026. None cut the dividend. But if you'd built a budget around their monthly payments, that's a real disruption. There's no contractual obligation for any REIT to pay monthly.
              </p>
            </div>

            <div className="bg-bg-surface border border-border/50 rounded-2xl p-5">
              <h3 className="font-bold text-text-primary text-base mb-2">Mortgage REITs are not equity REITs</h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                AGNC, ARR, ORC, IVR — these appear on "monthly REIT" lists alongside Realty Income, but they behave nothing alike. Mortgage REITs carry leverage, buy MBS, and can lose 30%+ of book value in a rising-rate cycle. The mREIT index carried a ~13% dividend yield in 2026 while delivering under 2% total return YTD.
              </p>
            </div>

            <div className="bg-bg-surface border border-border/50 rounded-2xl p-5">
              <h3 className="font-bold text-text-primary text-base mb-2">AFFO coverage is the safety metric</h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                Do not evaluate REIT dividend safety using EPS or payout ratio. Depreciation makes REIT earnings look artificially low. The correct metric is <strong className="text-text-primary">AFFO (Adjusted Funds From Operations)</strong>. A REIT paying out more than 90% of AFFO is vulnerable to a cut. Above 100% is a red flag.
              </p>
            </div>

            <div className="bg-bg-surface border border-border/50 rounded-2xl p-5">
              <h3 className="font-bold text-text-primary text-base mb-2">Monthly compounding is tiny</h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                The difference between monthly and quarterly reinvestment is approximately <strong className="text-text-primary">2 basis points per year</strong>. If someone is telling you monthly REITs are a superior asset class because of compounding, they're overselling. The case for monthly REITs is convenience, not returns.
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
            Build a monthly income plan from REITs and dividend stocks
          </h2>
          <p className="text-text-secondary text-sm mb-5 max-w-xl mx-auto">
            Use our Monthly Dividend Income Planner to see a sample allocation for your target income, or browse all 643 dividend payers in the screener.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to="/"
              className="px-6 py-3 bg-gradient-to-r from-accent-blue to-accent-teal text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md hover:opacity-95 active:scale-95 transition-all"
            >
              Monthly Income Planner
            </Link>
            <Link
              to="/screener"
              className="px-6 py-3 bg-bg-surface border border-border/60 text-text-secondary text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-bg-surface-hover transition-all"
            >
              Open Screener
            </Link>
          </div>
        </section>

        <div className="bg-bg-surface border border-border/40 rounded-2xl p-5">
          <p className="text-[10px] uppercase tracking-widest text-text-muted font-bold mb-2">
            Important Disclosures
          </p>
          <p className="text-[11px] text-text-muted leading-relaxed">
            DividendBro is not a licensed financial adviser. This page is for educational purposes only and does not constitute investment advice, a recommendation, or a solicitation to buy or sell any securities. REIT investing carries risk, including distribution cuts, NAV decline, and loss of principal. Monthly payment is a board policy and can be changed at any time without notice. Yields shown move daily. Past performance is not indicative of future results. Consult a licensed financial adviser before making any investment decisions.
          </p>
        </div>
      </div>
    </>
  );
};

export default ReitsThatPayMonthly;