const buckets = new Map<string, number[]>();

/**
 * Simple in-memory sliding-window rate limiter. Good enough for a single
 * dev/small-deployment process; a real multi-instance production deploy
 * should swap this for a shared store (e.g. Upstash Redis), since each
 * server process would otherwise track its own counts independently.
 *
 * Returns true if `key` has already made `maxRequests` within `windowMs`.
 */
export function isRateLimited(key: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();
  const timestamps = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);

  if (timestamps.length >= maxRequests) {
    buckets.set(key, timestamps);
    return true;
  }

  timestamps.push(now);
  buckets.set(key, timestamps);
  return false;
}
