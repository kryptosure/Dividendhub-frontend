import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { insights } from '../content/insights';

const Insight = () => {
  const { slug } = useParams();
  const insight = insights.find(i => i.slug === slug);

  if (!insight) return <Navigate to="/insights" replace />;

  return (
    <>
      <Helmet>
        <title>{insight.title} — DividendBro Insights</title>
        <meta name="description" content={insight.excerpt} />
      </Helmet>

      <article className="max-w-3xl mx-auto py-10 px-4">
        <Link to="/insights" className="text-xs text-text-muted hover:text-accent-blue font-bold">
          ← All Insights
        </Link>

        <div className="mt-6 mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] uppercase font-bold tracking-wider text-accent-blue bg-accent-blue/10 px-2 py-0.5 rounded">
              {insight.category}
            </span>
            <span className="text-[11px] text-text-muted font-medium">
              {new Date(insight.date).toLocaleDateString('en-SG', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tight leading-tight mb-3">
            {insight.title}
          </h1>
          <p className="text-text-secondary text-base">{insight.excerpt}</p>
        </div>

        <div
          className="article-body"
          dangerouslySetInnerHTML={{ __html: insight.content }}
        />

        <div className="mt-12 pt-8 border-t border-border/40">
          <div className="text-xs text-text-muted">
            <strong className="text-text-secondary">Educational content only.</strong> Not investment advice. Always do your own research.
          </div>
        </div>
      </article>
    </>
  );
};

export default Insight;