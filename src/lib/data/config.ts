import type { Competition, NewsCategory, PositionGroup } from "./types";

/** Club the whole portal is about. ESPN team id for Trabzonspor. */
export const CLUB = {
  name: "Trabzonspor",
  espnId: "997",
  founded: 1967,
  city: "Trabzon",
  stadium: "Papara Park",
  colors: "Bordo-Mavi",
} as const;

export const TIME_ZONE = "Europe/Istanbul";
export const LOCALE = "tr-TR";

/** Competitions Trabzonspor is tracked in (ESPN league slugs). */
export const COMPETITIONS: Record<string, Competition> = {
  "tur.1": { id: "tur.1", name: "Süper Lig", short: "SL" },
  "uefa.europa.conf": { id: "uefa.europa.conf", name: "UEFA Konferans Ligi", short: "UKL" },
  "uefa.europa.conf_qual": { id: "uefa.europa.conf_qual", name: "UKL Elemeleri", short: "UKL-E" },
  "tur.cup": { id: "tur.cup", name: "Türkiye Kupası", short: "ZTK" },
  "uefa.europa": { id: "uefa.europa", name: "UEFA Avrupa Ligi", short: "UAL" },
  "uefa.champions": { id: "uefa.champions", name: "UEFA Şampiyonlar Ligi", short: "UŞL" },
};

/** Leagues whose team schedules are merged into the fixture list. */
export const TRACKED_COMPETITIONS = ["tur.1", "uefa.europa.conf", "tur.cup"] as const;

export function competitionFor(slugOrName: string | undefined | null): Competition {
  if (slugOrName && COMPETITIONS[slugOrName]) return COMPETITIONS[slugOrName];
  const n = (slugOrName ?? "").toLowerCase();
  if (n.includes("conference")) return COMPETITIONS["uefa.europa.conf"];
  if (n.includes("europa")) return COMPETITIONS["uefa.europa"];
  if (n.includes("champions")) return COMPETITIONS["uefa.champions"];
  if (n.includes("cup") || n.includes("kupa")) return COMPETITIONS["tur.cup"];
  if (n.includes("super lig")) return COMPETITIONS["tur.1"];
  return { id: slugOrName ?? "other", name: slugOrName ?? "Diğer", short: "—" };
}

/** Turkish display names for Süper Lig clubs (ESPN returns ASCII names). */
export const TEAM_NAMES_TR: Record<string, { name: string; short: string }> = {
  "997": { name: "Trabzonspor", short: "TS" },
  "432": { name: "Galatasaray", short: "GS" },
  "436": { name: "Fenerbahçe", short: "FB" },
  "1895": { name: "Beşiktaş", short: "BJK" },
  "132335": { name: "Amed SFK", short: "AMD" },
  "6870": { name: "Kasımpaşa", short: "KSP" },
  "995": { name: "Kocaelispor", short: "KOC" },
  "7914": { name: "Başakşehir", short: "İBFK" },
  "132334": { name: "Çorum FK", short: "ÇOR" },
  "789": { name: "Göztepe", short: "GÖZ" },
  "7656": { name: "Çaykur Rizespor", short: "RİZ" },
  "19267": { name: "Erzurumspor FK", short: "ERZ" },
  "9078": { name: "Alanyaspor", short: "ALN" },
  "996": { name: "Gençlerbirliği", short: "GB" },
  "7648": { name: "Konyaspor", short: "KON" },
  "20070": { name: "Gaziantep FK", short: "GFK" },
  "11429": { name: "Samsunspor", short: "SAM" },
  "20729": { name: "Eyüpspor", short: "EYP" },
};

export const POSITION_LABELS: Record<PositionGroup, { label: string; plural: string; short: string }> = {
  GK: { label: "Kaleci", plural: "Kaleciler", short: "KL" },
  DEF: { label: "Defans", plural: "Defans", short: "DF" },
  MID: { label: "Orta Saha", plural: "Orta Saha", short: "OS" },
  FWD: { label: "Forvet", plural: "Forvetler", short: "FV" },
};

export const NEWS_CATEGORIES: Record<NewsCategory, string> = {
  mac: "Maç",
  transfer: "Transfer",
  sakatlik: "Sakatlık & Ceza",
  avrupa: "Avrupa",
  kulup: "Kulüp",
  gundem: "Gündem",
};

/** Public RSS feeds. All headlines pass a strict Trabzonspor relevance check. */
export const NEWS_FEEDS = [
  { name: "61saat", home: "https://www.61saat.com", url: "https://www.61saat.com/rss", filter: true },
  { name: "A Haber", home: "https://www.ahaber.com.tr", url: "https://www.ahaber.com.tr/rss/trabzonspor.xml", filter: true },
  { name: "Fotomaç", home: "https://www.fotomac.com.tr", url: "https://www.fotomac.com.tr/rss/trabzonspor.xml", filter: true },
  { name: "A Spor", home: "https://www.aspor.com.tr", url: "https://www.aspor.com.tr/rss/trabzonspor.xml", filter: true },
  { name: "TRT Haber", home: "https://www.trthaber.com", url: "https://www.trthaber.com/spor_articles.rss", filter: true },
  { name: "Hürriyet", home: "https://www.hurriyet.com.tr", url: "https://www.hurriyet.com.tr/rss/spor", filter: true },
] as const;
