import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Container, PageHeader } from "@/components/common/PageHeader";
import { EmptyState, ListSkeleton, RouteError, Section } from "@/components/common/States";
import { SourceBar } from "@/components/common/SourceBar";
import { MatchRow } from "@/components/match/MatchBits";
import { scheduleQuery } from "@/lib/data/queries";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/maclar/")({
  head: () => seo("Trabzonspor maçları", "Trabzonspor fikstürü, maç sonuçları ve canlı maç merkezi."),
  loader: ({ context }) => context.queryClient.ensureQueryData(scheduleQuery()).then(() => undefined),
  component: MatchesPage,
  errorComponent: RouteError,
});

function MatchesPage() {
  return <Container className="py-8 sm:py-10"><PageHeader eyebrow="Maç merkezi" title="Fikstür ve sonuçlar" description="Trabzonspor'un oynadığı, oynayacağı ve devam eden maçlar." />
    <Section errorTitle="Maç verileri yüklenemedi" fallback={<ListSkeleton rows={7} />}><Matches /></Section>
  </Container>;
}
function Matches() {
  const { data: env } = useSuspenseQuery(scheduleQuery());
  const [filter, setFilter] = useState("all");
  const rows = useMemo(() => [...env.data].filter(m => filter === "all" || (filter === "live" ? m.state === "in" : filter === "upcoming" ? m.state === "pre" || m.state === "postponed" : m.state === "post")).sort((a,b) => a.date.localeCompare(b.date) * (filter === "past" ? -1 : 1)), [env.data, filter]);
  return <>
    <div className="my-5 flex flex-wrap gap-2">{[["all","Tümü"],["live","Canlı"],["upcoming","Yaklaşan"],["past","Oynanan"]].map(([v,l]) => <button key={v} onClick={() => setFilter(v)} className={`rounded-full border px-4 py-2 text-sm ${filter===v ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground"}`}>{l}</button>)}</div>
    {rows.length ? <div className="space-y-2">{rows.map(m => <MatchRow key={m.id} match={m} />)}</div> : <EmptyState title="Bu filtrede maç yok" message="Kaynakta gösterilecek maç bulunamadı." />}
    <SourceBar className="mt-5" envelope={env} queryKey={["schedule"]} live={rows.some(m=>m.state==="in")} />
  </>;
}
