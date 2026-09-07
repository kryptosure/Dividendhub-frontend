import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { login } from '../services/api';
import useStore from '../store/useStore';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser, setToken, setPortfolio, setWatchlist } = useStore(); // Clean store selection

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) return setError('Please fill in all fields');
    
    setLoading(true);
    try {
      const data = await login(email, password);
      setToken(data.token);
      setUser({ email: data.email || email });
      setPortfolio(data.portfolio || []);
      setWatchlist(data.watchlist || []); // ✅ Directly set it from API
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet><title>Login – DividendBro</title></Helmet>
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-8 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-accent-blue/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="max-w-md w-full bg-bg-surface border border-border/60 rounded-2xl p-6 sm:p-8 shadow-card relative backdrop-blur-sm transition-all duration-300 hover:border-border">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black tracking-tight text-text-primary">Welcome <span className="bg-gradient-to-r from-accent-blue to-accent-teal bg-clip-text text-transparent">Back</span></h1>
            <p className="text-text-muted text-xs font-medium uppercase tracking-wider mt-1">Manage your active dividend cash flow</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* ... (Inputs and button same as before) ... */}
            <div>
              <label className="block text-[10px] uppercase text-text-muted font-bold tracking-widest mb-1.5">Email Address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-bg-primary/50 border border-border/60 rounded-xl px-4 py-3 text-sm text-text-primary placeholder-text-muted/40 transition-all focus:outline-none focus:bg-bg-primary focus:border-accent-blue focus:ring-4 focus:ring-accent-blue/5" placeholder="name@domain.com" required />
            </div>
            <div>
              <label className="block text-[10px] uppercase text-text-muted font-bold tracking-widest mb-1.5">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-bg-primary/50 border border-border/60 rounded-xl px-4 py-3 text-sm text-text-primary placeholder-text-muted/40 transition-all focus:outline-none focus:bg-bg-primary focus:border-accent-blue focus:ring-4 focus:ring-accent-blue/5" placeholder="••••••••" required minLength={6} />
            </div>
            {error && <div className="bg-accent-red/5 border border-accent-red/20 rounded-xl p-3.5 text-accent-red text-xs font-medium flex items-center gap-2"><span>⚠️</span> {error}</div>}
            <button type="submit" disabled={loading} className="w-full py-3 mt-2 bg-gradient-to-r from-accent-blue to-accent-teal hover:opacity-95 text-white font-bold rounded-xl shadow-md transition-all active:scale-[0.99] disabled:opacity-50 text-sm tracking-wide">
              {loading ? 'Verifying Account...' : 'Sign In'}
            </button>
            <p className="text-center text-text-muted text-xs font-medium pt-2">New to the platform? <Link to="/signup" className="text-accent-blue hover:text-accent-teal transition-colors font-semibold">Create Account</Link></p>
          </form>
        </div>
      </div>
    </>
  );
};

export default Login;