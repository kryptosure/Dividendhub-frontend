// Replacement for src/pages/Blog.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { articles } from '../data/articles.jsx';

const Blog = () => {
  return (
    <>
      <Helmet>
        <title>Dividend Investing Blog – DividendBro</title>
        <meta name="description" content="Read articles on dividend investing, stock picks, portfolio building, and more." />
      </Helmet>

      <div className="max-w-5xl mx-auto px-4 sm:px-0">
        <div className="mb-10 text-left sm:text-center max-w-2xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-text-primary">
            🧠 The <span className="bg-gradient-to-r from-accent-blue to-accent-teal bg-clip-text text-transparent">Dividend Academy</span>
          </h1>
          <p className="text-text-secondary text-sm mt-2 font-medium">
            No jargon. Just practical strategies, analytics, and framework updates to scale your passive cash flow.
          </p>
        </div>

        {/* Upgraded from a generic stack to a premium responsive grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {articles.map((article) => (
            <article
              key={article.slug}
              className="bg-bg-surface border border-border/50 rounded-2xl p-5 hover:border-border transition-all duration-300 flex flex-col justify-between group hover:shadow-card"
            >
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl bg-bg-secondary p-2 rounded-xl border border-border/40 group-hover:scale-110 transition-transform duration-300">
                    {article.image}
                  </span>
                  <span className="text-[10px] font-bold tracking-widest uppercase text-accent-teal bg-accent-teal/5 border border-accent-teal/10 px-2.5 py-1 rounded-md">
                    {article.category}
                  </span>
                  <span className="text-[11px] font-medium text-text-muted ml-auto">{article.date}</span>
                </div>
                
                <Link to={`/blog/${article.slug}`}>
                  <h2 className="text-lg font-bold text-text-primary hover:text-accent-blue transition-colors leading-snug">
                    {article.title}
                  </h2>
                </Link>
                <p className="text-text-muted text-xs font-medium leading-relaxed mt-2 line-clamp-2">
                  {article.excerpt}
                </p>
              </div>

              <div className="flex items-center justify-between mt-5 pt-3 border-t border-border/30 text-xs font-semibold">
                <span className="text-text-muted flex items-center gap-1">⏱ {article.readTime}</span>
                <Link
                  to={`/blog/${article.slug}`}
                  className="text-accent-blue group-hover:text-accent-teal transition-colors flex items-center gap-1"
                >
                  Read Post <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </>
  );
};

export default Blog;
