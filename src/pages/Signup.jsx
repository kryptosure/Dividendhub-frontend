import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

/* Google "G" logo */
const GoogleIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
    <path fill="#4CAF50" d="M24 44c5.5 0 10.4-2.1 14.1-5.5l-6.5-5.5c-2 1.5-4.7 2.5-7.6 2.5-5.3 0-9.7-3.4-11.3-8l-6.5 5C9.6 39.6 16.2 44 24 44z" />
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.5l6.5 5.5C41.4 35.5 44 30.2 44 24c0-1.3-.1-2.4-.4-3.5z" />
  </svg>
);

const Signup = () => {
  const handleGoogleSignup = () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    window.location.href = `${apiUrl}/api/auth/google`;
  };

  return (
    <>
      <Helmet>
        <title>Sign Up – DividendBro</title>
        <meta name="description" content="Create a free DividendBro account to track your dividend portfolio and passive income." />
      </Helmet>

      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-accent-blue/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-md w-full bg-bg-surface border border-border/60 rounded-2xl p-6 sm:p-8 shadow-card relative backdrop-blur-sm transition-all duration-300 hover:border-border">

          <div className="text-center mb-8">
            <h1 className="text-3xl font-black tracking-tight text-text-primary">
              Get <span className="bg-gradient-to-r from-accent-blue to-accent-teal bg-clip-text text-transparent">Started</span>
            </h1>
            <p className="text-text-muted text-xs font-medium uppercase tracking-wider mt-1">
              Free forever · No credit card
            </p>
          </div>

          <button
            onClick={handleGoogleSignup}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-bg-primary/50 border border-border/60 hover:bg-bg-primary hover:border-border text-text-primary text-sm font-bold transition-all active:scale-[0.99]"
          >
            <GoogleIcon size={18} />
            Continue with Google
          </button>

          <p className="text-center text-text-muted text-[11px] font-medium mt-6 leading-relaxed">
            By continuing, you agree to DividendBro's terms of use.<br />
            We only use your Google email to identify your account.
          </p>

          <p className="text-center text-text-muted text-xs font-medium pt-6 border-t border-border/30 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-accent-blue hover:text-accent-teal transition-colors font-semibold">
              Sign in
            </Link>
          </p>

        </div>
      </div>
    </>
  );
};

export default Signup;