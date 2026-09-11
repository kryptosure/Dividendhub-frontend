import React, { useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import useStore from '../store/useStore';
import { getAnalyticsDashboard, getAdminUsers, getMe } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const StatCard = ({ label, value, sub, accent = 'blue' }) => {
  const map = {
    blue: 'text-accent-blue', teal: 'text-accent-teal', green: 'text-accent-green',
    yellow: 'text-accent-yellow', purple: 'text-accent-purple', red: 'text-accent-red',
  };
  return (
    <div className="bg-bg-surface border border-border/50 rounded-2xl p-4 shadow-sm">
      <div className="text-[10px] uppercase font-bold tracking-wider text-text-muted">{label}</div>
      <div className={`text-2xl font-black mt-1 ${map[accent] || 'text-text-primary'}`}>{value}</div>
      {sub && <div className="text-[11px] text-text-muted font-medium mt-0.5">{sub}</div>}
    </div>
  );
};

const SectionTitle = ({ children }) => (
  <h2 className="text-xs font-bold uppercase tracking-widest text-text-muted mb-3 mt-2">{children}</h2>
);

const BarChart = ({ data, max, color = 'blue', labelKey = 'date', valueKey = 'count' }) => {
  const colors = {
    blue: 'from-accent-blue/60 to-accent-blue hover:from-accent-teal/60 hover:to-accent-teal',
    teal: 'from-accent-teal/60 to-accent-teal',
    green: 'from-accent-green/60 to-accent-green',
    purple: 'from-accent-purple/60 to-accent-purple',
  };
  return (
    <div className="flex items-end gap-1 h-32">
      {data.map((d, i) => {
        const val = parseInt(d[valueKey]);
        const pct = max > 0 ? (val / max) * 100 : 0;
        return (
          <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group">
            <div
              className={`w-full bg-gradient-to-t ${colors[color]} rounded-t transition-all`}
              style={{ height: `${Math.max(pct, 4)}%` }}
              title={`${d[labelKey]}: ${val}`}
            />
            <div className="text-[9px] text-text-muted mt-1 rotate-45 origin-left whitespace-nowrap">
              {String(d[labelKey]).slice(5)}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const Admin = () => {
  const { user } = useStore();
  const [authState, setAuthState] = useState('checking'); // 'checking' | 'admin' | 'denied' | 'anonymous'
  const [data, setData] = useState(null);
  const [users, setUsers] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const pageSize = 50;

  // Step 1: Verify admin status with the backend
  useEffect(() => {
    const verify = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setAuthState('anonymous');
        return;
      }
      try {
        const me = await getMe();
        if (me?.isAdmin) {
          setAuthState('admin');
        } else {
          setAuthState('denied');
        }
      } catch (e) {
        setAuthState('anonymous');
      }
    };
    verify();
  }, []);

  // Step 2: Once verified as admin, fetch the data
  useEffect(() => {
    if (authState !== 'admin') return;
    const fetchAll = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [dash, us] = await Promise.all([
          getAnalyticsDashboard(),
          getAdminUsers({ limit: pageSize, offset: page * pageSize, search }),
        ]);
        setData(dash);
        setUsers(us);
      } catch (err) {
        setError(err.response?.data?.error || err.message || 'Failed to load');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAll();
  }, [authState, page, search]);

  if (authState === 'checking') return <LoadingSpinner />;
  if (authState === 'anonymous') return <Navigate to="/login" replace />;
  if (authState === 'denied') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-black mb-2">Access Denied</h1>
        <p className="text-text-muted text-sm">Your account does not have admin privileges.</p>
        <Link to="/" className="inline-block mt-6 px-5 py-2 bg-accent-blue text-white text-xs font-bold rounded-xl">
          Return Home
        </Link>
      </div>
    );
  }

  if (isLoading && !data) return <LoadingSpinner />;
  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="bg-accent-red/5 border border-accent-red/20 rounded-2xl p-6">
          <p className="text-accent-red font-bold">⚠️ {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-5 py-2 bg-accent-red/10 border border-accent-red/20 text-accent-red text-xs font-bold rounded-xl"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const maxSignups = data?.timelines?.signups?.length
    ? Math.max(...data.timelines.signups.map(s => parseInt(s.count))) : 1;
  const maxDau = data?.timelines?.dau?.length
    ? Math.max(...data.timelines.dau.map(s => parseInt(s.count))) : 1;
  const maxFeature = data?.featureUsage?.length
    ? Math.max(...data.featureUsage.map(f => parseInt(f.count))) : 1;

  return (
    <>
      <Helmet>
        <title>Admin Dashboard – DividendBro</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-text-primary">Admin Dashboard</h1>
            <p className="text-text-muted text-sm mt-1">
              Last updated: {new Date(data.generatedAt).toLocaleString()}
            </p>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-md bg-accent-purple/10 text-accent-purple border border-accent-purple/20">
            🔒 Private
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatCard label="Total Users" value={data.users.total} accent="blue" />
          <StatCard label="Signups Today" value={data.users.signupsToday} sub={`${data.users.signups7d} in 7d`} accent="teal" />
          <StatCard label="DAU (Today)" value={data.users.activeToday} sub={`${data.users.active7d} WAU`} accent="green" />
          <StatCard label="Stickiness" value={`${data.users.stickiness}%`} sub="DAU/MAU ratio" accent="yellow" />
          <StatCard label="Portfolio Adopt" value={`${data.users.portfolioAdoptionPct}%`} sub={`${data.users.usersWithPortfolio} users`} accent="purple" />
          <StatCard label="Watchlist Adopt" value={`${data.users.watchlistAdoptionPct}%`} sub={`${data.users.usersWithWatchlist} users`} accent="teal" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <SectionTitle>Signups (Last 30 Days)</SectionTitle>
            <div className="bg-bg-surface border border-border/50 rounded-2xl p-5 shadow-sm">
              {data.timelines.signups.length === 0 ? (
                <p className="text-text-muted text-sm py-8 text-center">No data yet.</p>
              ) : (
                <BarChart data={data.timelines.signups} max={maxSignups} color="blue" />
              )}
            </div>
          </div>
          <div>
            <SectionTitle>Daily Active Users (Last 30 Days)</SectionTitle>
            <div className="bg-bg-surface border border-border/50 rounded-2xl p-5 shadow-sm">
              {data.timelines.dau.length === 0 ? (
                <p className="text-text-muted text-sm py-8 text-center">No data yet.</p>
              ) : (
                <BarChart data={data.timelines.dau} max={maxDau} color="green" />
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <SectionTitle>Feature Usage (Last 30 Days)</SectionTitle>
            <div className="bg-bg-surface border border-border/50 rounded-2xl p-5 shadow-sm">
              {data.featureUsage.length === 0 ? (
                <p className="text-text-muted text-sm">No events yet.</p>
              ) : (
                <div className="space-y-2">
                  {data.featureUsage.slice(0, 12).map((f, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="w-32 text-[11px] font-mono text-text-secondary truncate">{f.eventType}</span>
                      <div className="flex-1 h-4 bg-bg-primary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-accent-blue to-accent-teal rounded-full"
                          style={{ width: `${(parseInt(f.count) / maxFeature) * 100}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-bold text-accent-blue w-12 text-right">{f.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <SectionTitle>Chat Usage by Context</SectionTitle>
            <div className="bg-bg-surface border border-border/50 rounded-2xl p-5 shadow-sm">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-bg-primary border border-border/40 rounded-xl p-3 text-center">
                  <div className="text-[10px] uppercase font-bold text-text-muted">Stock</div>
                  <div className="text-2xl font-black text-accent-blue mt-1">{data.chat.stock}</div>
                </div>
                <div className="bg-bg-primary border border-border/40 rounded-xl p-3 text-center">
                  <div className="text-[10px] uppercase font-bold text-text-muted">Portfolio</div>
                  <div className="text-2xl font-black text-accent-purple mt-1">{data.chat.portfolio}</div>
                </div>
                <div className="bg-bg-primary border border-border/40 rounded-xl p-3 text-center">
                  <div className="text-[10px] uppercase font-bold text-text-muted">Generic</div>
                  <div className="text-2xl font-black text-accent-teal mt-1">{data.chat.generic}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <SectionTitle>Top Searched Tickers (Last 30 Days)</SectionTitle>
            <div className="bg-bg-surface border border-border/50 rounded-2xl p-4 shadow-sm">
              {data.topSearches.length === 0 ? (
                <p className="text-text-muted text-sm">No search data yet.</p>
              ) : (
                <ul className="space-y-1.5">
                  {data.topSearches.map((s, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm">
                      <span className="text-[10px] text-text-muted w-5">{i + 1}</span>
                      <span className="font-mono text-text-primary flex-1">{s.query}</span>
                      <span className="text-xs font-bold text-accent-blue">{s.count}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <div>
            <SectionTitle>Top Viewed Stocks (Last 30 Days)</SectionTitle>
            <div className="bg-bg-surface border border-border/50 rounded-2xl p-4 shadow-sm">
              {data.topViewed.length === 0 ? (
                <p className="text-text-muted text-sm">No view data yet.</p>
              ) : (
                <ul className="space-y-1.5">
                  {data.topViewed.map((s, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm">
                      <span className="text-[10px] text-text-muted w-5">{i + 1}</span>
                      <span className="font-mono text-text-primary flex-1">{s.symbol}</span>
                      <span className="text-xs font-bold text-accent-teal">{s.count}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <SectionTitle>Top Articles (Last 30 Days)</SectionTitle>
            <div className="bg-bg-surface border border-border/50 rounded-2xl p-4 shadow-sm">
              {data.topArticles.length === 0 ? (
                <p className="text-text-muted text-sm">No article views yet.</p>
              ) : (
                <ul className="space-y-1.5">
                  {data.topArticles.map((a, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm">
                      <span className="text-[10px] text-text-muted w-5">{i + 1}</span>
                      <Link to={`/blog/${a.slug}`} className="text-text-primary flex-1 truncate hover:text-accent-blue transition-colors text-xs">
                        {a.slug}
                      </Link>
                      <span className="text-xs font-bold text-accent-purple">{a.count}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <div>
            <SectionTitle>Geography</SectionTitle>
            <div className="bg-bg-surface border border-border/50 rounded-2xl p-4 shadow-sm">
              {data.geography.countryBreakdown.length === 0 ? (
                <p className="text-text-muted text-sm">No geo data.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {data.geography.countryBreakdown.map((c, i) => (
                    <span key={i} className="text-xs px-3 py-1.5 bg-bg-primary border border-border/40 rounded-lg">
                      <span className="font-bold text-text-primary">{c.country}</span>
                      <span className="text-text-muted ml-2">{c.count}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {data.cohorts.length > 0 && (
          <div>
            <SectionTitle>Cohort Retention (Weekly Signup Groups)</SectionTitle>
            <div className="bg-bg-surface border border-border/50 rounded-2xl p-4 shadow-sm overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="text-text-muted uppercase font-bold tracking-wider text-[10px]">
                  <tr>
                    <th className="px-3 py-2 text-left">Week of</th>
                    <th className="px-3 py-2 text-right">Signups</th>
                    <th className="px-3 py-2 text-right">Week 1</th>
                    <th className="px-3 py-2 text-right">Week 2</th>
                    <th className="px-3 py-2 text-right">Week 4</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20">
                  {data.cohorts.map((c, i) => (
                    <tr key={i}>
                      <td className="px-3 py-2 font-mono text-text-secondary">{c.week}</td>
                      <td className="px-3 py-2 text-right font-bold text-accent-blue">{c.size}</td>
                      <td className="px-3 py-2 text-right"><span className={`font-bold ${c.w1 >= 40 ? 'text-accent-green' : c.w1 >= 20 ? 'text-accent-yellow' : 'text-text-muted'}`}>{c.w1}%</span></td>
                      <td className="px-3 py-2 text-right"><span className={`font-bold ${c.w2 >= 30 ? 'text-accent-green' : c.w2 >= 15 ? 'text-accent-yellow' : 'text-text-muted'}`}>{c.w2}%</span></td>
                      <td className="px-3 py-2 text-right"><span className={`font-bold ${c.w4 >= 20 ? 'text-accent-green' : c.w4 >= 10 ? 'text-accent-yellow' : 'text-text-muted'}`}>{c.w4}%</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <SectionTitle>All Users ({users?.total || 0})</SectionTitle>
            <input
              type="text"
              placeholder="Search email..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              className="bg-bg-surface border border-border/60 rounded-lg px-3 py-1.5 text-xs text-text-primary placeholder-text-muted/60 focus:outline-none focus:border-accent-blue"
            />
          </div>
          <div className="bg-bg-surface border border-border/50 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-bg-primary/50 text-text-muted uppercase font-bold tracking-wider text-[10px]">
                  <tr>
                    <th className="px-4 py-3 text-left">Email</th>
                    <th className="px-4 py-3 text-left">Country</th>
                    <th className="px-4 py-3 text-right">Holdings</th>
                    <th className="px-4 py-3 text-right">Watchlist</th>
                    <th className="px-4 py-3 text-right">Events/7d</th>
                    <th className="px-4 py-3 text-right">Logins</th>
                    <th className="px-4 py-3 text-right">Last Login</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20">
                  {users?.users?.map((u) => (
                    <tr key={u.email} className="hover:bg-bg-primary/30">
                      <td className="px-4 py-2.5 font-mono text-text-primary truncate max-w-[200px]">{u.email}</td>
                      <td className="px-4 py-2.5 text-text-muted">{u.country || '—'}</td>
                      <td className="px-4 py-2.5 text-right font-bold text-accent-purple">{u.holdingsCount}</td>
                      <td className="px-4 py-2.5 text-right font-bold text-accent-teal">{u.watchlistCount}</td>
                      <td className="px-4 py-2.5 text-right font-mono text-text-muted">{u.eventsLast7d}</td>
                      <td className="px-4 py-2.5 text-right font-mono text-text-muted">{u.loginCount}</td>
                      <td className="px-4 py-2.5 text-right text-text-muted">
                        {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {users && users.total > pageSize && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-border/40 bg-bg-primary/30">
                <button
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="text-xs font-bold text-text-secondary hover:text-accent-blue disabled:opacity-30"
                >
                  ← Previous
                </button>
                <span className="text-[10px] text-text-muted font-mono">
                  {page * pageSize + 1}–{Math.min((page + 1) * pageSize, users.total)} of {users.total}
                </span>
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={(page + 1) * pageSize >= users.total}
                  className="text-xs font-bold text-text-secondary hover:text-accent-blue disabled:opacity-30"
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Admin;