import { Link } from "@tanstack/react-router";
import { ChevronRight, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { TeamCrest } from "@/components/common/TeamCrest";
import { Badge } from "@/components/ui/badge";
import { formatDateLong, formatDateShort, formatTime } from "@/lib/format";
import type { Match, MatchOutcome } from "@/lib/data/types";
import { cn } from "@/lib/utils";

const OUTCOME: Record<MatchOutcome, { variant: "win" | "draw" | "loss"; label: string }> = {
  G: { variant: "win", label: "Galibiyet" },
  B: { variant: "draw", label: "Beraberlik" },
  M: { variant: "loss", label: "Mağlubiyet" },
};

export function OutcomeBadge({ outcome, className }: { outcome: MatchOutcome; className?: string }) {
  const o = OUTCOME[outcome];
  return (
    <Badge variant={o.variant} className={cn("h-6 w-6 justify-center rounded-md p-0 font-display text-xs", className)} title={o.label}>
      {outcome}
    </Badge>
  );
}

export function FormStrip({ form }: { form: MatchOutcome[] }) {
  if (!form.length) return <span className="text-sm text-muted-foreground">—</span>;
  return (
    <div className="flex gap-1" aria-label={`Son maçlar: ${form.join(", ")}`}>
      {form.map((o, i) => (
        <OutcomeBadge key={i} outcome={o} />
      ))}
    </div>
  );
}

export function LiveBadge({ clock }: { clock?: string | null }) {
  return (
    <Badge variant="live" className="gap-1.5">
      <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground animate-live" />
      CANLI{clock ? ` · ${clock}` : ""}
    </Badge>
  );
}

export function CompetitionTag({ match }: { match: Match }) {
  return (
    <span className="inline-flex items-center rounded border border-border px-1.5 py-0.5 font-display text-[0.7rem] font-semibold uppercase tracking-wide text-muted-foreground">
      {match.competition.short}
    </span>
  );
}

/** One fixture/result row; links to the match centre. */
export function MatchRow({ match, showDate = true }: { match: Match; showDate?: boolean }) {
  const m = match;
  const scored = m.home.score != null && m.away.score != null;
  return (
    <Link
      to="/maclar/$matchId"
      params={{ matchId: m.id }}
      className="surface surface-interactive group grid grid-cols-[3.25rem_1fr_auto] items-center gap-3 px-3 py-3 sm:grid-cols-[5.5rem_1fr_auto] sm:px-4"
    >
      <div className="min-w-0 text-xs leading-tight text-muted-foreground">
        {showDate && <div className="font-medium text-foreground">{formatDateShort(m.date)}</div>}
        <div className="tabular">{m.state === "pre" ? formatTime(m.date) : m.statusText}</div>
        <div className="mt-1 hidden sm:block">
          <CompetitionTag match={m} />
        </div>
      </div>
      <div className="min-w-0 space-y-1.5">
        <TeamLine name={m.home.name} logo={m.home.logo} score={m.home.score} bold={!m.isHome ? false : true} winner={scored && m.home.score! > m.away.score!} />
        <TeamLine name={m.away.name} logo={m.away.logo} score={m.away.score} bold={!m.isHome} winner={scored && m.away.score! > m.home.score!} />
      </div>
      <div className="flex items-center gap-2">
        {m.state === "in" ? <LiveBadge clock={m.clock} /> : m.outcome ? <OutcomeBadge outcome={m.outcome} /> : m.state === "postponed" ? <Badge variant="muted">Ertelendi</Badge> : null}
        <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}

function TeamLine({ name, logo, score, bold, winner }: { name: string; logo: string | null; score: number | null; bold: boolean; winner: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <TeamCrest name={name} logo={logo} size={20} />
      <span className={cn("min-w-0 flex-1 truncate text-sm", bold ? "font-semibold text-foreground" : "text-foreground/80")}>{name}</span>
      {score != null && <span className={cn("tabular w-5 text-right font-display text-base font-semibold", winner ? "text-foreground" : "text-muted-foreground")}>{score}</span>}
    </div>
  );
}

function useCountdown(iso: string) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  if (now == null) return null;
  const diff = Math.max(0, new Date(iso).getTime() - now);
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff / 3_600_000) % 24),
    minutes: Math.floor((diff / 60_000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    done: diff === 0,
  };
}

export function Countdown({ iso, compact = false }: { iso: string; compact?: boolean }) {
  const c = useCountdown(iso);
  const cells: [string, number | undefined][] = [
    ["Gün", c?.days],
    ["Saat", c?.hours],
    ["Dakika", c?.minutes],
    ["Saniye", c?.seconds],
  ];
  return (
    <div className="grid grid-cols-4 gap-2" role="timer" aria-label="Maça kalan süre">
      {cells.map(([label, v]) => (
        <div key={label} className={cn("rounded-lg border border-border bg-background text-center", compact ? "px-1 py-1.5" : "px-2 py-2.5")}>
          <div className={cn("tabular font-display font-semibold text-foreground", compact ? "text-xl" : "text-2xl sm:text-3xl")}>
            {v == null ? "––" : String(v).padStart(2, "0")}
          </div>
          <div className="text-[0.65rem] uppercase tracking-wider text-muted-foreground">{label}</div>
        </div>
      ))}
    </div>
  );
}

/** Big featured match card: next (or live) fixture with countdown. */
export function FeaturedMatch({ match }: { match: Match }) {
  const m = match;
  const live = m.state === "in";
  return (
    <article className="surface claret-rule overflow-hidden p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="eyebrow">{live ? "Şu an oynanıyor" : "Sıradaki maç"}</p>
        <div className="flex items-center gap-2">
          <CompetitionTag match={m} />
          {live && <LiveBadge clock={m.clock} />}
        </div>
      </div>
      <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-6">
        <TeamBlock name={m.home.name} logo={m.home.logo} />
        <div className="text-center">
          {live || m.state === "post" ? (
            <div className="tabular font-display text-4xl font-semibold text-foreground sm:text-5xl">
              {m.home.score ?? 0}
              <span className="mx-1.5 text-muted-foreground">–</span>
              {m.away.score ?? 0}
            </div>
          ) : (
            <div className="font-display text-3xl font-semibold text-foreground sm:text-4xl">{formatTime(m.date)}</div>
          )}
          <div className="mt-1 text-xs text-muted-foreground">{formatDateLong(m.date)}</div>
        </div>
        <TeamBlock name={m.away.name} logo={m.away.logo} />
      </div>
      {m.venue && (
        <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" /> {m.venue} · {m.competition.name}
        </p>
      )}
      {m.state === "pre" && (
        <div className="mx-auto mt-5 max-w-sm">
          <Countdown iso={m.date} />
        </div>
      )}
      <div className="mt-5 flex justify-center">
        <Link
          to="/maclar/$matchId"
          params={{ matchId: m.id }}
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          Maç merkezine git <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}

function TeamBlock({ name, logo }: { name: string; logo: string | null }) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-2 text-center">
      <TeamCrest name={name} logo={logo} size={56} />
      <span className="w-full truncate font-display text-base font-semibold uppercase text-foreground sm:text-lg">{name}</span>
    </div>
  );
}