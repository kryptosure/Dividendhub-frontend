// Utility functions for formatting numbers, currency, and percentages

/**
 * Format a number with thousand separators and fixed decimals.
 * @param {number} value - The number to format.
 * @param {number} decimals - Number of decimal places (default: 2).
 * @returns {string} Formatted string with commas.
 */
export const formatNumber = (value, decimals = 2) => {
  if (value == null || isNaN(value)) return '—';
  return Number(value).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

/**
 * Format a currency value with symbol and thousand separators.
 * @param {number} value - The number to format.
 * @param {string} symbol - Currency symbol (e.g., '$', 'S$').
 * @param {number} decimals - Number of decimal places (default: 2).
 * @returns {string} Formatted currency string.
 */
export const formatCurrency = (value, symbol = '$', decimals = 2) => {
  if (value == null || isNaN(value)) return '—';
  return `${symbol}${formatNumber(value, decimals)}`;
};

/**
 * Format a percentage with one decimal place.
 * @param {number} value - The percentage value (e.g., 12.34).
 * @returns {string} Formatted percentage string.
 */
export const formatPercent = (value) => {
  if (value == null || isNaN(value)) return '—';
  return `${formatNumber(value, 2)}%`;
};