import React from 'react';

const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-12">
    <div className="animate-spin rounded-full h-8 w-8 border-4 border-accent-blue border-t-transparent"></div>
  </div>
);

export default LoadingSpinner;