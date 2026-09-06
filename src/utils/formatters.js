/**
 * Format raw numbers with thousand separators and precise standard decimal padding.
 */
export const formatNumber = (value, decimals = 2) => {
  if (value == null || isNaN(value) || !isFinite(value)) return '—';
  return Number(value).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

/**
 * Format localized financial parameters with targeted region currency symbols.
 */
export const formatCurrency = (value, symbol = '$', decimals = 2) => {
  if (value == null || isNaN(value) || !isFinite(value)) return '—';
  return `${symbol}${formatNumber(value, decimals)}`;
};

/**
 * Format standard asset yield growth matrices.
 */
export const formatPercent = (value) => {
  if (value == null || isNaN(value) || !isFinite(value)) return '—';
  return `${formatNumber(value, 2)}%`;
};
