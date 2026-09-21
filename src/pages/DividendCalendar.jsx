import React, { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import useStore from '../store/useStore';
import { getUpcomingDividends } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const DividendCalendar = () => {
  const { market, currency } = useStore();
  const [days, setDays] = useState(60);

  const curSymbol = currency === 'sgd' ? 'S$' : currency === 'cad' ? 'C$' : '$';
  const marketLabel = market === 'sg' ? 'SGX' : market === 'ca' ? 'TSX' : 'US';

  const { data, isLoading, error } = useQuery({
    queryKey: ['upcoming-dividends', market, days],
    queryFn: () => getUpcomingDividends(market, days),
    staleTime: 30 * 60 * 1000,
  });

  const events = data?.events || [];

  // Group by month (YYYY-MM)
  const grouped = useMemo(() => {
    const map = {};
    for (const e of events) {
      const month = e.exDate.slice(0, 7);
      if (!map[month]) map[month] = [];
      map[month].push(e);
    }
    return map;
  }, [events]);

  // Group by exact date within a month
  const groupByDate = (list) => {
    const map = {};
    for (const e of list) {
      if (!map[e.exDate]) map[e.exDate] = [];
      map[e.exDate].push(e);
    }
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  };

  const fmtDate = (iso) => {
    const d = new Date(iso + 'T00:00:00Z');
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' });
  };

  const fmtMonth = (ym) => {
    const [y, m] = ym.split('-');
    const d = new Date(Date.UTC(parseInt(y), parseInt(m) - 1, 1));
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
  };

  return (
    <>
      <Helmet>
        <title>{marketLabel} Dividend Calendar — Upcoming Ex-Dividend Dates | DividendBro</title>
        <meta name="description" content={`Upcoming dividend payout dates for ${marketLabel} stocks over the next ${days} days. Estimated ex-dates based on historical payout patterns.`} />
        <link rel="canonical" href="https://dividendbro.com/calendar" />
      </Helmet>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-text-primary">
            Dividend <span className="bg-gradient-to-r from-accent-blue to-accent-teal bg-clip-text text-transparent">Calendar</span>
          </h1>
          <p className="text-text-muted text-sm mt-2 max-w-3xl">
            Upcoming ex-dividend dates for <strong className="text-text-secondary">{marketLabel}</strong> stocks over the next <strong className="text-text-secondary">{days} days</strong>. Switch market in the header to see US, Canada, or SGX.
          </p>
        </div>

        {/* Time window toggle */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Window:</span>
          {[30, 60, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                days === d
                  ? 'bg-accent text-white border-accent glow-accent'
                  : 'bg-bg-surface border-border/50 text-text-secondary hover:border-accent/40'
              }`}
            >
              {d} days
            </button>
          ))}
        </div>

        {/* Info banner */}
        <div className="bg-amber-500/10 border border-amber-400/30 rounded-2xl p-4">
          <p className="text-[11px] text-amber-300 font-bold uppercase tracking-wider mb-1">
            Estimated dates — verify before trading
          </p>
          <p className="text-[11px] text-text-secondary leading-relaxed">
            These dates are projected from each stock's historical payout pattern (median gap between the last 8 payouts). Actual ex-dividend dates are confirmed by the company typically 2–4 weeks in advance. Always verify on the issuer's investor relations page before trading.
          </p>
        </div>

        {/* Summary strip */}
        {!isLoading && !error && events.length > 0 && (
          <div className="grid grid-cols-3 gap-3 bg-bg-surface border border-border/50 rounded-2xl p-4">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-text-muted font-bold">Events</p>
              <p className="text-2xl font-black text-text-primary font-mono mt-1">{events.length}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-text-muted font-bold">Unique Stocks</p>
              <p className="text-2xl font-black text-accent-teal font-mono mt-1">{data.uniqueStocks}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-text-muted font-bold">Window</p>
              <p className="text-2xl font-black text-accent-blue font-mono mt-1">{days}d</p>
            </div>
          </div>
        )}

        {isLoading && <div className="py-16"><LoadingSpinner /></div>}

        {error && (
          <div className="bg-accent-red/5 border border-accent-red/20 rounded-2xl p-5 text-center">
            <p className="text-sm font-bold text-accent-red">Could not load calendar. Try again.</p>
          </div>
        )}

        {!isLoading && !error && events.length === 0 && (
          <div className="bg-bg-surface border border-dashed border-border/40 rounded-2xl p-12 text-center">
            <p className="text-sm font-bold text-text-primary">No upcoming dividends in this window</p>
            <p className="text-xs text-text-muted mt-1">Try a wider window or switch market in the header.</p>
          </div>
        )}

        {/* Month groups */}
        {!isLoading && !error && Object.keys(grouped).sort().map((month) => (
          <div key={month} className="space-y-3">
            <h2 className="text-xl font-black tracking-tight text-text-primary">
              {fmtMonth(month)}
              <span className="text-text-muted text-sm font-normal ml-2">
                ({grouped[month].length} {grouped[month].length === 1 ? 'event' : 'events'})
              </span>
            </h2>

            <div className="bg-bg-surface border border-border/50 rounded-2xl overflow-hidden shadow-sm">
              {groupByDate(grouped[month]).map(([date, list], idx) => (
                <div key={date} className={idx > 0 ? 'border-t border-border/40' : ''}>
                  {/* Date header */}
                  <div className="px-4 py-2.5 bg-bg-primary/50 flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-accent-blue tracking-wider">
                      {fmtDate(date)}
                    </span>
                    <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">
                      {list.length} {list.length === 1 ? 'stock' : 'stocks'}
                    </span>
                  </div>

                  {/* Stocks paying that day */}
                  <div className="divide-y divide-border/20">
                    {list.map((e, i) => (
                      <Link
                        key={`${e.symbol}-${i}`}
                        to={`/search?symbol=${e.symbol}`}
                        className="flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-bg-surface-hover transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono font-bold text-accent-teal text-xs">{e.symbol}</span>
                            <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border bg-bg-primary border-border/40 text-text-muted">
                              {e.frequency}
                            </span>
                            {e.safetyScore === 'Caution' && (
                              <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border bg-accent-red/10 border-accent-red/20 text-accent-red">
                                Caution
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-text-primary truncate mt-0.5">{e.name}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-mono font-bold text-text-primary text-xs">
                            {curSymbol}{e.estimatedAmount.toFixed(2)}
                          </p>
                          <p className="text-[10px] text-text-muted">est. /share</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Bottom note */}
        {!isLoading && events.length > 0 && (
          <p className="text-[10px] text-text-muted text-center leading-relaxed max-w-2xl mx-auto pt-4">
            Ex-dividend dates are estimated using the median gap between the stock's last 8 payouts. Actual dates are typically confirmed 2–4 weeks in advance by the issuer. Payment dates usually follow 2–4 weeks after ex-dates. This page is educational only, not investment advice.
          </p>
        )}
      </div>
    </>
  );
};

export default DividendCalendar;