import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import useStore from '../store/useStore';
import {
  Search,
  TrendingUp,
  SlidersHorizontal,
  CalendarDays,
  Scale,
  Star,
  Briefcase,
  Calculator,
  BookOpen,
  Sparkles,
  LogIn,
  LogOut,
  User as UserIcon,
  Zap,
  CalendarClock,
  CalendarRange,
  Building2,
  ChevronDown,
  Coins,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Google "G" logo                                                    */
/* ------------------------------------------------------------------ */
const GoogleIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true" className="flex-shrink-0">
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
    <path fill="#4CAF50" d="M24 44c5.5 0 10.4-2.1 14.1-5.5l-6.5-5.5c-2 1.5-4.7 2.5-7.6 2.5-5.3 0-9.7-3.4-11.3-8l-6.5 5C9.6 39.6 16.2 44 24 44z" />
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.5l6.5 5.5C41.4 35.5 44 30.2 44 24c0-1.3-.1-2.4-.4-3.5z" />
  </svg>
);

/* ------------------------------------------------------------------ */
/*  Section wrapper                                                    */
/* ------------------------------------------------------------------ */
const Section = ({ label, children }) => (
  <div className="px-2 pt-3 first:pt-1">
    {label && (
      <div className="px-2 mb-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-text-muted/80">
        {label}
      </div>
    )}
    <div className="space-y-0.5">{children}</div>
  </div>
);

/* ------------------------------------------------------------------ */
/*  Nav link                                                           */
/* ------------------------------------------------------------------ */
const NavLink = ({ to, icon: Icon, label, exact = false }) => {
  const location = useLocation();
  const isActive = exact
    ? location.pathname === to
    : location.pathname === to ||
      (to !== '/' && location.pathname.startsWith(to + '/'));

  return (
    <Link
      to={to}
      className={`group relative flex items-center gap-3 px-3 py-[7px] rounded-lg text-[13px] transition-all duration-150 ${
        isActive
          ? 'bg-accent-blue/10 text-accent-blue font-semibold'
          : 'text-text-secondary font-medium hover:bg-bg-surface-hover hover:text-text-primary'
      }`}
    >
      {isActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-r-full bg-accent-blue" />
      )}
      <Icon
        size={15}
        strokeWidth={isActive ? 2.5 : 2}
        className={`flex-shrink-0 transition-transform duration-150 group-hover:scale-105 ${
          isActive ? '' : 'text-text-muted group-hover:text-text-secondary'
        }`}
      />
      <span className="truncate">{label}</span>
    </Link>
  );
};

/* ------------------------------------------------------------------ */
/*  Simulations accordion                                              */
/* ------------------------------------------------------------------ */
const SimulatorAccordion = () => {
  const location = useLocation();
  const isAnyActive =
    location.pathname.startsWith('/simulate') ||
    location.pathname === '/millionaire';

  const [open, setOpen] = useState(isAnyActive);

  useEffect(() => {
    if (isAnyActive) setOpen(true);
  }, [isAnyActive]);

  const subItem = (to, label) => {
    const active = location.pathname === to;
    return (
      <Link
        to={to}
        className={`block px-3 py-1 rounded-md text-[12px] transition-colors ${
          active
            ? 'text-accent-blue bg-accent-blue/5 font-semibold'
            : 'text-text-muted font-medium hover:text-text-primary hover:bg-bg-surface-hover'
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className={`group relative w-full flex items-center gap-3 px-3 py-[7px] rounded-lg text-[13px] transition-all duration-150 ${
          isAnyActive
            ? 'bg-accent-blue/10 text-accent-blue font-semibold'
            : 'text-text-secondary font-medium hover:bg-bg-surface-hover hover:text-text-primary'
        }`}
      >
        {isAnyActive && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-r-full bg-accent-blue" />
        )}
        <Calculator
          size={15}
          strokeWidth={isAnyActive ? 2.5 : 2}
          className={`flex-shrink-0 transition-transform duration-150 group-hover:scale-105 ${
            isAnyActive ? '' : 'text-text-muted group-hover:text-text-secondary'
          }`}
        />
        <span className="flex-1 text-left truncate">Simulations</span>
        <ChevronDown
          size={13}
          strokeWidth={2.5}
          className={`flex-shrink-0 transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          } text-text-muted`}
        />
      </button>

      {open && (
        <div className="mt-1 ml-[26px] pl-3 border-l border-border/40 space-y-0.5">
          {subItem('/simulate/one-time', 'Single Purchase')}
          {subItem('/simulate/dca', 'Periodic (DCA)')}
          {subItem('/millionaire', 'Millionaire')}
        </div>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Sidebar                                                            */
/* ------------------------------------------------------------------ */
const Sidebar = () => {
  const { token, user, isAdmin, logout } = useStore();
  const displayName = user?.email || 'User';

  const handleGoogleLogin = () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    window.location.href = `${apiUrl}/api/auth/google`;
  };

  return (
    <aside className="hidden lg:flex flex-col w-56 h-screen sticky top-0 bg-bg-secondary border-r border-border/50 z-30 flex-shrink-0">

      {/* Logo */}
      <Link
        to="/"
        className="flex items-center justify-center px-4 py-5 border-b border-border/30 flex-shrink-0 active:scale-[0.98] transition-transform"
      >
        <img
          src="/images/logo.svg"
          alt="DividendBro"
          width="160"
          height="56"
          className="h-14 w-auto object-contain"
        />
      </Link>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto pb-2">

        <Section label="Discover">
          <NavLink to="/search"   icon={Search}            label="Search Stocks" />
          <NavLink to="/top"      icon={TrendingUp}        label="Top Stocks" />
          <NavLink to="/screener" icon={SlidersHorizontal} label="Screener" />
          <NavLink to="/calendar" icon={CalendarDays}      label="Calendar" />
          <NavLink to="/compare"  icon={Scale}             label="Compare" />
        </Section>

        <Section label="Payout Frequency">
          <NavLink to="/daily-dividend-stocks"   icon={Zap}           label="Daily Dividend Stocks" />
          <NavLink to="/weekly-dividend-etfs"    icon={CalendarClock} label="Weekly Dividend ETFs" />
          <NavLink to="/monthly-dividend-stocks" icon={CalendarRange} label="Monthly Dividend Stocks" />
          <NavLink to="/reits-that-pay-monthly"  icon={Building2}     label="Monthly REITs" />
        </Section>

        <Section label="My Portfolio">
          <NavLink to="/watchlist" icon={Star}      label="Watchlist" />
          <NavLink to="/portfolio" icon={Briefcase} label="Portfolio" />
        </Section>

        <Section label="Tools">
          <NavLink to="/" icon={Coins} label="Monthly Income Planner" exact />
          <SimulatorAccordion />
        </Section>

        <Section label="Learn">
          <NavLink to="/blog" icon={BookOpen} label="Insights" />
        </Section>

      </nav>

      {/* Ask AI */}
      <div className="px-2 pb-2 flex-shrink-0">
        <a
          href="https://ai.dividendbro.com"
          className="group flex items-center gap-3 px-3 py-2 rounded-lg bg-gradient-to-r from-accent-blue/12 to-accent-blue/5 border border-accent-blue/25 text-accent-blue font-bold text-[13px] hover:from-accent-blue/18 hover:to-accent-blue/8 hover:border-accent-blue/40 transition-all duration-150"
        >
          <Sparkles
            size={15}
            strokeWidth={2.25}
            className="flex-shrink-0 transition-transform duration-200 group-hover:rotate-12"
          />
          <span className="flex-1">Ask AI</span>
          <span className="text-[10px] font-black tracking-widest opacity-70">NEW</span>
        </a>
      </div>

      {/* Auth */}
      <div className="border-t border-border/30 p-3 flex-shrink-0">
        {token ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg bg-bg-surface/60 border border-border/40">
              <div className="w-6 h-6 rounded-full bg-accent-blue/15 text-accent-blue flex items-center justify-center flex-shrink-0">
                <UserIcon size={12} strokeWidth={2.5} />
              </div>
              <span className="text-[12px] font-semibold text-text-secondary truncate">
                {displayName.split('@')[0]}
              </span>
            </div>

            {isAdmin && (
              <Link
                to="/admin"
                className="block px-2.5 py-1.5 rounded-md bg-accent-purple/10 border border-accent-purple/30 text-accent-purple text-[11px] font-bold text-center hover:bg-accent-purple/20 transition-colors"
              >
                Admin Dashboard
              </Link>
            )}

            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-md bg-accent-red/10 border border-accent-red/20 text-accent-red text-[12px] font-bold hover:bg-accent-red/20 transition-colors"
            >
              <LogOut size={12} strokeWidth={2.5} />
              Sign out
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Option 1 — Continue with Google (secondary) */}
            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-bg-surface border border-border/50 text-text-primary text-[12px] font-bold hover:bg-bg-surface-hover hover:border-border-hover active:scale-95 transition-all"
            >
              <GoogleIcon size={14} />
              Continue with Google
            </button>

            {/* Option 2 — Login with Email (primary) */}
            <Link
              to="/login"
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-accent-blue text-white text-[12px] font-bold glow-accent hover:bg-accent-blue active:scale-95 transition-all"
            >
              <LogIn size={12} strokeWidth={2.5} />
              Login with Email
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;