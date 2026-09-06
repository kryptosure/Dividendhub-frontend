import React from 'react';

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Critical Core Exception Dump:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-bg-surface border border-border rounded-2xl p-6 text-center shadow-xl">
            <div className="text-5xl mb-3">💥</div>
            <h2 className="text-lg font-black text-text-primary tracking-tight">Ecosystem Kernel Collision</h2>
            <p className="text-text-muted text-xs font-semibold mt-1 leading-relaxed bg-bg-secondary/50 border border-border/40 p-3 rounded-xl font-mono text-left max-h-32 overflow-y-auto">
              {this.state.error?.message || 'State runtime environment broken.'}
            </p>
            <button onClick={() => window.location.reload()} className="w-full py-2.5 mt-4 bg-gradient-to-r from-accent-blue to-accent-teal text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md">
              Re-initialise Application
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default AppErrorBoundary;
