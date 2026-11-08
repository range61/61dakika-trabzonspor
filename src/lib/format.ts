import { LOCALE, TIME_ZONE } from "./data/config";

const fmt = (opts: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat(LOCALE, { timeZone: TIME_ZONE, ...opts });

const dateLong = fmt({ day: "numeric", month: "long", weekday: "long" });
const dateLongYear = fmt({ day: "numeric", month: "long", year: "numeric" });
const dateShort = fmt({ day: "numeric", month: "short" });
const time = fmt({ hour: "2-digit", minute: "2-digit" });
const monthYear = fmt({ month: "long", year: "numeric" });
const dateTimeShort = fmt({ day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

const safe = (iso: string | null | undefined, f: Intl.DateTimeFormat) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : f.format(d);
};

/** "22 Kasım Pazar" */
export const formatDateLong = (iso: string) => safe(iso, dateLong);
/** "22 Kasım 2026" */
export const formatDateYear = (iso: string | null) => safe(iso, dateLongYear);
/** "22 Kas" */
export const formatDateShort = (iso: string) => safe(iso, dateShort);
/** "16:00" (Europe/Istanbul) */
export const formatTime = (iso: string) => safe(iso, time);
/** "Kasım 2026" */
export const formatMonthYear = (iso: string) => safe(iso, monthYear);
/** "8 Kas 20:31" */
export const formatDateTimeShort = (iso: string | null) => safe(iso, dateTimeShort);

/** Calendar date key (YYYY-MM-DD) in Istanbul time. */
export function istanbulDateKey(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  const parts = fmt({ year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

/** Month key (YYYY-MM) in Istanbul time. */
export const istanbulMonthKey = (iso: string | Date) => istanbulDateKey(iso).slice(0, 7);

export function signed(n: number) {
  return n > 0 ? `+${n}` : String(n);
}

export function trLower(s: string) {
  return s.toLocaleLowerCase("tr-TR");
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toLocaleUpperCase("tr-TR"))
    .join("");
}