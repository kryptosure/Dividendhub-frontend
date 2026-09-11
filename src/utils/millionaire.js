/**
 * Client-side millionaire projection math.
 * Runs in <1ms for 40 years × 12 months = 480 iterations.
 */

export function simulateMillionaire({
  currentPrice,
  currentYield,
  priceCAGR,
  dividendCAGR,
  monthlyAmount,
  drip = true,
  target = 1000000,
  maxYears = 40,
}) {
  if (!currentPrice || currentPrice <= 0 || monthlyAmount <= 0) {
    return { yearsToTarget: null, yearlyData: [], totalContributed: 0, finalValue: 0 };
  }

  // Annual dividend per share right now
  const annualDivPerShare = currentPrice * currentYield;
  const monthlyPriceGrowth = Math.pow(1 + priceCAGR, 1 / 12) - 1;
  const monthlyDivGrowth = Math.pow(1 + dividendCAGR, 1 / 12) - 1;

  let shares = 0;
  let cash = 0;
  let price = currentPrice;
  let divPerShare = annualDivPerShare;

  const yearlyData = [];
  let yearsToTarget = null;

  for (let month = 0; month < maxYears * 12; month++) {
    // 1. Buy shares with this month's contribution
    shares += monthlyAmount / price;

    // 2. Receive this month's dividend
    const monthlyDividend = (shares * divPerShare) / 12;
    if (drip) {
      shares += monthlyDividend / price;
    } else {
      cash += monthlyDividend;
    }

    // 3. Advance price and dividend
    price *= (1 + monthlyPriceGrowth);
    divPerShare *= (1 + monthlyDivGrowth);

    // 4. Total portfolio value
    const portfolioValue = (shares * price) + cash;
    const contributed = monthlyAmount * (month + 1);

    // 5. Snapshot every 12 months
    if ((month + 1) % 12 === 0) {
      yearlyData.push({
        year: (month + 1) / 12,
        portfolioValue: Math.round(portfolioValue),
        contributed: Math.round(contributed),
      });
    }

    // 6. Record the first time we cross the target
    if (yearsToTarget === null && portfolioValue >= target) {
      yearsToTarget = (month + 1) / 12;
    }
  }

  const lastSnapshot = yearlyData[yearlyData.length - 1];

  return {
    yearsToTarget,
    yearlyData,
    totalContributed: lastSnapshot?.contributed || 0,
    finalValue: lastSnapshot?.portfolioValue || 0,
  };
}

/**
 * Format a "years" value to a friendly string.
 */
export function formatYears(years) {
  if (years === null || years === undefined) return '40+ years';
  if (years < 1) {
    const months = Math.round(years * 12);
    return `${months} month${months !== 1 ? 's' : ''}`;
  }
  const whole = Math.floor(years);
  const months = Math.round((years - whole) * 12);
  if (months === 0) return `${whole} year${whole !== 1 ? 's' : ''}`;
  return `${whole}y ${months}m`;
}

/**
 * Format a number as currency with K/M suffixes.
 */
export function formatCompactCurrency(num, symbol = '$') {
  if (num === null || num === undefined || isNaN(num)) return `${symbol}0`;
  if (num >= 1_000_000_000) return `${symbol}${(num / 1_000_000_000).toFixed(2)}B`;
  if (num >= 1_000_000) return `${symbol}${(num / 1_000_000).toFixed(2)}M`;
  if (num >= 1_000) return `${symbol}${(num / 1_000).toFixed(1)}K`;
  return `${symbol}${num.toFixed(0)}`;
}