import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { articles } from '../data/articles.jsx';  // ← changed extension

const Article = () => {
  const { slug } = useParams();
  const article = articles.find(a => a.slug === slug);

  if (!article) {
    return (
      <div className="text-center py-12">
        <p className="text-text-muted">Article not found.</p>
        <Link to="/blog" className="text-accent-blue hover:underline">← Back to Blog</Link>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{article.title} – DividendBro</title>
        <meta name="description" content={article.excerpt} />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.excerpt} />
      </Helmet>

      <article className="max-w-3xl mx-auto">
        <Link to="/blog" className="text-accent-blue hover:underline text-sm mb-4 inline-block">
          ← Back to Blog
        </Link>

        <div className="bg-bg-surface border border-border rounded-xl p-6 md:p-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">{article.image}</span>
            <span className="text-xs text-text-muted bg-bg-secondary px-2 py-0.5 rounded-full">
              {article.category}
            </span>
            <span className="text-xs text-text-muted ml-auto">{article.date}</span>
          </div>

          <h1 className="text-3xl font-extrabold gradient-text mb-2">{article.title}</h1>
          <p className="text-text-secondary text-sm mb-4">⏱ {article.readTime}</p>

          <div className="prose prose-invert max-w-none text-text-primary leading-relaxed">
            {article.content('$')}
          </div>

          <div className="mt-8 pt-4 border-t border-border text-center">
            <p className="text-text-muted text-sm">
              🚀 Explore more on <Link to="/" className="text-accent-blue hover:underline">DividendBro</Link>
            </p>
          </div>
        </div>
      </article>
    </>
  );
};

export default Article;