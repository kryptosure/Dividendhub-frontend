/* src/utils/simulationHistory.js
 * Stores the last 5 simulations in localStorage.
 */

const STORAGE_KEY = 'db_simulation_history';
const MAX_ENTRIES = 5;

/**
 * Get all saved simulations, newest first.
 */
export function getSimulationHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

/**
 * Save a new simulation. Dedupes by symbol+amount+drip, then keeps only the last 5.
 */
export function saveSimulation(entry) {
  try {
    const { symbol, monthlyAmount, drip, yearsToTarget, name } = entry;
    if (!symbol || !monthlyAmount) return;

    const history = getSimulationHistory();

    // Remove any existing entry with the same key (so it moves to the top)
    const filtered = history.filter(h =>
      !(h.symbol === symbol && h.monthlyAmount === monthlyAmount && h.drip === drip)
    );

    const newEntry = {
      symbol: String(symbol).toUpperCase(),
      name: name || symbol,
      monthlyAmount: Number(monthlyAmount),
      drip: Boolean(drip),
      yearsToTarget: yearsToTarget ?? null,
      timestamp: Date.now(),
    };

    const updated = [newEntry, ...filtered].slice(0, MAX_ENTRIES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    return null;
  }
}

/**
 * Clear all history.
 */
export function clearSimulationHistory() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {}
}

/**
 * Format the timestamp into a friendly "5 min ago" string.
 */
export function formatRelativeTime(ts) {
  const diff = Date.now() - ts;
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return 'just now';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const days = Math.floor(hr / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(ts).toLocaleDateString();
}