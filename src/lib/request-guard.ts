/**
 * Guards for the two unauthenticated POST routes.
 *
 * App Router route handlers have no built-in body limit — `request.json()`
 * buffers the whole body into the heap before parsing — and the site runs as a
 * single container with no memory ceiling, so a few large POSTs are enough to
 * OOM it. Everything here is deliberately dependency-free.
 */

/** Largest body either form can legitimately produce, with generous headroom. */
export const MAX_BODY_BYTES = 64 * 1024;

export class BodyTooLarge extends Error {}

/** Read a request body, refusing anything over the cap without buffering it. */
export async function readJsonBody(request: Request, limit = MAX_BODY_BYTES): Promise<unknown> {
  const declared = Number(request.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > limit) throw new BodyTooLarge();

  const reader = request.body?.getReader();
  if (!reader) return {};

  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.length;
    // Content-Length can lie, or be absent under chunked encoding, so the real
    // enforcement is here: stop reading the moment the cap is passed.
    if (total > limit) {
      await reader.cancel();
      throw new BodyTooLarge();
    }
    chunks.push(value);
  }

  const buffer = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    buffer.set(chunk, offset);
    offset += chunk.length;
  }
  return JSON.parse(new TextDecoder().decode(buffer));
}

/**
 * Coerce a form payload to known fields of bounded length.
 *
 * The routes relay to an internal service that is otherwise unreachable from the
 * internet, so the body must not be passed through unexamined: unknown keys are
 * dropped and every value is capped, which also stops a submission from writing
 * a megabyte-wide row into the intake spreadsheet.
 */
export function sanitisePayload(
  input: unknown,
  allowed: readonly string[],
  { maxLength = 2000, maxItems = 12 }: { maxLength?: number; maxItems?: number } = {},
): Record<string, string | string[]> {
  const out: Record<string, string | string[]> = {};
  if (typeof input !== "object" || input === null) return out;
  const source = input as Record<string, unknown>;

  for (const key of allowed) {
    const value = source[key];
    if (value === undefined || value === null) continue;
    if (Array.isArray(value)) {
      const items = value
        .slice(0, maxItems)
        .filter((v) => typeof v === "string" || typeof v === "number")
        .map((v) => String(v).slice(0, maxLength));
      if (items.length) out[key] = items;
    } else if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      const text = String(value).slice(0, maxLength);
      if (text) out[key] = text;
    }
  }
  return out;
}

/** Per-IP token bucket, in process memory.
 *
 * The backend's own limiter keys on the caller's address, and every visitor
 * reaches it through this container — so without a limit here one attacker
 * exhausts the shared bucket and every real applicant is refused. */
const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(ip: string, { limit, windowMs }: { limit: number; windowMs: number }): boolean {
  const now = Date.now();
  const bucket = buckets.get(ip);
  if (!bucket || now > bucket.resetAt) {
    buckets.set(ip, { count: 1, resetAt: now + windowMs });
    if (buckets.size > 10_000) {
      // Bound the map so the limiter itself cannot become the memory leak.
      for (const [key, value] of buckets) if (now > value.resetAt) buckets.delete(key);
    }
    return true;
  }
  if (bucket.count >= limit) return false;
  bucket.count += 1;
  return true;
}

/** Client address as seen by nginx; the socket address is the proxy's. */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}
