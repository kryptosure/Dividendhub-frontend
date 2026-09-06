import React from 'react';

const SkeletonResults = () => {
  return (
    <div className="space-y-4 animate-pulse px-4 sm:px-0">
      <div className="bg-bg-surface/60 border border-border/40 rounded-2xl p-5 flex items-center gap-3">
        <div className="h-7 w-48 bg-bg-secondary rounded-lg" />
        <div className="h-5 w-16 bg-bg-secondary rounded-md" />
        <div className="h-5 w-24 bg-bg-secondary rounded-md ml-auto" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-bg-surface/60 border border-border/40 rounded-xl p-4">
            <div className="h-3 w-14 bg-bg-secondary rounded mb-2" />
            <div className="h-6 w-20 bg-bg-secondary rounded-md" />
          </div>
        ))}
      </div>

      <div className="bg-bg-surface/60 border border-border/40 rounded-2xl p-5">
        <div className="h-5 w-32 bg-bg-secondary rounded-md mb-4" />
        <div className="h-48 bg-bg-secondary/40 rounded-xl" />
      </div>
    </div>
  );
};

export default SkeletonResults;
