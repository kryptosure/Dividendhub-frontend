import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { articles } from '../content/articles';

const Article = () => {
  const { slug } = useParams();
  const article = articles.find((a) => a.slug === slug);

  if (!article) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-black">Article Not Found</h1>
        <Link to="/blog" className="text-accent-blue hover:underline mt-4 block">Back to Academy</Link>
      </div>
    );
  }

  // ✅ Build the JSON-LD Schema for this specific article
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://dividendbro.com/blog/${article.slug}`
    },
    "headline": article.title,
    "description": article.excerpt,
    "image": article.image ? `https://dividendbro.com${article.image}` : `https://dividendbro.com/images/cover.png`,
    "author": {
      "@type": "Organization",
      "name": "DividendBro",
      "url": "https://dividendbro.com"
    },
    "publisher": {
      "@type": "Organization",
      "name": "DividendBro",
      "logo": {
        "@type": "ImageObject",
        "url": "https://dividendbro.com/images/android-chrome-512x512.png"
      }
    },
    "datePublished": article.date,
    "dateModified": article.date
  };

  return (
    <>
      <Helmet>
        <title>{article.title} – DividendBro</title>
        <meta name="description" content={article.excerpt} />
        <link rel="canonical" href={`https://dividendbro.com/blog/${article.slug}`} />
        
        {/* ✅ Inject the JSON-LD Schema */}
        <script type="application/ld+json">
          {JSON.stringify(schemaData)}
        </script>
      </Helmet>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-accent-teal">{article.category}</span>
          <h1 className="text-4xl font-black tracking-tight text-text-primary mt-2">{article.title}</h1>
          <div className="text-sm text-text-muted mt-4">{article.date}</div>
        </div>
        
        <div className="prose prose-invert max-w-none text-text-secondary leading-relaxed" dangerouslySetInnerHTML={{ __html: article.content }} />
      </div>
    </>
  );
};

export default Article;