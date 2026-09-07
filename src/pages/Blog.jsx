import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

// Load all markdown files from the folder
const markdownFiles = import.meta.glob('../content/markdown/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
});

const articles = Object.entries(markdownFiles).map(([path, content]) => {
  // Extract metadata from the frontmatter
  const meta = content.match(/---([\s\S]*?)---/);
  const metaObj = {};
  if (meta) {
    meta[1].split('\n').forEach(line => {
      const [key, ...value] = line.split(':');
      metaObj[key.trim()] = value.join(':').trim().replace(/"/g, '');
    });
  }
  
  // Extract slug from path (e.g., ../content/markdown/my-first-article.md -> my-first-article)
  const slug = path.split('/').pop().replace('.md', '');
  
  return {
    slug,
    ...metaObj,
    content,
  };
}).sort((a, b) => new Date(b.date) - new Date(a.date));

const Blog = () => {
  return (
    <>
      <Helmet>
        <title>Financial Academy – DividendBro</title>
        <meta name="description" content="Learn dividend investing strategies, passive income tips, and market analysis." />
      </Helmet>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-black tracking-tight text-text-primary mb-6">Financial Academy</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map(article => (
            <Link key={article.slug} to={`/blog/${article.slug}`} className="group">
              <div className="bg-bg-surface border border-border/50 rounded-2xl p-4 shadow-sm h-full flex flex-col justify-between hover:border-accent-blue/50 transition-all">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-accent-teal">{article.category}</span>
                  <h2 className="text-lg font-black text-text-primary mt-2 group-hover:text-accent-blue transition-colors">{article.title}</h2>
                  <p className="text-sm text-text-muted mt-2">{article.excerpt}</p>
                </div>
                <div className="mt-4 text-xs font-semibold text-text-muted">{article.date}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
};

export default Blog;