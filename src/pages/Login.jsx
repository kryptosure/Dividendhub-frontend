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
  const { setUser, setToken, setPortfolio, syncPortfolio, portfolio } = useStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const data = await login(email, password);
      setToken(data.token);
      setUser({ email: data.email || email });

      const serverPortfolio = data.portfolio || [];
      if (portfolio.length > 0 && serverPortfolio.length === 0) {
        console.log('📤 Syncing local portfolio to server...');
        await syncPortfolio();
        setPortfolio(portfolio);
      } else {
        setPortfolio(serverPortfolio);
      }

      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Login – DividendHub</title>
        <meta name="description" content="Sign in to your DividendHub account to manage your dividend portfolio." />
      </Helmet>
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-bg-surface border border-border rounded-xl p-8 shadow-card">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold gradient-text">Welcome Back</h1>
            <p className="text-text-muted text-sm mt-1">Sign in to your DividendHub account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs uppercase text-text-muted font-semibold mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-xs uppercase text-text-muted font-semibold mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            {error && (
              <div className="bg-accent-red/10 border border-accent-red/20 rounded-lg p-3 text-accent-red text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-gradient-to-r from-accent-blue to-accent-teal text-white font-semibold rounded-full hover:shadow-lg transition disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            <p className="text-center text-text-muted text-sm">
              Don't have an account?{' '}
              <Link to="/signup" className="text-accent-blue hover:underline font-medium">
                Sign Up
              </Link>
            </p>
          </form>
        </div>
      </div>
    </>
  );
};

export default Login;