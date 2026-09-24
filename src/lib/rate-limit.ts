// Fixed-window, in-memory rate limiter. Good enough for the single persistent
// Node process this site runs on (see README → Deployment); if it ever runs
// on more than one instance, move the counters to Redis/Upstash.

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
let lastSweep = 0;

/** Counts one hit against `key`; `ok` is false once it exceeds `limit` within `windowMs`. */
export function rateLimit(key: string, limit: number, windowMs: number): { ok: boolean; retryAfterSeconds: number } {
  const now = Date.now();

  // Drop expired buckets now and then so the map can't grow without bound.
  if (now - lastSweep > 60_000) {
    for (const [k, b] of buckets) if (b.resetAt <= now) buckets.delete(k);
    lastSweep = now;
  }

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterSeconds: 0 };
  }

  bucket.count += 1;
  if (bucket.count <= limit) return { ok: true, retryAfterSeconds: 0 };
  return { ok: false, retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000) };
}

/**
 * Best-effort client IP. Cloudflare's header wins when present; otherwise
 * X-Real-IP, then the *last* X-Forwarded-For entry — the one appended by our
 * own reverse proxy (or by `next start` itself, from the socket), rather than
 * the first, which the client can set to anything.
 */
export function clientIp(headers: Headers): string {
  return (
    headers.get("cf-connecting-ip")?.trim() ||
    headers.get("x-real-ip")?.trim() ||
    headers.get("x-forwarded-for")?.split(",").at(-1)?.trim() ||
    "unknown"
  );
}
