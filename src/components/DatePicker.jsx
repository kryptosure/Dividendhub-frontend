import React, { useRef } from 'react';

const DatePicker = ({ value, onChange, className = '', required = false, id, ...props }) => {
  const inputRef = useRef(null);
  const inputId = id || `date-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="relative w-full group">
      <input
        ref={inputRef}
        id={inputId}
        type="date"
        value={value}
        onChange={onChange}
        required={required}
        className={`w-full bg-bg-secondary border border-border/60 rounded-xl pl-4 pr-10 py-2.5 text-sm font-medium text-text-primary focus:outline-none focus:border-accent-blue focus:ring-4 focus:ring-accent-blue/5 shadow-sm transition-all ${className}`}
        {...props}
      />
      <span 
        onClick={() => inputRef.current?.showPicker?.()}
        className="absolute right-3.5 top-3 text-sm cursor-pointer select-none text-text-muted/80 group-focus-within:text-accent-blue transition-colors"
        role="button"
        tabIndex={0}
        aria-label="Open date window picker calendar interface"
      >
        📅
      </span>
    </div>
  );
};

export default DatePicker;
