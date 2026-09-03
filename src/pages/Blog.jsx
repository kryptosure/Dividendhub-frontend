import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { articles } from '../data/articles.jsx';  // ← changed extension

const Blog = () => {
  return (
    <>
      <Helmet>
        <title>Dividend Investing Blog – DividendHub</title>
        <meta name="description" content="Read articles on dividend investing, stock picks, portfolio building, and more." />
      </Helmet>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-extrabold gradient-text mb-2">📝 Dividend Investing Blog</h1>
        <p className="text-text-muted mb-8">
          Practical insights, stock analysis, and portfolio strategies to help you build passive income.
        </p>

        <div className="grid gap-6">
          {articles.map((article) => (
            <article
              key={article.slug}
              className="bg-bg-surface border border-border rounded-xl p-6 hover:shadow-card-hover transition"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{article.image}</span>
                <span className="text-xs text-text-muted bg-bg-secondary px-2 py-0.5 rounded-full">
                  {article.category}
                </span>
                <span className="text-xs text-text-muted ml-auto">{article.date}</span>
              </div>
              <Link to={`/blog/${article.slug}`}>
                <h2 className="text-xl font-bold hover:text-accent-teal transition">
                  {article.title}
                </h2>
              </Link>
              <p className="text-text-secondary text-sm mt-1">{article.excerpt}</p>
              <div className="flex items-center gap-4 mt-3 text-xs text-text-muted">
                <span>⏱ {article.readTime}</span>
                <Link
                  to={`/blog/${article.slug}`}
                  className="text-accent-blue hover:underline font-medium"
                >
                  Read More →
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