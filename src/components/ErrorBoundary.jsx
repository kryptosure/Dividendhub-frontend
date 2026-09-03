import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[200px] p-6 bg-accent-red/10 border border-accent-red/20 rounded-xl">
          <div className="text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-bold text-accent-red">Something went wrong</h3>
          <p className="text-text-secondary text-sm mt-1 text-center max-w-md">
            {this.state.error?.message || 'An unexpected error occurred.'}
          </p>
          <button
            onClick={this.handleReset}
            className="mt-4 px-4 py-2 bg-accent-blue text-white rounded-full hover:bg-accent-teal transition"
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;