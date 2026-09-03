import React, { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getStock } from '../services/api';
import { handleApiError } from '../services/api';
import KPIList from './KPIList';
import DividendChart from './DividendChart';
import YearBreakdown from './YearBreakdown';  // instead of YearlyChart

const Results = ({ symbol, market = 'us' }) => {
  const resultsRef = useRef(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['stock', symbol, market],
    queryFn: () => getStock(symbol, market),
    enabled: !!symbol,
    retry: 1,
  });

  // Auto-scroll to results when data loads
  useEffect(() => {
    if (data && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [data]);

  if (!symbol) {
    return (
      <div className="text-center py-12 text-text-secondary">
        <p className="text-lg">Search for a stock above to see its full dividend history.</p>
        <p className="text-sm mt-2">Try AAPL, MSFT, VZ, or D05.SI</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-blue"></div>
      </div>
    );
  }

  if (error) {
    const err = handleApiError(error);
    return (
      <div className="text-center py-12 text-accent-red">
        <p className="text-lg">⚠️ {err.message}</p>
        <button
          onClick={() => refetch()}
          className="mt-4 px-6 py-2 bg-accent-blue text-white rounded-lg hover:bg-accent-blue/80 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div ref={resultsRef} id="results-section" className="mt-6 space-y-6">
      <KPIList data={data} />
      <DividendChart data={data} />
      <YearBreakdown data={data} />  {/* replaced YearlyChart */}
      {/* DividendTable and SafetyScore are missing – we'll add them later */}
      {/* <DividendTable data={data} /> */}
      {/* <SafetyScore score={data.safetyScore} /> */}
    </div>
  );
};

export default Results;