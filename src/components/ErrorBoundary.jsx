import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center py-10 px-4 bg-accent-red/5 border border-accent-red/20 rounded-2xl max-w-xl mx-auto text-center">
          <div className="text-3xl mb-2">⚠️</div>
          <h3 className="text-sm font-bold text-accent-red uppercase tracking-wider">Sub-module Failure</h3>
          <p className="text-text-muted text-xs font-medium mt-1 font-mono">{this.state.error?.message || 'Component layer broken.'}</p>
          <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-bg-surface border border-border/60 text-text-secondary font-bold text-xs rounded-xl shadow-sm">Reload Page Frame</button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
