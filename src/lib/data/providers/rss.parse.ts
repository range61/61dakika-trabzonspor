/* Pure RSS parsing + Turkish keyword categorisation (no network, workerd-safe: no DOMParser). */
import type { NewsCategory, NewsItem } from "../types";

const ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  rsquo: "’",
  lsquo: "‘",
  rdquo: "”",
  ldquo: "“",
  hellip: "…",
  ndash: "–",
  mdash: "—",
};

export function decodeEntities(s: string): string {
  return s.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (m, code: string) => {
    if (code[0] === "#") {
      const n = code[1]?.toLowerCase() === "x" ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
      return Number.isFinite(n) ? String.fromCodePoint(n) : m;
    }
    return ENTITIES[code.toLowerCase()] ?? m;
  });
}

const stripCdata = (s: string) => s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1");
const stripTags = (s: string) => s.replace(/<[^>]*>/g, " ");
const clean = (s: string) => decodeEntities(stripTags(decodeEntities(stripCdata(s)))).replace(/\s+/g, " ").trim();

function tag(xml: string, name: string): string {
  const m = xml.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, "i"));
  return m ? m[1] : "";
}

/** Keep the complete publisher-supplied description; visual previews are clamped by the card UI. */
export function excerpt(text: string): string {
  return text.trim();
}

function isTeaser(text: string): boolean {
  const value = text.trim();
  if (!value) return true;
  return /(?:…|\\.{2,}|devamı için|devamı haberimizde|işte detaylar|detaylar haberimizde|tıklayınız|tıklayın)\\s*$/i.test(value)
    || /(?:devamı|haberin tamamı) için (?:tıklayınız|tıklayın)/i.test(value);
}

/** FNV-1a 32-bit hash → base36. Stable id for a link. */
export function hashId(s: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(36);
}

const lower = (s: string) => s.toLocaleLowerCase("tr-TR");

const RULES: [NewsCategory, RegExp][] = [
  ["transfer", /transfer|imza|sözleşme|bonservis|kiralık|teklif|ayrılık|anlaşma sağlandı|yeni adres/],
  ["sakatlik", /sakat|tedavi|ameliyat|cezalı|ceza aldı|pfdk|kırmızı kart cezası|yaralandı/],
  ["avrupa", /avrupa|konferans ligi|uefa|şampiyonlar ligi|avrupa ligi/],
  ["mac", /maç|gol|skor|galibiyet|mağlubiyet|beraber|ilk 11|kadro|hakem|özet|deplasman|puan durumu|derbi|\d+-\d+/],
  ["kulup", /başkan|yönetim|kongre|divan|kulüp|tesis|bütçe|sponsor|açıklama/],
];

export function categorize(title: string, text = ""): NewsCategory {
  const t = lower(`${title} ${text}`);
  for (const [cat, re] of RULES) if (re.test(t)) return cat;
  return "gundem";
}

export function parseRss(
  xml: string,
  source: { name: string; home: string },
  opts: { filter?: RegExp; exclude?: RegExp; allowExcluded?: RegExp } = {},
): NewsItem[] {
  const items = xml.match(/<item[\s>][\s\S]*?<\/item>/gi) ?? [];
  const out: NewsItem[] = [];
  for (const raw of items) {
    const title = clean(tag(raw, "title"));
    const link = clean(tag(raw, "link")) || clean(tag(raw, "guid"));
    if (!title || !/^https?:\/\//.test(link)) continue;
    const desc = clean(tag(raw, "description"))
      .replace(/(?:devamı|detaylar|haberin devamı) için (?:tıklayınız|tıklayın|okuyunuz|buraya tıklayın)[.!…]*/gi, "")
      .replace(/\s+/g, " ")
      .trim();
    if (opts.filter && !opts.filter.test(lower(title))) continue;
    if (opts.exclude?.test(lower(title)) && !opts.allowExcluded?.test(lower(title))) continue;
    // Prefer full body supplied directly in RSS. Never present an unfinished teaser as a complete story.
    const encodedBody = tag(raw, "content:encoded") || tag(raw, "content");
    const articleContent = encodedBody ? clean(encodedBody) : null;
    const usableBody = articleContent && articleContent.length > 250 ? articleContent : null;
    if (!usableBody && isTeaser(desc)) continue;
    const pub = clean(tag(raw, "pubDate"));
    const d = pub ? new Date(pub) : null;
    out.push({
      id: hashId(link),
      title,
      excerpt: excerpt(desc && lower(desc) !== lower(title) ? desc : ""),
      articleContent: usableBody,
      url: link,
      source: { name: source.name, url: source.home },
      publishedAt: d && !Number.isNaN(d.getTime()) ? d.toISOString() : null,
      category: categorize(title, desc),
    });
  }
  return out;
}

/** Merge feeds: de-duplicate near-identical headlines, newest first. */
export function mergeNews(lists: NewsItem[][], limit = 90): NewsItem[] {
  const seen = new Set<string>();
  const all = lists
    .flat()
    .sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""));
  const out: NewsItem[] = [];
  for (const n of all) {
    const key = lower(n.title).replace(/[^a-zçğıöşü0-9]/g, "").slice(0, 60);
    if (seen.has(key) || seen.has(n.id)) continue;
    seen.add(key);
    seen.add(n.id);
    out.push(n);
    if (out.length >= limit) break;
  }
  return out;
}