import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { signup } from '../services/api';
import useStore from '../store/useStore';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [country, setCountry] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser, setToken, setPortfolio } = useStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const data = await signup(email, password, country);
      setToken(data.token);
      setUser({ email });
      setPortfolio([]);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Sign Up – DividendHub</title>
        <meta name="description" content="Create a free DividendHub account to track your dividend portfolio and passive income." />
      </Helmet>
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-bg-surface border border-border rounded-xl p-8 shadow-card">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold gradient-text">Create Account</h1>
            <p className="text-text-muted text-sm mt-1">Start tracking dividends today</p>
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
                Country (optional)
              </label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full bg-bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue"
                placeholder="e.g. Singapore"
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
                placeholder="Min 6 characters"
                required
                minLength={6}
              />
            </div>

            <div>
              <label className="block text-xs uppercase text-text-muted font-semibold mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue"
                placeholder="••••••••"
                required
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
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>

            <p className="text-center text-text-muted text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-accent-blue hover:underline font-medium">
                Sign In
              </Link>
            </p>
          </form>
        </div>
      </div>
    </>
  );
};

export default Signup;