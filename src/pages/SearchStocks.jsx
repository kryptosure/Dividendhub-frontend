import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import SearchBar from '../components/SearchBar';
import Results from '../components/Results';

const SITE_URL = "https://dividendbro.com";

const SearchStocks = () => {
  const [searchParams] = useSearchParams();
  const symbol = searchParams.get('symbol') || '';

  const pageTitle = symbol
    ? `${symbol} Dividend History – Yield, Ex-Dates & Risk Assessment`
    : 'Search Dividend Stocks – US & SGX | DividendBro';

  const pageDescription = symbol
    ? `View complete payout histories, current yields metrics, capital safety scores, and ex-dividend dates for ${symbol}.`
    : 'Search and analyze dividend stocks for US and SGX markets.';

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={`${SITE_URL}/search`} />
      </Helmet>

      <div className="text-center mb-10 max-w-2xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-text-primary leading-tight">
          Smart Dividend Tracking <br />
          For <span className="bg-gradient-to-r from-accent-blue to-accent-teal bg-clip-text text-transparent">Modern Investors</span>
        </h1>
        <p className="text-text-secondary text-sm mt-3 font-medium">
          Analyse cash flows, calculate asset growth caps, and track passive dividend revenue across US and SGX channels seamlessly.
        </p>
        <div className="flex flex-wrap justify-center gap-1.5 mt-4 text-[10px] font-bold uppercase tracking-wider">
          <span className="bg-accent-blue/5 text-accent-blue px-3 py-1 rounded-md border border-accent-blue/10">US Equities</span>
          <span className="bg-accent-teal/5 text-accent-teal px-3 py-1 rounded-md border border-accent-teal/10">SGX Stocks</span>
          <span className="bg-accent-purple/5 text-accent-purple px-3 py-1 rounded-md border border-accent-purple/10">REITs</span>
        </div>
      </div>

      <SearchBar />
      <Results symbol={symbol} />
    </>
  );
};

export default SearchStocks;