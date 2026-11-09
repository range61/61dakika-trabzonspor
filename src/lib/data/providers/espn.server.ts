import { CLUB, TRACKED_COMPETITIONS, competitionFor } from "../config";
import { cached, fetchJson } from "../cache.server";
import type { FootballProvider, Match } from "../types";
import { mapAthlete, mapEvent, mapStandings, mapSummary } from "./espn.mappers";

const SITE = "https://site.api.espn.com/apis/site/v2/sports/soccer";
const V2 = "https://site.api.espn.com/apis/v2/sports/soccer";

const OFFICIAL_TEAM_PAGE = "https://www.trabzonspor.org.tr/tr/mac-merkezi?branch=Football&season=2026%2F2027&team=a-takimi-5";

function decodeHtml(value: string): string {
  return value.replace(/&amp;/g, "&").replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&uuml;/gi, "ü").replace(/&ouml;/gi, "ö").replace(/&ccedil;/gi, "ç").replace(/&nbsp;/gi, " ");
}

function normalizePlayerName(value: string): string {
  return decodeHtml(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("tr")
    .replace(/ı/g, "i").replace(/[^a-z0-9]+/g, " ").trim();
}

/** Pulls player-card images from Trabzonspor's own first-team roster page. */
async function getOfficialPlayerPhotos(): Promise<Map<string, string>> {
  const html = await fetchText(OFFICIAL_TEAM_PAGE);
  const photos = new Map<string, string>();
  const anchors = html.match(/<a\b[^>]*>[\s\S]*?<\/a>/gi) ?? [];
  for (const anchor of anchors) {
    const href = anchor.match(/href=["']([^"']*\/branslar\/futbol\/a-takimi-5\/[^"'?#]+)["']/i)?.[1];
    if (!href) continue;
    const slug = decodeURIComponent(href.split("/").filter(Boolean).pop() ?? "");
    const image = anchor.match(/(?:src|data-src)=["']([^"']+\.(?:png|jpe?g|webp)(?:\?[^"']*)?)["']/i)?.[1];
    if (!image) continue;
    const absolute = new URL(decodeHtml(image), "https://www.trabzonspor.org.tr").toString();
    photos.set(normalizePlayerName(slug.replace(/-\d+$/, "").replace(/-/g, " ")), absolute);
  }
  return photos;
}

function officialPhotoFor(name: string, photos: Map<string, string>): string | null {
  const normalized = normalizePlayerName(name);
  if (photos.has(normalized)) return photos.get(normalized)!;
  for (const [slug, url] of photos) {
    if (slug && (normalized.includes(slug) || slug.includes(normalized))) return url;
  }
  return null;
}


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
    const [json, officialPhotos] = await Promise.all([
      fetchJson<any>(`${SITE}/tur.1/teams/${CLUB.espnId}/roster`),
      getOfficialPlayerPhotos().catch((error) => {
        console.warn("[squad] Official Trabzonspor player photos unavailable:", error);
        return new Map<string, string>();
      }),
    ]);
    const list: any[] = json?.athletes ?? [];
    // Some payloads group athletes by position: [{ position, items: [...] }]
    const flat = list.flatMap((a) => (Array.isArray(a?.items) ? a.items : [a]));
    return flat.map((athlete) => {
      const player = mapAthlete(athlete);
      return { ...player, photo: officialPhotoFor(player.name, officialPhotos) ?? player.photo };
    });
  },
};

export const espnCached = {
  schedule: (force?: boolean) => cached("espn:schedule", 60_000, () => espnProvider.getSchedule(), { force }),
  match: (id: string, live: boolean, force?: boolean) =>
    cached(`espn:match:${id}`, live ? 15_000 : 120_000, () => espnProvider.getMatch(id), { force }),
  standings: (force?: boolean) => cached("espn:standings", 5 * 60_000, () => espnProvider.getStandings(), { force }),
  squad: (force?: boolean) => cached("espn:squad", 30 * 60_000, () => espnProvider.getSquad(), { force }),
};