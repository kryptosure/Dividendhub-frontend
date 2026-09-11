import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { articles } from '../content/articles/index.js';

// Helper: Convert image path to WebP variant
const toWebp = (imagePath) => imagePath.replace(/\.(jpg|jpeg|png)$/i, '.webp');

const Article = () => {
  const { slug } = useParams();
  const article = articles.find(a => a.slug === slug);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [heroLoaded, setHeroLoaded] = useState(false);

  // Reading progress bar
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(progress);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!article) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-black">Article Not Found</h1>
        <Link to="/blog" className="text-accent-blue hover:underline mt-4 block">Back to Academy</Link>
      </div>
    );
  }

  // Reading time
  const wordCount = article.content.replace(/<[^>]*>/g, '').split(/\s+/).length;
  const readingTime = Math.max(1, Math.round(wordCount / 200));

  // Related articles (same category, exclude current, limit 2)
  const related = articles
    .filter(a => a.slug !== slug && a.category === article.category)
    .slice(0, 2);

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": article.title,
    "description": article.excerpt,
    "image": `https://dividendbro.com${article.image}`,
    "datePublished": article.date,
    "dateModified": article.date,
    "author": { "@type": "Organization", "name": article.author || "DividendBro" },
    "publisher": {
      "@type": "Organization",
      "name": "DividendBro",
      "logo": { "@type": "ImageObject", "url": "https://dividendbro.com/images/android-chrome-512x512.png" }
    }
  };

  return (
    <>
      <Helmet>
        <title>{article.title} – DividendBro</title>
        <meta name="description" content={article.excerpt} />
        <link rel="canonical" href={`https://dividendbro.com/blog/${slug}`} />
        <script type="application/ld+json">{JSON.stringify(schemaData)}</script>
      </Helmet>

      {/* Reading Progress Bar */}
      <div
        className="fixed top-0 left-0 h-1 bg-gradient-to-r from-accent-blue to-accent-teal z-[60] transition-all duration-100"
        style={{ width: `${scrollProgress}%` }}
      />

      <div className="max-w-4xl mx-auto px-4 pt-8 pb-16">
        {/* Back Button */}
        <Link
          to="/blog"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-text-muted hover:text-accent-blue transition-colors mb-8"
        >
          ← Back to Academy
        </Link>

        {/* Hero Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-accent-teal">
            <span>{article.category}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-text-primary mt-3 leading-tight">
            {article.title}
          </h1>
          <p className="text-lg text-text-secondary mt-4 leading-relaxed">
            {article.excerpt}
          </p>
          <div className="flex items-center gap-3 mt-6 text-sm text-text-muted font-medium">
            <span className="font-bold text-text-primary">{article.author || 'DividendBro Team'}</span>
            <span className="w-1 h-1 rounded-full bg-text-muted/50" />
            <span>{article.date}</span>
            <span className="w-1 h-1 rounded-full bg-text-muted/50" />
            <span>{readingTime} min read</span>
          </div>
        </div>

        {/* ✅ Cover Image — Eager Load + WebP + Blur Skeleton */}
        <div className="w-full rounded-2xl overflow-hidden mb-12 border border-border/40 bg-bg-surface relative">
          {/* Skeleton loader shown until image loads */}
          {!heroLoaded && (
            <div className="absolute inset-0 aspect-video w-full animate-pulse bg-gradient-to-r from-bg-primary via-bg-surface to-bg-primary" />
          )}
          <picture>
            <source srcSet={toWebp(article.image)} type="image/webp" />
            <img
              src={article.image}
              alt={article.title}
              width="1200"
              height="630"
              loading="eager"
              decoding="async"
              fetchpriority="high"
              onLoad={() => setHeroLoaded(true)}
              className={`w-full h-auto object-cover transition-opacity duration-500 ${heroLoaded ? 'opacity-100' : 'opacity-0'}`}
            />
          </picture>
        </div>

        {/* Article Body */}
        <article
          className="article-body"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {/* ✅ STATUTORY DISCLAIMER */}
        <div className="article-disclaimer">
          <p><strong>⚠️ Important Disclosures</strong></p>
          <p><strong>Not Financial Advice.</strong> The content on this page is for general informational and educational purposes only. It does not constitute investment advice, a recommendation, or a solicitation to buy or sell any securities. DividendBro is not a licensed financial adviser under the Financial Advisers Act (Singapore) and is not registered as an investment adviser with the U.S. Securities and Exchange Commission.</p>
          <p><strong>No Personalised Advice.</strong> Nothing on this page considers your specific investment objectives, financial situation, or particular needs. You should conduct your own due diligence and consult a licensed financial adviser before making any investment decisions.</p>
          <p><strong>Risk Warning.</strong> All investments carry risk, including the potential loss of principal. Past performance is not indicative of future results. Dividend payments are not guaranteed and may be reduced or eliminated at any time.</p>
          <p><strong>Hypothetical Projections.</strong> Any projections, simulations, or hypothetical performance figures shown are for illustrative purposes only. They are based on assumptions that may not reflect actual market conditions and do not guarantee future outcomes.</p>
          <p><strong>No Liability.</strong> DividendBro and its team shall not be liable for any loss or damage arising from reliance on the information provided. Use of this site is at your own risk.</p>
        </div>

        {/* Author Bio */}
        <div className="mt-8 p-6 bg-bg-surface border border-border/50 rounded-2xl flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent-blue to-accent-teal flex items-center justify-center text-white font-black text-lg flex-shrink-0">
            D
          </div>
          <div>
            <p className="font-bold text-text-primary text-sm">Written by {article.author || 'DividendBro Team'}</p>
            <p className="text-xs text-text-muted mt-1 leading-relaxed">
              We build tools and publish research to help US and SGX investors compound passive income safely and systematically.
            </p>
          </div>
        </div>

        {/* Related Articles */}
        {related.length > 0 && (
          <div className="mt-16 pt-10 border-t border-border/40">
            <h3 className="text-xl font-black text-text-primary mb-6">Related Reading</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {related.map(rel => (
                <Link key={rel.slug} to={`/blog/${rel.slug}`} className="group">
                  <div className="bg-bg-surface border border-border/50 rounded-xl p-4 hover:border-accent-blue/50 transition-all">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-accent-teal">{rel.category}</span>
                    <h4 className="font-bold text-text-primary mt-1.5 group-hover:text-accent-blue transition-colors line-clamp-2">
                      {rel.title}
                    </h4>
                    <p className="text-xs text-text-muted mt-2 line-clamp-2">{rel.excerpt}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="mt-16 pt-10 border-t border-border/40 text-center">
          <p className="text-text-secondary mb-4 font-medium">Ready to put this into practice?</p>
          <Link
            to="/"
            className="inline-block px-8 py-3.5 bg-gradient-to-r from-accent-blue to-accent-teal text-white text-sm font-bold rounded-xl shadow-md hover:opacity-95 active:scale-[0.98] transition-all"
          >
            Start Tracking Your Dividends Free
          </Link>
        </div>
      </div>
    </>
  );
};

export default Article;