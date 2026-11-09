import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Container, PageHeader } from "@/components/common/PageHeader";
import { EmptyState, ListSkeleton, RouteError, Section } from "@/components/common/States";
import { SourceBar } from "@/components/common/SourceBar";
import { PlayerAvatar } from "@/components/player/PlayerAvatar";
import { POSITION_LABELS } from "@/lib/data/config";
import { squadQuery } from "@/lib/data/queries";
import type { PositionGroup } from "@/lib/data/types";
import { seo } from "@/lib/seo";
export const Route=createFileRoute("/kadro")({head:()=>seo("Trabzonspor kadrosu","Trabzonspor futbol A takımı oyuncuları ve mevki bilgileri."),loader:({context})=>context.queryClient.ensureQueryData(squadQuery()).then(()=>undefined),component:Page,errorComponent:RouteError});
function Page(){return <Container className="py-8 sm:py-10"><PageHeader eyebrow="A takım" title="Oyuncu kadrosu" description="Kaynakta bulunan oyuncular, mevkilerine göre listelenir."/><Section errorTitle="Kadro yüklenemedi" fallback={<ListSkeleton rows={8} height={84}/>}><Roster/></Section></Container>}
function Roster(){const {data:env}=useSuspenseQuery(squadQuery());const [group,setGroup]=useState("all");const players=useMemo(()=>env.data.filter(p=>group==="all"||p.position===group),[env.data,group]);return <><div className="my-5 flex flex-wrap gap-2">{[["all","Tümü"],...Object.entries(POSITION_LABELS).map(([k,v])=>[k,v.plural])].map(([k,v])=><button key={k} onClick={()=>setGroup(k)} className={`rounded-full border px-4 py-2 text-sm ${group===k?"border-primary bg-primary text-primary-foreground":"border-border"}`}>{v}</button>)}</div>{players.length?<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{players.map(p=><article key={p.id} className="surface flex items-center gap-3 p-4"><PlayerAvatar name={p.name} jersey={p.jersey} photo={p.photo} size={52}/><div className="min-w-0 flex-1"><h2 className="truncate font-semibold">{p.name}</h2><p className="text-sm text-muted-foreground">{POSITION_LABELS[p.position].label}{p.nationality? ` · ${p.nationality}`:""}</p></div><span className="font-display text-xl font-semibold text-primary">{p.jersey??"—"}</span></article>)}</div>:<EmptyState title="Oyuncu verisi bulunamadı" message="Sağlayıcı bu kadro için henüz veri döndürmedi."/>}<SourceBar className="mt-5" envelope={env} queryKey={["squad"]}/></>}
