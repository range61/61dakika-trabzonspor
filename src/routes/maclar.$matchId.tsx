import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Container, PageHeader } from "@/components/common/PageHeader";
import { EmptyState, ListSkeleton, RouteError, Section } from "@/components/common/States";
import { SourceBar } from "@/components/common/SourceBar";
import { LiveBadge } from "@/components/match/MatchBits";
import { TeamCrest } from "@/components/common/TeamCrest";
import { matchQuery } from "@/lib/data/queries";
import { formatDateLong, formatTime } from "@/lib/format";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/maclar/$matchId")({
  head: () => seo("Maç merkezi | 61Dakika", "Trabzonspor maç skoru, olaylar ve istatistikler."),
  loader: ({ context, params }) => context.queryClient.ensureQueryData(matchQuery(params.matchId)).then(() => undefined),
  component: Page,
  errorComponent: RouteError,
});
function Page(){const {matchId}=Route.useParams();return <Container className="py-8 sm:py-10"><Link to="/maclar" className="mb-5 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"><ArrowLeft className="h-4 w-4"/> Maçlara dön</Link><Section errorTitle="Maç detayı yüklenemedi" fallback={<ListSkeleton rows={6}/>}><Detail matchId={matchId}/></Section></Container>}
function Detail({matchId}:{matchId:string}){const {data:env}=useSuspenseQuery(matchQuery(matchId));const m=env.data;if(!m)return <EmptyState title="Maç bulunamadı" message="Bu maç için sağlayıcıda detay verisi bulunamadı."/>;return <><PageHeader eyebrow={m.competition.name} title="Maç merkezi" description={formatDateLong(m.date)}/><article className="surface mt-5 p-5 sm:p-8"><div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3"><div className="flex flex-col items-center gap-2 text-center"><TeamCrest name={m.home.name} logo={m.home.logo} size={64}/><b>{m.home.name}</b></div><div className="text-center">{m.state==="in"?<LiveBadge clock={m.clock}/>:<p className="text-xs text-muted-foreground">{m.statusText}</p>}<p className="mt-2 font-display text-4xl font-bold tabular">{m.home.score??"—"} : {m.away.score??"—"}</p><p className="mt-1 text-xs text-muted-foreground">{formatTime(m.date)}</p></div><div className="flex flex-col items-center gap-2 text-center"><TeamCrest name={m.away.name} logo={m.away.logo} size={64}/><b>{m.away.name}</b></div></div></article><div className="mt-6 grid gap-5 lg:grid-cols-2"><section className="surface p-5"><h2 className="font-display text-lg font-semibold uppercase">Maç olayları</h2>{m.events.length?<div className="mt-3 space-y-3">{m.events.map((e,i)=><div key={i} className="flex gap-3 border-b border-border pb-2 text-sm"><b className="tabular">{e.minute}'</b><span>{e.type==="goal"?"Gol":e.type==="penalty"?"Penaltı":e.type==="own-goal"?"Kendi kalesine":e.type==="yellow"?"Sarı kart":e.type==="red"?"Kırmızı kart":"Oyuncu değişikliği"}</span><span className="ml-auto text-muted-foreground">{e.players.join(", ")}</span></div>)}</div>:<EmptyState title="Olay verisi yok"/>}</section><section className="surface p-5"><h2 className="font-display text-lg font-semibold uppercase">Maç istatistikleri</h2>{m.stats.length?<div className="mt-3 space-y-4">{m.stats.map(s=><div key={s.key}><div className="mb-1 flex justify-between text-sm tabular"><b>{s.home}{s.unit??""}</b><span className="text-muted-foreground">{s.label}</span><b>{s.away}{s.unit??""}</b></div><div className="flex h-2 overflow-hidden rounded-full bg-muted"><span className="bg-primary" style={{width:`${s.home/(s.home+s.away||1)*100}%`}}/><span className="bg-navy" style={{width:`${s.away/(s.home+s.away||1)*100}%`}}/></div></div>)}</div>:<EmptyState title="İstatistik verisi yok"/>}</section></div><SourceBar className="mt-5" envelope={env} queryKey={["match",matchId]} live={m.state==="in"}/></>}
