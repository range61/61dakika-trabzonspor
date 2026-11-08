import { CLUB } from "@/lib/data/config";
import type { StandingRow } from "@/lib/data/types";
import { signed } from "@/lib/format";
import { cn } from "@/lib/utils";
import { TeamCrest } from "@/components/common/TeamCrest";

const ZONE_BAR: Record<NonNullable<StandingRow["zone"]>, string> = {
  cl: "bg-navy",
  clq: "bg-sky",
  el: "bg-chart-4",
  ecl: "bg-chart-5",
  rel: "bg-loss",
};

export function StandingsTable({ rows, compact = false }: { rows: StandingRow[]; compact?: boolean }) {
  return (
    <div className="surface overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-0 text-sm">
          <caption className="sr-only">Süper Lig puan durumu</caption>
          <thead>
            <tr className="border-b border-border text-left text-[0.7rem] uppercase tracking-wider text-muted-foreground">
              <th scope="col" className="w-10 py-2.5 pl-3 pr-1 font-medium">#</th>
              <th scope="col" className="py-2.5 pr-2 font-medium">Takım</th>
              <th scope="col" className="px-1.5 py-2.5 text-center font-medium" title="Oynanan">O</th>
              {!compact && (
                <>
                  <th scope="col" className="hidden px-1.5 py-2.5 text-center font-medium sm:table-cell" title="Galibiyet">G</th>
                  <th scope="col" className="hidden px-1.5 py-2.5 text-center font-medium sm:table-cell" title="Beraberlik">B</th>
                  <th scope="col" className="hidden px-1.5 py-2.5 text-center font-medium sm:table-cell" title="Mağlubiyet">M</th>
                  <th scope="col" className="hidden px-1.5 py-2.5 text-center font-medium md:table-cell" title="Atılan">A</th>
                  <th scope="col" className="hidden px-1.5 py-2.5 text-center font-medium md:table-cell" title="Yenilen">Y</th>
                </>
              )}
              <th scope="col" className="px-1.5 py-2.5 text-center font-medium" title="Averaj">AV</th>
              <th scope="col" className="py-2.5 pl-1.5 pr-3 text-center font-medium" title="Puan">P</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const us = r.team.id === CLUB.espnId;
              return (
                <tr
                  key={r.team.id}
                  className={cn("border-b border-border last:border-0", us && "bg-primary-soft")}
                  aria-current={us ? "true" : undefined}
                >
                  <td className="relative py-2.5 pl-3 pr-1 tabular text-muted-foreground">
                    {r.zone && <span className={cn("absolute inset-y-1 left-0 w-1 rounded-r", ZONE_BAR[r.zone])} title={r.note ?? ""} />}
                    {r.rank}
                  </td>
                  <td className="max-w-0 py-2.5 pr-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <TeamCrest name={r.team.name} logo={r.team.logo} size={20} />
                      <span className={cn("truncate", us ? "font-semibold text-primary" : "text-foreground")}>{r.team.name}</span>
                    </div>
                  </td>
                  <td className="px-1.5 py-2.5 text-center tabular">{r.played}</td>
                  {!compact && (
                    <>
                      <td className="hidden px-1.5 py-2.5 text-center tabular sm:table-cell">{r.won}</td>
                      <td className="hidden px-1.5 py-2.5 text-center tabular sm:table-cell">{r.drawn}</td>
                      <td className="hidden px-1.5 py-2.5 text-center tabular sm:table-cell">{r.lost}</td>
                      <td className="hidden px-1.5 py-2.5 text-center tabular md:table-cell">{r.goalsFor}</td>
                      <td className="hidden px-1.5 py-2.5 text-center tabular md:table-cell">{r.goalsAgainst}</td>
                    </>
                  )}
                  <td className="px-1.5 py-2.5 text-center tabular text-muted-foreground">{signed(r.goalDiff)}</td>
                  <td className="py-2.5 pl-1.5 pr-3 text-center font-display text-base font-semibold tabular">{r.points}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ZoneLegend() {
  const items: [NonNullable<StandingRow["zone"]>, string][] = [
    ["cl", "Şampiyonlar Ligi"],
    ["clq", "ŞL elemesi"],
    ["el", "Avrupa Ligi elemesi"],
    ["ecl", "Konferans Ligi elemesi"],
    ["rel", "Küme düşme"],
  ];
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
      {items.map(([z, l]) => (
        <li key={z} className="inline-flex items-center gap-1.5">
          <span className={cn("h-2.5 w-1 rounded", ZONE_BAR[z])} /> {l}
        </li>
      ))}
    </ul>
  );
}