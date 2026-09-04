import React, { useRef } from 'react';

const DatePicker = ({ value, onChange, className = '', required = false, id, ...props }) => {
  const inputRef = useRef(null);

  const handleIconClick = () => {
    if (inputRef.current) {
      inputRef.current.showPicker?.();
      inputRef.current.focus();
    }
  };

  const inputId = id || `date-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="date-picker-wrapper w-full">
      <input
        ref={inputRef}
        id={inputId}
        type="date"
        value={value}
        onChange={onChange}
        required={required}
        className={`w-full bg-bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue ${className}`}
        {...props}
      />
      <span 
        className="date-picker-icon cursor-pointer"
        onClick={handleIconClick}
        role="button"
        tabIndex={0}
        aria-label="Open date picker"
      >
        📅
      </span>
    </div>
  );
};

export default DatePicker;