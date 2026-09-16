import React, { useState, useRef, useEffect } from 'react';

/**
 * Small info icon that shows a tooltip.
 * - Hover on desktop
 * - Tap on mobile (closes on outside tap)
 */
const InfoTip = ({ text, position = 'top', className = '' }) => {
  const [show, setShow] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!show) return;
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setShow(false);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('touchstart', handleClick);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('touchstart', handleClick);
    };
  }, [show]);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <span ref={ref} className={`relative inline-flex items-center ${className}`}>
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); setShow(!show); }}
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        aria-label="More info"
        className="ml-1 w-4 h-4 rounded-full bg-text-muted/20 text-text-muted text-[10px] font-black inline-flex items-center justify-center hover:bg-accent-blue/20 hover:text-accent-blue transition-colors flex-shrink-0"
      >
        i
      </button>
      {show && (
        <span
          className={`absolute z-50 w-56 max-w-[calc(100vw-2rem)] bg-bg-secondary border border-border/60 rounded-xl p-3 text-[11px] text-text-secondary leading-relaxed shadow-xl ${positionClasses[position]}`}
          role="tooltip"
        >
          {text}
        </span>
      )}
    </span>
  );
};

export default InfoTip;