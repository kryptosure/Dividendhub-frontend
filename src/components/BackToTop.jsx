import React, { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';

const BackToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 400);
    };
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className={`fixed bottom-24 right-4 sm:bottom-8 sm:right-6 z-50 p-3 rounded-xl bg-gradient-to-r from-accent-blue to-accent-teal text-white shadow-lg transition-all duration-300 hover:scale-105 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
      aria-label="Scroll frame block directly back to top viewport node position"
    >
      <ChevronUp size={20} strokeWidth={2.5} />
    </button>
  );
};

export default BackToTop;
