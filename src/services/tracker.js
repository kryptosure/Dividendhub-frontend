/* src/services/tracker.js
 * Lightweight frontend event tracker. Batches events and flushes every 2s.
 * Sends BOTH a persistent visitorId (localStorage) and a sessionId (per page load).
 */

import { logEvent } from './api';

// ---------- Persistent visitor ID (survives page reloads) ----------
function getVisitorId() {
  try {
    const KEY = 'db_visitor_id';
    let id = localStorage.getItem(KEY);
    if (!id) {
      id = 'v_' + Math.random().toString(36).slice(2, 12) + Date.now().toString(36);
      localStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    return 'v_unknown';
  }
}

// ---------- Per-page-load session ID ----------
const sessionId = 's_' + Math.random().toString(36).slice(2, 12);
const visitorId = getVisitorId();

const DEDUP_WINDOW_MS = 1500;
const recentEvents = new Map();

let queue = [];
let timer = null;

export function track(eventType, eventData = {}) {
  try {
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
      visitor_id: visitorId,   // ✅ NEW
    });

    if (!timer) timer = setTimeout(flush, 2000);
    if (queue.length >= 20) flush();
  } catch (e) {
    // never break the app
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

if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    if (queue.length > 0) {
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