/**
 * ÖRNEK VERİ — clearly fictional placeholder data, used only when
 * FOOTBALL_DATA_PROVIDER=demo / NEWS_PROVIDER=demo, or in tests. Player names are
 * deliberately fictional and every source envelope is flagged `isDemo: true`.
 */
import { COMPETITIONS, TEAM_NAMES_TR } from "../config";
import type {
  FootballProvider,
  Match,
  MatchDetail,
  NewsItem,
  NewsProvider,
  Player,
  PositionGroup,
  StandingRow,
} from "../types";

const team = (id: string) => ({
  id,
  name: TEAM_NAMES_TR[id]?.name ?? "Rakip",
  shortName: TEAM_NAMES_TR[id]?.short ?? "RKP",
  logo: null,
});

const OPPONENTS = ["432", "436", "1895", "6870", "7648", "789", "7656", "9078", "996", "995"];
const DAY = 86_400_000;

function build(): Match[] {
  const base = Date.UTC(2026, 0, 1, 16, 0);
  const now = Date.now();
  return OPPONENTS.map((opp, i) => {
    const date = new Date(now + (i - 5) * 7 * DAY);
    date.setUTCHours(16, 0, 0, 0);
    const past = i < 5;
    const isHome = i % 2 === 0;
    const us = past ? (i * 7) % 4 : null;
    const them = past ? (i * 3) % 3 : null;
    const ts = { ...team("997"), score: isHome ? us : them };
    const op = { ...team(opp), score: isHome ? them : us };
    return {
      id: `demo-${i}`,
      competition: COMPETITIONS["tur.1"],
      date: Number.isNaN(date.getTime()) ? new Date(base).toISOString() : date.toISOString(),
      state: past ? "post" : "pre",
      statusText: past ? "MS" : "Başlamadı",
      clock: null,
      venue: isHome ? "Papara Park" : "Deplasman",
      home: isHome ? ts : op,
      away: isHome ? op : ts,
      isHome,
      outcome: past && us != null && them != null ? (us > them ? "G" : us < them ? "M" : "B") : null,
    } satisfies Match;
  });
}

const POS: PositionGroup[] = ["GK", "GK", "DEF", "DEF", "DEF", "DEF", "DEF", "MID", "MID", "MID", "MID", "MID", "FWD", "FWD", "FWD"];

export const demoPlayers: Player[] = POS.map((p, i) => ({
  id: `demo-p${i + 1}`,
  name: `Örnek Oyuncu ${i + 1}`,
  jersey: String(i + 1),
  position: p,
  age: 20 + (i % 12),
  birthDate: null,
  nationality: "Örnek",
  flag: null,
  heightCm: 175 + (i % 15),
  weightKg: 70 + (i % 12),
  photo: null,
  profileUrl: null,
  stats: {
    appearances: 4 + (i % 7),
    subIns: i % 3,
    goals: p === "FWD" ? 3 + (i % 3) : p === "MID" ? i % 3 : 0,
    assists: p === "MID" ? 2 + (i % 2) : i % 2,
    shots: 3 * (i % 5),
    shotsOnTarget: i % 5,
    yellowCards: i % 3,
    redCards: 0,
    foulsCommitted: i % 6,
    foulsSuffered: i % 4,
    offsides: p === "FWD" ? 2 : 0,
    saves: p === "GK" ? 12 + i : 0,
    goalsConceded: p === "GK" ? 6 : 0,
  },
}));

export const demoFootballProvider: FootballProvider = {
  info: { id: "demo", name: "Örnek veri", url: "/kulup", isDemo: true, note: "Gerçek değildir" },
  async getSchedule() {
    return build();
  },
  async getMatch(id) {
    const m = build().find((x) => x.id === id);
    if (!m) return null;
    const detail: MatchDetail = {
      ...m,
      events: m.state === "post" ? [{ minute: "23'", type: "goal", side: m.isHome ? "home" : "away", players: ["Örnek Oyuncu 13"] }] : [],
      stats:
        m.state === "post"
          ? [
              { key: "possessionPct", label: "Topa sahip olma", unit: "%", home: 54, away: 46 },
              { key: "totalShots", label: "Şut", home: 12, away: 8 },
            ]
          : [],
      lineups: { home: null, away: null },
    };
    return detail;
  },
  async getStandings() {
    const ids = ["997", ...OPPONENTS];
    const rows: StandingRow[] = ids.map((id, i) => ({
      rank: i + 1,
      team: team(id),
      played: 10,
      won: 8 - Math.min(i, 7),
      drawn: 1,
      lost: 1 + Math.min(i, 7),
      goalsFor: 20 - i,
      goalsAgainst: 8 + i,
      goalDiff: 12 - 2 * i,
      points: 25 - 3 * Math.min(i, 7),
      note: i === 0 ? "Şampiyonlar Ligi" : null,
      zone: i === 0 ? "cl" : null,
    }));
    return { competition: COMPETITIONS["tur.1"], season: "Örnek sezon", rows };
  },
  async getSquad() {
    return demoPlayers;
  },
};

export const demoNewsProvider: NewsProvider = {
  info: { id: "demo-news", name: "Örnek haberler", url: "/haberler", isDemo: true, note: "Gerçek değildir" },
  async getNews(): Promise<NewsItem[]> {
    return Array.from({ length: 6 }, (_, i) => ({
      id: `demo-n${i}`,
      title: `Örnek haber başlığı ${i + 1}`,
      excerpt: "Bu bir yer tutucu özettir; gerçek bir haber değildir.",
      url: "https://example.com",
      source: { name: "Örnek kaynak", url: "https://example.com" },
      publishedAt: new Date(Date.now() - i * 3_600_000).toISOString(),
      category: (["mac", "transfer", "kulup", "avrupa", "sakatlik", "gundem"] as const)[i],
    }));
  },
};