import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Container, PageHeader } from "@/components/common/PageHeader";
import { EmptyState, ListSkeleton, RouteError, Section } from "@/components/common/States";
import { SourceBar } from "@/components/common/SourceBar";
import { MatchRow } from "@/components/match/MatchBits";
import { scheduleQuery } from "@/lib/data/queries";
import { seo } from "@/lib/seo";
export const Route=createFileRoute("/takvim")({head:()=>seo("Trabzonspor maç takvimi","Trabzonspor'un açıklanan maç tarihleri ve fikstürü."),loader:({context})=>context.queryClient.ensureQueryData(scheduleQuery()).then(()=>undefined),component:Page,errorComponent:RouteError});
function Page(){return <Container className="py-8 sm:py-10"><PageHeader eyebrow="Sezon planı" title="Maç takvimi" description="Açıklanmış fikstür tarihleri. Saatler Türkiye saatine göre gösterilir."/><Section errorTitle="Takvim yüklenemedi" fallback={<ListSkeleton rows={7}/>}><Calendar/></Section></Container>}
function Calendar(){const {data:env}=useSuspenseQuery(scheduleQuery());const [month,setMonth]=useState("all");const months=useMemo(()=>[...new Set(env.data.map(m=>m.date.slice(0,7)))].sort(),[env.data]);const rows=env.data.filter(m=>month==="all"||m.date.startsWith(month));return <><div className="my-5 flex flex-wrap gap-2"><button onClick={()=>setMonth("all")} className={`rounded-full border px-4 py-2 text-sm ${month==="all"?"border-primary bg-primary text-primary-foreground":"border-border"}`}>Tüm aylar</button>{months.map(m=><button key={m} onClick={()=>setMonth(m)} className={`rounded-full border px-4 py-2 text-sm ${month===m?"border-primary bg-primary text-primary-foreground":"border-border"}`}>{new Intl.DateTimeFormat("tr-TR",{month:"long",year:"numeric",timeZone:"Europe/Istanbul"}).format(new Date(m+"-15T12:00:00Z"))}</button>)}</div>{rows.length?<div className="space-y-2">{rows.map(m=><MatchRow key={m.id} match={m}/>)}</div>:<EmptyState title="Bu takvimde maç yok" message="Kaynakta açıklanmış fikstür bulunmuyor."/>}<SourceBar className="mt-5" envelope={env} queryKey={["schedule"]}/></>}
