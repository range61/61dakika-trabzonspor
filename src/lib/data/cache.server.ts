/**
 * Tiny per-isolate TTL cache with in-flight de-duplication.
 * If a refresh fails, serve the last successful value instead of blanking the UI.
 */
type Entry = { value: unknown; fetchedAt: number; expires: number };
const store = new Map<string, Entry>();
const inflight = new Map<string, Promise<Entry>>();

export async function cached<T>(
  key: string,
  ttlMs: number,
  load: () => Promise<T>,
  opts: { force?: boolean } = {},
): Promise<{ value: T; fetchedAt: string }> {
  const now = Date.now();
  const hit = store.get(key);
  const fresh = hit && (opts.force ? now - hit.fetchedAt < 10_000 : hit.expires > now);
  if (hit && fresh) {
    return { value: hit.value as T, fetchedAt: new Date(hit.fetchedAt).toISOString() };
  }

  let p = inflight.get(key);
  if (!p) {
    p = load()
      .then((value) => {
        const fetchedAt = Date.now();
        const entry = { value, fetchedAt, expires: fetchedAt + ttlMs };
        store.set(key, entry);
        return entry;
      })
      .catch((error) => {
        // Stale-if-error: never discard a known-good snapshot because an upstream is down.
        if (hit) {
          console.warn(`[data-cache] Serving stale data for ${key} after refresh failure:`, error);
          return hit;
        }
        throw error;
      })
      .finally(() => inflight.delete(key));
    inflight.set(key, p);
  }
  const entry = await p;
  return { value: entry.value as T, fetchedAt: new Date(entry.fetchedAt).toISOString() };
}

export async function fetchJson<T = unknown>(url: string, timeoutMs = 10_000): Promise<T> {
  const res = await fetch(url, {
    headers: { accept: "application/json", "user-agent": "61Dakika/1.0 (fan portal)" },
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!res.ok) throw new Error(`Kaynak yanıt vermedi (${res.status})`);
  return (await res.json()) as T;
}

export async function fetchText(url: string, timeoutMs = 10_000): Promise<string> {
  const res = await fetch(url, {
    headers: {
      accept: "application/rss+xml, application/xml, text/xml, */*",
      "user-agent": "61Dakika/1.0 (fan portal)",
    },
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!res.ok) throw new Error(`Kaynak yanıt vermedi (${res.status})`);
  return res.text();
}
