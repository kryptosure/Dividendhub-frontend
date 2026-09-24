import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { login, getMe } from '../services/api';
import useStore from '../store/useStore';

/* Google "G" logo */
const GoogleIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
    <path fill="#4CAF50" d="M24 44c5.5 0 10.4-2.1 14.1-5.5l-6.5-5.5c-2 1.5-4.7 2.5-7.6 2.5-5.3 0-9.7-3.4-11.3-8l-6.5 5C9.6 39.6 16.2 44 24 44z" />
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.5l6.5 5.5C41.4 35.5 44 30.2 44 24c0-1.3-.1-2.4-.4-3.5z" />
  </svg>
);

const Login = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser, setToken, setPortfolio, setWatchlist } = useStore();

  // --- Google callback state ---
  const [callbackError, setCallbackError] = useState('');
  const [callbackLoading, setCallbackLoading] = useState(false);

  // --- Legacy email form state (collapsed by default) ---
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  /* ----------------------------------------------------------------
     Handle ?token=... and ?error=google_failed from backend redirect
     ---------------------------------------------------------------- */
  useEffect(() => {
    const token = searchParams.get('token');
    const err = searchParams.get('error');

    if (err === 'google_failed') {
      setCallbackError('Google sign-in failed. Please try again.');
      return;
    }

    if (!token) return;

    const finishGoogleLogin = async () => {
      setCallbackLoading(true);
      try {
        setToken(token);                    // persists to localStorage
        const userData = await getMe();     // fetch fresh user data
        setUser({ email: userData.email, isAdmin: userData.isAdmin });
        setPortfolio(userData.portfolio || []);
        setWatchlist(userData.watchlist || []);
        navigate('/', { replace: true });   // strip ?token from history
      } catch (e) {
        setCallbackError('Could not complete sign-in. Please try again.');
        setCallbackLoading(false);
      }
    };

    finishGoogleLogin();
  }, [searchParams, setToken, setUser, setPortfolio, setWatchlist, navigate]);

  const handleGoogleLogin = () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    window.location.href = `${apiUrl}/api/auth/google`;
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) return setError('Please fill in all fields');

    setLoading(true);
    try {
      const data = await login(email, password);
      setToken(data.token);
      setUser({ email: data.email || email, isAdmin: data.isAdmin });
      setPortfolio(data.portfolio || []);
      setWatchlist(data.watchlist || []);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /* Loading state while we exchange the Google token */
  if (callbackLoading) {
    return (
      <>
        <Helmet><title>Signing in… – DividendBro</title></Helmet>
        <div className="min-h-[75vh] flex items-center justify-center px-4">
          <div className="text-center">
            <div className="w-10 h-10 border-3 border-accent-blue border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm font-semibold text-text-secondary">Completing sign-in…</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet><title>Sign In – DividendBro</title></Helmet>
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-8 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-accent-blue/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-md w-full bg-bg-surface border border-border/60 rounded-2xl p-6 sm:p-8 shadow-card relative backdrop-blur-sm transition-all duration-300 hover:border-border">

          <div className="text-center mb-8">
            <h1 className="text-3xl font-black tracking-tight text-text-primary">
              Welcome <span className="bg-gradient-to-r from-accent-blue to-accent-teal bg-clip-text text-transparent">Back</span>
            </h1>
            <p className="text-text-muted text-xs font-medium uppercase tracking-wider mt-1">
              Manage your active dividend cash flow
            </p>
          </div>

          {callbackError && (
            <div className="mb-4 bg-accent-red/5 border border-accent-red/20 rounded-xl p-3.5 text-accent-red text-xs font-medium flex items-center gap-2">
              <span>⚠️</span> {callbackError}
            </div>
          )}

          {/* Primary: Google */}
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-bg-primary/50 border border-border/60 hover:bg-bg-primary hover:border-border text-text-primary text-sm font-bold transition-all active:scale-[0.99]"
          >
            <GoogleIcon size={18} />
            Continue with Google
          </button>

          {/* Legacy email fallback — collapsed by default */}
          <div className="mt-6">
            <button
              type="button"
              onClick={() => setShowEmailForm((v) => !v)}
              className="w-full text-center text-[11px] font-semibold text-text-muted hover:text-accent-blue transition-colors"
            >
              {showEmailForm ? 'Hide email sign-in' : 'Sign in with email instead'}
            </button>

            {showEmailForm && (
              <form onSubmit={handleEmailSubmit} className="mt-4 space-y-4 border-t border-border/30 pt-4">
                <div>
                  <label className="block text-[10px] uppercase text-text-muted font-bold tracking-widest mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-bg-primary/50 border border-border/60 rounded-xl px-4 py-3 text-sm text-text-primary placeholder-text-muted/40 transition-all focus:outline-none focus:bg-bg-primary focus:border-accent-blue focus:ring-4 focus:ring-accent-blue/5"
                    placeholder="name@domain.com"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-text-muted font-bold tracking-widest mb-1.5">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-bg-primary/50 border border-border/60 rounded-xl px-4 py-3 text-sm text-text-primary placeholder-text-muted/40 transition-all focus:outline-none focus:bg-bg-primary focus:border-accent-blue focus:ring-4 focus:ring-accent-blue/5"
                    placeholder="••••••••"
                  />
                </div>
                {error && (
                  <div className="bg-accent-red/5 border border-accent-red/20 rounded-xl p-3.5 text-accent-red text-xs font-medium flex items-center gap-2">
                    <span>⚠️</span> {error}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-gradient-to-r from-accent-blue to-accent-teal hover:opacity-95 text-white font-bold rounded-xl shadow-md transition-all active:scale-[0.99] disabled:opacity-50 text-sm tracking-wide"
                >
                  {loading ? 'Verifying Account...' : 'Sign In'}
                </button>
              </form>
            )}
          </div>

          <p className="text-center text-text-muted text-xs font-medium pt-6">
            New here?{' '}
            <Link to="/signup" className="text-accent-blue hover:text-accent-teal transition-colors font-semibold">
              Create an account
            </Link>
          </p>

        </div>
      </div>
    </>
  );
};

export default Login;