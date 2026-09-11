/* src/services/tracker.js
 * Lightweight frontend event tracker. Batches events and flushes every 2s.
 */

import { logEvent } from './api';

// Session ID (resets on page reload)
const sessionId = Math.random().toString(36).slice(2, 12);
const STORAGE_KEY = 'db_last_event';

// Dedup: don't log the same event type+data combo twice within X ms
const DEDUP_WINDOW_MS = 1500;
const recentEvents = new Map();

let queue = [];
let timer = null;

export function track(eventType, eventData = {}) {
  try {
    // Dedup check
    const key = `${eventType}:${JSON.stringify(eventData)}`;
    const now = Date.now();
    const last = recentEvents.get(key);
    if (last && now - last < DEDUP_WINDOW_MS) return;
    recentEvents.set(key, now);
    if (recentEvents.size > 100) recentEvents.clear();

    queue.push({
      event_type: eventType,
      event_data: eventData,
      session_id: sessionId,
    });

    // Debounced flush
    if (!timer) {
      timer = setTimeout(flush, 2000);
    }

    // Flush immediately if queue gets large
    if (queue.length >= 20) flush();
  } catch (e) {
    // Never break the app
  }
}

async function flush() {
  if (timer) { clearTimeout(timer); timer = null; }
  const batch = queue;
  queue = [];
  if (batch.length === 0) return;
  try {
    await logEvent(batch);
  } catch (e) {}
}

// Flush on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    if (queue.length > 0) {
      // Use sendBeacon for reliability on unload
      try {
        const payload = JSON.stringify({ events: queue });
        const blob = new Blob([payload], { type: 'application/json' });
        const url = (import.meta.env?.VITE_API_URL || 'http://localhost:8000') + '/api/events';
        navigator.sendBeacon(url, blob);
      } catch (e) {}
    }
  });
}

export default { track };