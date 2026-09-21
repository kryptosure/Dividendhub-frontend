import React, { useState, useEffect } from 'react';
import { track } from '../services/tracker';

const STORAGE_KEY_PREFIX = 'db_article_vote_';

/**
 * Thumbs up / down widget for articles.
 * - Sends an `article_feedback` event to the analytics backend
 * - Stores the user's vote in localStorage so they can't vote twice
 * - Shows a "Thanks" confirmation after voting
 */
const ArticleFeedback = ({ slug, title }) => {
  const [vote, setVote] = useState(null); // null | 'up' | 'down'
  const storageKey = `${STORAGE_KEY_PREFIX}${slug}`;

  // Restore previous vote on mount
  useEffect(() => {
    if (!slug) return;
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored === 'up' || stored === 'down') {
        setVote(stored);
      }
    } catch (e) { /* localStorage disabled — ignore */ }
  }, [slug, storageKey]);

  const handleVote = (direction) => {
    if (vote) return; // already voted
    setVote(direction);
    try {
      localStorage.setItem(storageKey, direction);
    } catch (e) { /* ignore */ }
    track('article_feedback', {
      slug,
      title,
      vote: direction,
    });
  };

  return (
    <div className="mt-12 pt-8 border-t border-border/40">
      <div className="bg-bg-surface border border-border/50 rounded-2xl p-6 text-center">
        {!vote ? (
          <>
            <p className="text-sm font-bold text-text-primary">
              Was this article helpful?
            </p>
            <p className="text-[11px] text-text-muted mt-1">
              Your feedback helps us write better guides.
            </p>
            <div className="flex items-center justify-center gap-3 mt-4">
              <button
                onClick={() => handleVote('up')}
                aria-label="Mark this article as helpful"
                className="flex items-center gap-2 px-5 py-2.5 bg-bg-primary border border-border/50 rounded-xl text-sm font-bold text-text-secondary hover:border-accent hover:text-accent hover:bg-accent/5 active:scale-95 transition-all"
              >
                <span className="text-base">👍</span>
                Yes
              </button>
              <button
                onClick={() => handleVote('down')}
                aria-label="Mark this article as not helpful"
                className="flex items-center gap-2 px-5 py-2.5 bg-bg-primary border border-border/50 rounded-xl text-sm font-bold text-text-secondary hover:border-accent-red hover:text-accent-red hover:bg-accent-red/5 active:scale-95 transition-all"
              >
                <span className="text-base">👎</span>
                Not really
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center gap-3">
            <span className="text-2xl" aria-hidden="true">
              {vote === 'up' ? '👍' : '👎'}
            </span>
            <div className="text-left">
              <p className="text-sm font-bold text-text-primary">
                Thanks for the feedback!
              </p>
              <p className="text-[11px] text-text-muted mt-0.5">
                {vote === 'up'
                  ? 'Glad it was useful. We\'ll keep writing more like this.'
                  : 'Sorry it missed the mark. We\'ll work on improving it.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArticleFeedback;