import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, BarChart3, CalendarDays, ClipboardList, Flag, GitCompareArrows, Target, Trophy, Users } from "lucide-react";
import { Container, SectionTitle } from "@/components/common/PageHeader";
import { EmptyState, ListSkeleton, RouteError, Section } from "@/components/common/States";
import { SourceBar } from "@/components/common/SourceBar";
import { FeaturedMatch, FormStrip, MatchRow } from "@/components/match/MatchBits";
import { NewsCard } from "@/components/news/NewsCard";
import { StandingsTable } from "@/components/standings/StandingsTable";
import { Skeleton } from "@/components/ui/skeleton";
import { clubRow, nextMatch, recentForm, splitSchedule, tableWindow } from "@/lib/data/derive";
import { newsQuery, scheduleQuery, standingsQuery } from "@/lib/data/queries";
import { seo } from "@/lib/seo";
import { signed } from "@/lib/format";

export const Route = createFileRoute("/")({
  head: () =>
    seo(
      "61Dakika — Trabzonspor maç, fikstür ve haber portalı",
      "Sıradaki Trabzonspor maçı, son sonuçlar, Süper Lig puan durumu ve kaynaklı son haberler tek ekranda.",
    ),
  loader: async ({ context: { queryClient } }) => {
    // Sections fail independently, so a slow or broken source never blanks the page.
    await Promise.allSettled([
      queryClient.ensureQueryData(scheduleQuery()),
      queryClient.ensureQueryData(standingsQuery()),
      queryClient.ensureQueryData(newsQuery()),
    ]);
  },
  component: Home,
  errorComponent: RouteError,
});

const QUICK = [
  { to: "/maclar", label: "Maç Merkezi", desc: "Fikstür, sonuçlar, canlı takip", icon: Flag },
  { to: "/puan-durumu", label: "Puan Durumu", desc: "Süper Lig tablosu", icon: Trophy },
  { to: "/kadro", label: "Kadro", desc: "Oyuncular ve mevkiler", icon: Users },
  { to: "/istatistikler", label: "İstatistikler", desc: "Gol ve asist liderleri", icon: BarChart3 },
  { to: "/takvim", label: "Takvim", desc: "Aylık maç takvimi", icon: CalendarDays },
  { to: "/ilk-11", label: "İlk 11 Oluşturucu", desc: "Kadronu kur, indir", icon: ClipboardList },
  { to: "/skor-tahmini", label: "Skor Tahmini", desc: "Maç günü tahmini", icon: Target },
  { to: "/karsilastir", label: "Karşılaştır", desc: "İki oyuncuyu kıyasla", icon: GitCompareArrows },
] as const;

function Home() {
  return (
    <Container className="py-8 sm:py-10">
      <div className="mb-6">
        <p className="eyebrow">Trabzonspor taraftar portalı</p>
        <h1 className="mt-1 font-display text-3xl font-semibold uppercase text-foreground sm:text-4xl">Bugün Trabzonspor</h1>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Section errorTitle="Sıradaki maç yüklenemedi" fallback={<Skeleton className="h-80 w-full rounded-xl" />}>
            <NextMatchBlock />
          </Section>
        </div>
        <Section errorTitle="Sezon özeti yüklenemedi" fallback={<Skeleton className="h-80 w-full rounded-xl" />}>
          <SeasonSnapshot />
        </Section>
      </div>

      <nav aria-label="Hızlı erişim" className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {QUICK.map((q) => (
          <Link key={q.to} to={q.to} className="surface surface-interactive group flex flex-col gap-3 p-4">
            <div className="flex items-center justify-between">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary-soft text-primary">
                <q.icon className="h-[18px] w-[18px]" />
              </span>
              <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
            </div>
            <div className="min-w-0">
              <p className="font-display text-base font-semibold uppercase leading-tight text-foreground">{q.label}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{q.desc}</p>
            </div>
          </Link>
        ))}
      </nav>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <section>
          <SectionTitle title="Son sonuçlar" action={<MoreLink to="/maclar" label="Tüm maçlar" />} />
          <Section errorTitle="Sonuçlar yüklenemedi" fallback={<ListSkeleton rows={5} />}>
            <MatchList kind="past" />
          </Section>
        </section>
        <section>
          <SectionTitle title="Yaklaşan maçlar" action={<MoreLink to="/takvim" label="Takvim" />} />
          <Section errorTitle="Fikstür yüklenemedi" fallback={<ListSkeleton rows={5} />}>
            <MatchList kind="upcoming" />
          </Section>
        </section>
      </div>

      <section className="mt-10">
        <SectionTitle title="Son haberler" action={<MoreLink to="/haberler" label="Tüm haberler" />} />
        <Section errorTitle="Haberler yüklenemedi" fallback={<ListSkeleton rows={3} height={140} />}>
          <LatestNews />
        </Section>
      </section>
    </Container>
  );
}

function MoreLink({ to, label }: { to: "/maclar" | "/takvim" | "/haberler" | "/puan-durumu"; label: string }) {
  return (
    <Link to={to} className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
      {label} <ArrowRight className="h-3.5 w-3.5" />
    </Link>
  );
}

function NextMatchBlock() {
  const { data: env } = useSuspenseQuery(scheduleQuery());
  const m = nextMatch(env.data);
  return (
    <div className="space-y-2">
      {m ? (
        <FeaturedMatch match={m} />
      ) : (
        <EmptyState title="Planlanmış maç yok" message="Kaynakta şu an için açıklanmış bir sonraki maç bulunmuyor." />
      )}
      <SourceBar envelope={env} queryKey={["schedule"]} live={m?.state === "in"} />
    </div>
  );
}

function SeasonSnapshot() {
  const { data: st } = useSuspenseQuery(standingsQuery());
  const { data: sched } = useSuspenseQuery(scheduleQuery());
  const row = clubRow(st.data.rows);
  const form = recentForm(sched.data.filter((m) => m.competition.id === "tur.1"));
  return (
    <aside className="surface flex h-full flex-col p-5" aria-label="Sezon özeti">
      <p className="eyebrow">
        {st.data.competition.name} · {st.data.season}
      </p>
      {row ? (
        <>
          <div className="mt-3 flex items-end gap-4">
            <div>
              <div className="font-display text-5xl font-semibold leading-none text-primary tabular">{row.rank}.</div>
              <div className="mt-1 text-xs text-muted-foreground">sıra</div>
            </div>
            <div className="grid flex-1 grid-cols-3 gap-2 text-center">
              <Stat label="Puan" value={row.points} />
              <Stat label="Maç" value={row.played} />
              <Stat label="Averaj" value={signed(row.goalDiff)} />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground">Ligde son 5</span>
            <FormStrip form={form} />
          </div>
          <div className="mt-4">
            <StandingsTable rows={tableWindow(st.data.rows, 5)} compact />
          </div>
        </>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">Trabzonspor tabloda bulunamadı.</p>
      )}
      <Link to="/puan-durumu" className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
        Tam puan durumu <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </aside>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg bg-muted px-2 py-2">
      <div className="font-display text-xl font-semibold tabular text-foreground">{value}</div>
      <div className="text-[0.65rem] uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}

function MatchList({ kind }: { kind: "past" | "upcoming" }) {
  const { data: env } = useSuspenseQuery(scheduleQuery());
  const { past, upcoming } = splitSchedule(env.data);
  const list = (kind === "past" ? past : upcoming).slice(0, 5);
  if (!list.length)
    return <EmptyState title={kind === "past" ? "Henüz oynanmış maç yok" : "Yaklaşan maç yok"} />;
  return (
    <div className="space-y-2">
      {list.map((m) => (
        <MatchRow key={m.id} match={m} />
      ))}
    </div>
  );
}

function LatestNews() {
  const { data: env } = useSuspenseQuery(newsQuery());
  const items = env.data.slice(0, 6);
  if (!items.length) return <EmptyState title="Haber bulunamadı" message="Kaynaklarda şu an Trabzonspor haberi yok." />;
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((n) => (
          <NewsCard key={n.id} item={n} />
        ))}
      </div>
      <SourceBar className="mt-3" envelope={env} queryKey={["news"]} />
    </>
  );
}