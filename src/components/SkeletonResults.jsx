import React from 'react';

const SkeletonResults = () => {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Header skeleton */}
      <div className="bg-bg-surface border border-border rounded-xl p-4 flex flex-wrap items-center gap-2">
        <div className="h-8 w-48 bg-bg-secondary rounded"></div>
        <div className="h-6 w-16 bg-bg-secondary rounded-full"></div>
        <div className="h-4 w-20 bg-bg-secondary rounded ml-auto"></div>
        <div className="h-8 w-32 bg-bg-secondary rounded-full"></div>
      </div>

      {/* KPI skeletons */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-bg-surface border border-border rounded-lg p-3">
            <div className="h-3 w-16 bg-bg-secondary rounded mb-1"></div>
            <div className="h-6 w-20 bg-bg-secondary rounded"></div>
            <div className="h-3 w-12 bg-bg-secondary rounded mt-1"></div>
          </div>
        ))}
      </div>

      {/* Chart skeleton */}
      <div className="bg-bg-surface border border-border rounded-xl p-4">
        <div className="h-6 w-40 bg-bg-secondary rounded mb-2"></div>
        <div className="h-48 bg-bg-secondary rounded"></div>
      </div>

      {/* Yearly breakdown skeleton */}
      <div className="bg-bg-surface border border-border rounded-xl p-4">
        <div className="h-6 w-48 bg-bg-secondary rounded mb-2"></div>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-4 w-12 bg-bg-secondary rounded"></div>
              <div className="h-4 flex-1 bg-bg-secondary rounded"></div>
              <div className="h-4 w-16 bg-bg-secondary rounded"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SkeletonResults;