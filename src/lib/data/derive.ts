/* Pure, provider-independent derivations used by multiple pages. */
import { CLUB } from "./config";
import type { Match, MatchOutcome, Player, PlayerStats, StandingRow } from "./types";

export function splitSchedule(matches: Match[]) {
  const live = matches.filter((m) => m.state === "in");
  const upcoming = matches.filter((m) => m.state === "pre" || m.state === "postponed");
  const past = matches.filter((m) => m.state === "post").reverse(); // newest first
  return { live, upcoming, past };
}

export function nextMatch(matches: Match[]): Match | null {
  const { live, upcoming } = splitSchedule(matches);
  return live[0] ?? upcoming.find((m) => m.state === "pre") ?? null;
}

export function recentForm(matches: Match[], n = 5): MatchOutcome[] {
  return splitSchedule(matches)
    .past.slice(0, n)
    .map((m) => m.outcome)
    .filter((o): o is MatchOutcome => o != null);
}

export interface TeamSeasonStats {
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  cleanSheets: number;
  failedToScore: number;
  home: { won: number; drawn: number; lost: number };
  away: { won: number; drawn: number; lost: number };
  winRate: number;
  goalsPerGame: number;
  concededPerGame: number;
}

export function teamSeasonStats(matches: Match[], competitionId?: string): TeamSeasonStats {
  const done = matches.filter(
    (m) => m.state === "post" && m.outcome && (!competitionId || m.competition.id === competitionId),
  );
  const s: TeamSeasonStats = {
    played: done.length,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    cleanSheets: 0,
    failedToScore: 0,
    home: { won: 0, drawn: 0, lost: 0 },
    away: { won: 0, drawn: 0, lost: 0 },
    winRate: 0,
    goalsPerGame: 0,
    concededPerGame: 0,
  };
  for (const m of done) {
    const gf = (m.isHome ? m.home.score : m.away.score) ?? 0;
    const ga = (m.isHome ? m.away.score : m.home.score) ?? 0;
    s.goalsFor += gf;
    s.goalsAgainst += ga;
    if (ga === 0) s.cleanSheets++;
    if (gf === 0) s.failedToScore++;
    const bucket = m.isHome ? s.home : s.away;
    if (m.outcome === "G") (s.won++, bucket.won++);
    else if (m.outcome === "B") (s.drawn++, bucket.drawn++);
    else (s.lost++, bucket.lost++);
  }
  if (s.played) {
    s.winRate = Math.round((s.won / s.played) * 100);
    s.goalsPerGame = Math.round((s.goalsFor / s.played) * 100) / 100;
    s.concededPerGame = Math.round((s.goalsAgainst / s.played) * 100) / 100;
  }
  return s;
}

export function leaders(players: Player[], key: keyof PlayerStats, n = 5) {
  return players
    .filter((p) => p.stats[key] > 0)
    .sort((a, b) => b.stats[key] - a.stats[key] || a.name.localeCompare(b.name, "tr"))
    .slice(0, n);
}

export function clubRow(rows: StandingRow[]): StandingRow | null {
  return rows.find((r) => r.team.id === CLUB.espnId) ?? null;
}

/** A small window of the table around the club (for compact snapshots). */
export function tableWindow(rows: StandingRow[], size = 5): StandingRow[] {
  const i = rows.findIndex((r) => r.team.id === CLUB.espnId);
  if (i < 0) return rows.slice(0, size);
  const start = Math.max(0, Math.min(i - Math.floor(size / 2), rows.length - size));
  return rows.slice(start, start + size);
}

export function opponentOf(m: Match) {
  return m.isHome ? m.away : m.home;
}