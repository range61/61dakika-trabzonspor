import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Container, PageHeader } from "@/components/common/PageHeader";
import { ListSkeleton, RouteError, Section } from "@/components/common/States";
import { SourceBar } from "@/components/common/SourceBar";
import { StandingsTable, ZoneLegend } from "@/components/standings/StandingsTable";
import { standingsQuery } from "@/lib/data/queries";
import { seo } from "@/lib/seo";
export const Route = createFileRoute("/puan-durumu")({ head:()=>seo("Süper Lig puan durumu","Trabzonspor ve Süper Lig takımlarının güncel puan durumu."), loader:({context})=>context.queryClient.ensureQueryData(standingsQuery()).then(()=>undefined), component:Page, errorComponent:RouteError });
function Page(){return <Container className="py-8 sm:py-10"><PageHeader eyebrow="Lig tablosu" title="Puan durumu" description="Süper Lig sıralaması ve takım istatistikleri."/><Section errorTitle="Puan durumu yüklenemedi" fallback={<ListSkeleton rows={18}/> }><Table/></Section></Container>}
function Table(){const {data:env}=useSuspenseQuery(standingsQuery());return <><p className="my-4 text-sm text-muted-foreground">{env.data.competition.name} · Sezon {env.data.season}</p><StandingsTable rows={env.data.rows}/><ZoneLegend/><SourceBar className="mt-5" envelope={env} queryKey={["standings"]}/></>}
