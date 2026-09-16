type Bucket = { count: number; resetAt: number };

/**
 * Resolve the real client IP for rate-limiting keys. Nginx is configured with
 * `proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for`, which APPENDS the real
 * client IP after any value the client already sent — so the leftmost X-Forwarded-For
 * entry is attacker-controlled and must never be trusted. `X-Real-IP` is set by Nginx to
 * `$remote_addr` (the actual TCP peer), which a client cannot override, so prefer it.
 * This is only trustworthy because the app itself is bound to 127.0.0.1 and unreachable
 * except through that Nginx hop — see systemd unit HOSTNAME=127.0.0.1.
 */
export function getClientIp(getHeader: (name: string) => string | null | undefined): string {
  const realIp = getHeader("x-real-ip")?.trim();
  if (realIp) return realIp;

  const forwardedFor = getHeader("x-forwarded-for");
  if (forwardedFor) {
    const parts = forwardedFor.split(",").map((p) => p.trim());
    return parts[parts.length - 1] || "unknown";
  }

  return "unknown";
}

const buckets = new Map<string, Bucket>();

/**
 * Simple in-memory fixed-window rate limiter. Good enough for a single-instance
 * deployment; if this app is ever scaled to multiple server instances, replace
 * with a shared store (e.g. Redis) so limits apply across all of them.
 */
export function checkRateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (bucket.count >= max) {
    return false;
  }

  bucket.count++;
  return true;
}
