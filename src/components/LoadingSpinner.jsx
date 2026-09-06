import React from 'react';

const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-12">
    <div className="animate-spin rounded-full h-8 w-8 border-2 border-accent-blue border-t-transparent shadow-sm" />
  </div>
);

export default LoadingSpinner;
