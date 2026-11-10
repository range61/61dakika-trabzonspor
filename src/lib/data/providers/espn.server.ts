import { CLUB, TRACKED_COMPETITIONS, competitionFor } from "../config";
import { cached, fetchJson } from "../cache.server";
import type { FootballProvider, Match } from "../types";
import { mapAthlete, mapEvent, mapStandings, mapSummary } from "./espn.mappers";

const SITE = "https://site.api.espn.com/apis/site/v2/sports/soccer";
const V2 = "https://site.api.espn.com/apis/v2/sports/soccer";

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * ESPN public site API. No key required, but it is unofficial and undocumented,
 * so every response is mapped defensively and failures surface as error states.
 */
export const espnProvider: FootballProvider = {
  info: {
    id: "espn",
    name: "ESPN",
    url: "https://www.espn.com/soccer/team/_/id/997/trabzonspor",
    isDemo: false,
    note: "Herkese açık, resmî olmayan veri uç noktası",
  },

  async getSchedule() {
    // 3 competitions × (results + fixtures) = 6 requests — within the 6-connection budget.
    const urls = TRACKED_COMPETITIONS.flatMap((slug) => [
      { slug, url: `${SITE}/${slug}/teams/${CLUB.espnId}/schedule` },
      { slug, url: `${SITE}/${slug}/teams/${CLUB.espnId}/schedule?fixture=true` },
    ]);
    const results = await Promise.allSettled(urls.map((u) => fetchJson<any>(u.url)));
    const okCount = results.filter((r) => r.status === "fulfilled").length;
    if (okCount === 0) throw new Error("Fikstür kaynağına ulaşılamadı");
    const byId = new Map<string, Match>();
    results.forEach((r, i) => {
      if (r.status !== "fulfilled") return;
      for (const ev of r.value?.events ?? []) {
        const m = mapEvent(ev, competitionFor(urls[i].slug));
        if (m) byId.set(m.id, m);
      }
    });
    return [...byId.values()].sort((a, b) => a.date.localeCompare(b.date));
  },

  async getMatch(id) {
    const json = await fetchJson<any>(`${SITE}/all/summary?event=${encodeURIComponent(id)}`);
    return mapSummary(json);
  },

  async getStandings() {
    return mapStandings(await fetchJson<any>(`${V2}/tur.1/standings`));
  },

  async getSquad() {
    // Use ESPN roster portraits directly. The Trabzonspor website blocks
    // server-side requests from hosting providers (HTTP 403), so do not make
    // squad loading depend on scraping that page.
    const json = await fetchJson<any>(`${SITE}/tur.1/teams/${CLUB.espnId}/roster`);
    const list: any[] = json?.athletes ?? [];
    // Some payloads group athletes by position: [{ position, items: [...] }]
    const flat = list.flatMap((a) => (Array.isArray(a?.items) ? a.items : [a]));
    return flat.map((athlete) => {
      const player = mapAthlete(athlete);
      return player;
    });
  },
};

export const espnCached = {
  schedule: (force?: boolean) => cached("espn:schedule", 60_000, () => espnProvider.getSchedule(), { force }),
  match: (id: string, live: boolean, force?: boolean) =>
    cached(`espn:match:${id}`, live ? 15_000 : 120_000, () => espnProvider.getMatch(id), { force }),
  standings: (force?: boolean) => cached("espn:standings", 5 * 60_000, () => espnProvider.getStandings(), { force }),\n  conferenceStandings: (force?: boolean) => cached("espn:standings:conference", 5 * 60_000, () => espnProvider.getConferenceStandings(), { force }),
  squad: (force?: boolean) => cached("espn:squad", 30 * 60_000, () => espnProvider.getSquad(), { force }),
};