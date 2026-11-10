/**
 * Provider selection. Swap data sources here (or via env) without touching UI.
 *   FOOTBALL_DATA_PROVIDER = "espn" (default) | "demo"
 *   NEWS_PROVIDER          = "rss"  (default) | "demo"
 */
import { cached } from "./cache.server";
import { demoFootballProvider, demoNewsProvider } from "./providers/demo";
import { espnCached, espnProvider } from "./providers/espn.server";
import { rssCached, rssNewsProvider } from "./providers/rss.server";
import type { DataEnvelope, Match, MatchDetail, NewsItem, Player, SourceInfo, Standings } from "./types";

const env = (k: string) => (typeof process !== "undefined" ? process.env[k] : undefined);

const footballMode = () => (env("FOOTBALL_DATA_PROVIDER") === "demo" ? "demo" : "espn");
const newsMode = () => (env("NEWS_PROVIDER") === "demo" ? "demo" : "rss");

const wrap = <T>(source: SourceInfo, r: { value: T; fetchedAt: string }): DataEnvelope<T> => ({
  data: r.value,
  source,
  fetchedAt: r.fetchedAt,
});

const demo = async <T>(fn: () => Promise<T>) => ({ value: await fn(), fetchedAt: new Date().toISOString() });

export async function loadSchedule(force?: boolean): Promise<DataEnvelope<Match[]>> {
  if (footballMode() === "demo") return wrap(demoFootballProvider.info, await demo(demoFootballProvider.getSchedule));
  return wrap(espnProvider.info, await espnCached.schedule(force));
}

export async function loadMatch(id: string, force?: boolean): Promise<DataEnvelope<MatchDetail | null>> {
  if (footballMode() === "demo")
    return wrap(demoFootballProvider.info, await demo(() => demoFootballProvider.getMatch(id)));
  // Peek at the schedule cache to pick a short TTL for live matches.
  const sched = await cached("espn:schedule", 60_000, () => espnProvider.getSchedule()).catch(() => null);
  const live = sched?.value.find((m) => m.id === id)?.state === "in";
  return wrap(espnProvider.info, await espnCached.match(id, live, force));
}

export async function loadStandings(force?: boolean): Promise<DataEnvelope<Standings>> {
  if (footballMode() === "demo") return wrap(demoFootballProvider.info, await demo(demoFootballProvider.getStandings));
  return wrap(espnProvider.info, await espnCached.standings(force));
}

export async function loadConferenceStandings(force?: boolean): Promise<DataEnvelope<Standings>> {
  if (footballMode() === "demo") return wrap(demoFootballProvider.info, await demo(demoFootballProvider.getStandings));
  return wrap(espnProvider.info, await espnCached.conferenceStandings(force));
}

export async function loadSquad(force?: boolean): Promise<DataEnvelope<Player[]>> {
  if (footballMode() === "demo") return wrap(demoFootballProvider.info, await demo(demoFootballProvider.getSquad));
  return wrap(espnProvider.info, await espnCached.squad(force));
}

export async function loadNews(force?: boolean): Promise<DataEnvelope<NewsItem[]>> {
  if (newsMode() === "demo") return wrap(demoNewsProvider.info, await demo(demoNewsProvider.getNews));
  return wrap(rssNewsProvider.info, await rssCached.news(force));
}