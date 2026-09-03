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
    console.error('App Error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-bg-surface border border-border rounded-xl p-8 text-center">
            <div className="text-6xl mb-4">💥</div>
            <h2 className="text-2xl font-bold text-accent-red mb-2">Something went wrong</h2>
            <p className="text-text-secondary text-sm mb-4">
              {this.state.error?.message || 'An unexpected error occurred. Please reload the page.'}
            </p>
            <button
              onClick={this.handleReset}
              className="px-6 py-2 bg-accent-blue text-white rounded-full hover:bg-accent-teal transition"
            >
              Reload App
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AppErrorBoundary;