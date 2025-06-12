let lastCall = 0;
export function canCallApi(minIntervalMs = 1000) {
  const now = Date.now();
  if (now - lastCall < minIntervalMs) return false;
  lastCall = now;
  return true;
} 