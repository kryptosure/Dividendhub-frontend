import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { articles } from '../content/articles.js';

const Blog = () => {
  return (
    <>
      <Helmet>
        <title>Financial Academy – DividendBro</title>
        <meta name="description" content="Learn dividend investing strategies and passive income tips." />
      </Helmet>
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-black tracking-tight text-text-primary">Financial Academy</h1>
          <p className="text-text-muted mt-2 text-sm">Insights, strategies, and guides for the modern dividend investor.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map(article => (
            <Link key={article.slug} to={`/blog/${article.slug}`} className="group flex">
              <div className="bg-bg-surface border border-border/50 rounded-2xl overflow-hidden shadow-sm flex flex-col w-full hover:border-accent-blue/50 hover:shadow-lg transition-all duration-300">
                {/* Cover Image */}
                <div className="aspect-video w-full overflow-hidden bg-bg-primary">
                  <img 
                    src={article.image} 
                    alt={article.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                
                <div className="p-5 flex flex-col flex-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-accent-teal">{article.category}</span>
                  <h2 className="text-lg font-black text-text-primary mt-2 leading-snug group-hover:text-accent-blue transition-colors line-clamp-2">
                    {article.title}
                  </h2>
                  <p className="text-sm text-text-muted mt-3 line-clamp-3 flex-1">{article.excerpt}</p>
                  
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border/30 text-xs font-semibold text-text-muted">
                    <span>{article.date}</span>
                    <span className="w-1 h-1 rounded-full bg-text-muted/50" />
                    <span>{article.author || 'DividendBro'}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
};

export default Blog;