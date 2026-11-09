/**
 * Provider-agnostic data models. UI code only depends on these shapes; every
 * provider adapter (ESPN, RSS, demo, …) maps its raw payloads into them.
 */

export interface Competition {
  id: string;
  name: string;
  short: string;
}

export interface TeamRef {
  id: string;
  name: string;
  shortName: string;
  logo: string | null;
}

export type MatchState = "pre" | "in" | "post" | "postponed" | "canceled";
export type MatchOutcome = "G" | "B" | "M"; // Galibiyet / Beraberlik / Mağlubiyet

export interface MatchSide extends TeamRef {
  score: number | null;
}

export interface Match {
  id: string;
  competition: Competition;
  /** ISO 8601 UTC kick-off time */
  date: string;
  state: MatchState;
  statusText: string;
  clock: string | null;
  venue: string | null;
  home: MatchSide;
  away: MatchSide;
  /** True when the focus club plays at home */
  isHome: boolean;
  /** Result from the focus club's perspective, finished matches only */
  outcome: MatchOutcome | null;
}

export type MatchEventType = "goal" | "penalty" | "own-goal" | "yellow" | "red" | "sub";

export interface MatchEvent {
  minute: string;
  type: MatchEventType;
  side: "home" | "away";
  players: string[];
}

export interface MatchStat {
  key: string;
  label: string;
  home: number;
  away: number;
  /** Display suffix, e.g. "%" */
  unit?: string;
}

export interface LineupPlayer {
  name: string;
  jersey: string | null;
  position: string | null;
  starter: boolean;
}

export interface Lineup {
  formation: string | null;
  players: LineupPlayer[];
}

export interface MatchDetail extends Match {
  events: MatchEvent[];
  stats: MatchStat[];
  lineups: { home: Lineup | null; away: Lineup | null };
}

export interface StandingRow {
  rank: number;
  team: TeamRef;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
  note: string | null;
  zone: "cl" | "clq" | "el" | "ecl" | "rel" | null;
}

export interface Standings {
  competition: Competition;
  season: string;
  rows: StandingRow[];
}

export type PositionGroup = "GK" | "DEF" | "MID" | "FWD";

export interface PlayerStats {
  appearances: number;
  subIns: number;
  goals: number;
  assists: number;
  shots: number;
  shotsOnTarget: number;
  yellowCards: number;
  redCards: number;
  foulsCommitted: number;
  foulsSuffered: number;
  offsides: number;
  saves: number;
  goalsConceded: number;
}

export interface Player {
  id: string;
  name: string;
  jersey: string | null;
  position: PositionGroup;
  positionDetail?: string;
  age: number | null;
  birthDate: string | null;
  nationality: string | null;
  flag: string | null;
  heightCm: number | null;
  weightKg: number | null;
  photo: string | null;
  profileUrl: string | null;
  stats: PlayerStats;
}

export type NewsCategory = "mac" | "transfer" | "sakatlik" | "avrupa" | "kulup" | "gundem";

export interface NewsItem {
  id: string;
  title: string;
  /** Short excerpt (truncated) — never full article text */
  excerpt: string;
  url: string;
  source: { name: string; url: string };
  publishedAt: string | null;
  category: NewsCategory;
}

export interface SourceInfo {
  id: string;
  name: string;
  url: string;
  isDemo: boolean;
  note?: string;
}

export interface DataEnvelope<T> {
  data: T;
  source: SourceInfo;
  /** ISO time the server fetched (or served from cache) this payload */
  fetchedAt: string;
}

export interface FootballProvider {
  info: SourceInfo;
  getSchedule(): Promise<Match[]>;
  getMatch(id: string): Promise<MatchDetail | null>;
  getStandings(): Promise<Standings>;
  getSquad(): Promise<Player[]>;
}

export interface NewsProvider {
  info: SourceInfo;
  getNews(): Promise<NewsItem[]>;
}