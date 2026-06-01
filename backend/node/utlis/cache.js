const cache = new Map();
const CACHE_TTL = 1000 * 60 * 5;

export function getCache(key) {
  const entry = cache.get(key);
  if (!entry) return null;

  if (Date.now() > entry.expiry) {
    cache.delete(key);
    return null;
  }

  return entry.data;
}

export function setCache(key, data) {
  cache.set(key, {
    data,
    expiry: Date.now() + CACHE_TTL
  });
}

// ==============================
// ZEITRAUM HELPER
// ==============================
export function getPreviousRange(start, end) {
  const s = new Date(start);
  const e = new Date(end);

  const diff = e - s;

  const prevEnd = new Date(s);
  prevEnd.setDate(prevEnd.getDate() - 1);

  const prevStart = new Date(prevEnd - diff);

  return {
    prevStart: prevStart.toISOString().slice(0, 10),
    prevEnd: prevEnd.toISOString().slice(0, 10)
  };
}
