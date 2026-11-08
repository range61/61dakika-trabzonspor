import { NEWS_FEEDS } from "../config";
import { cached, fetchText } from "../cache.server";
import type { NewsProvider } from "../types";
import { mergeNews, parseRss } from "./rss.parse";

const TS_FILTER = /trabzon|bordo-mavi|bordo mavi|fırtına/;

/** Headlines + short excerpts from publishers' public RSS feeds, always linking back to the source. */
export const rssNewsProvider: NewsProvider = {
  info: {
    id: "rss",
    name: NEWS_FEEDS.map((f) => f.name).join(", "),
    url: NEWS_FEEDS[0].home,
    isDemo: false,
    note: "Yayıncıların herkese açık RSS akışları",
  },
  async getNews() {
    // 4 feeds — within the 6-connection budget.
    const results = await Promise.allSettled(
      NEWS_FEEDS.map(async (f) =>
        parseRss(await fetchText(f.url), f, { filter: f.filter ? TS_FILTER : undefined }),
      ),
    );
    const ok = results.filter((r) => r.status === "fulfilled");
    if (ok.length === 0) throw new Error("Haber kaynaklarına ulaşılamadı");
    return mergeNews(ok.map((r) => (r as PromiseFulfilledResult<ReturnType<typeof parseRss>>).value));
  },
};

export const rssCached = {
  news: (force?: boolean) => cached("rss:news", 5 * 60_000, () => rssNewsProvider.getNews(), { force }),
};