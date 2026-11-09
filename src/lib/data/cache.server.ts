/**
 * Tiny per-isolate TTL cache with in-flight de-duplication. Keeps us polite to
 * upstream providers; each entry also remembers when it was fetched.
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
  // A forced refresh still reuses entries younger than 10s so repeated clicks can't hammer upstream.
  const fresh = hit && (opts.force ? now - hit.fetchedAt < 10_000 : hit.expires > now);
  if (hit && fresh) {
    return { value: hit.value as T, fetchedAt: new Date(hit.fetchedAt).toISOString() };
  }
  let p = inflight.get(key);
  if (!p) {
    p = load()
      .then((value) => {
        const entry = { value, fetchedAt: Date.now(), expires: Date.now() + ttlMs };
        store.set(key, entry);
        return entry;
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