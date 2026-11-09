import { useEffect, useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight, BarChart3, CalendarDays, ChartNoAxesCombined, ClipboardList, Flag, GitCompareArrows, IdCard, Newspaper, Shield, SlidersHorizontal, Target, Trophy, Users, Activity } from "lucide-react";
import { Container } from "@/components/common/PageHeader";
import { EmptyState, RouteError } from "@/components/common/States";
import { SourceBar } from "@/components/common/SourceBar";
import { scheduleQuery, standingsQuery, newsQuery } from "@/lib/data/queries";
import { nextMatch } from "@/lib/data/derive";
import { seo } from "@/lib/seo";
import { MatchRow } from "@/components/match/MatchBits";
import { NewsCard } from "@/components/news/NewsCard";
import { splitSchedule } from "@/lib/data/derive";

export const Route=createFileRoute("/")({head:()=>seo("61Dakika — Trabzonspor Taraftar Merkezi","Trabzonspor maç merkezi, fikstür, kulüp, istatistikler ve taraftar araçları."),loader:async({context})=>{await Promise.allSettled([context.queryClient.ensureQueryData(scheduleQuery()),context.queryClient.ensureQueryData(standingsQuery()),context.queryClient.ensureQueryData(newsQuery())])},component:Home,errorComponent:RouteError});
const tiles=[
{to:"/maclar",title:"Maç Merkezi",desc:"Canlı takip, sonuçlar ve maç detayları",icon:Flag},
{to:"/ilk-11",title:"İlk 11 Oluşturucu",desc:"Kadronu kur, sahaya yerleştir ve paylaş",icon:ClipboardList},
{to:"/taktik",title:"Taktik Ekranı",desc:"Dizilişini oluştur ve taktiğini tasarla",icon:SlidersHorizontal},
{to:"/puan-durumu",title:"Puan Durumu ve Fikstür",desc:"Lig tablosu ve gelecek maçlar",icon:Trophy},
{to:"/skor-tahmini",title:"Maç Günü Skor Tahmini",desc:"Tahminini oluştur ve görsele dönüştür",icon:Target},
{to:"/oyuncu-karti",title:"Oyuncu Kartı",desc:"Kendi Trabzonspor oyuncu kartını tasarla",icon:IdCard},
{to:"/istatistikler",title:"Oyuncu İstatistikleri",desc:"Takım ve oyuncu performansları",icon:ChartNoAxesCombined},
{to:"/karsilastir",title:"Oyuncu Karşılaştırma",desc:"İki oyuncuyu yan yana kıyasla",icon:GitCompareArrows},
];
function Home(){
const {data:sched}=useSuspenseQuery(scheduleQuery()); const {data:news}=useSuspenseQuery(newsQuery());
const match=nextMatch(sched.data); const [now,setNow]=useState(Date.now());
useEffect(()=>{const id=window.setInterval(()=>setNow(Date.now()),1000);return()=>window.clearInterval(id)},[]);
const target=match?new Date(match.date).getTime():0; const diff=Math.max(0,target-now);
const days=Math.floor(diff/86400000),hours=Math.floor(diff%86400000/3600000),mins=Math.floor(diff%3600000/60000),secs=Math.floor(diff%60000/1000);
const {past,upcoming}=splitSchedule(sched.data);
return <main className="fan-home"><Container className="fan-container">
<div className="fan-matchbar"><div className="fan-next"><span className="fan-kicker">SIRADAKİ MAÇ</span>{match?<><div className="fan-fixture"><span>{match.home.name}</span><b>—</b><span>{match.away.name}</span></div><p>{match.competition.name} · {new Date(match.date).toLocaleString("tr-TR",{weekday:"long",day:"numeric",month:"long",hour:"2-digit",minute:"2-digit"})}{match.venue? " · "+match.venue:""}</p></>:<p>Yeni maç programı açıklandığında burada gösterilecek.</p>}</div>
{match?<div className="fan-countdown">{[[days,"GÜN"],[hours,"SAAT"],[mins,"DAKİKA"],[secs,"SANİYE"]].map(([v,l])=><div className="fan-countbox" key={l}><strong>{String(v).padStart(2,"0")}</strong><small>{l}</small></div>)}</div>:<div className="fan-countdown"><div className="fan-countbox"><strong>61</strong><small>DAKİKA</small></div></div>}
</div>
<section className="fan-grid">{tiles.map(t=><Link to={t.to} className="fan-tile" key={t.to}><span className="fan-tile-icon"><t.icon size={25}/></span><span className="fan-arrow"><ArrowUpRight size={17}/></span><div><h2>{t.title}</h2><p>{t.desc}</p></div></Link>)}</section>
<div className="fan-lower"><section><div className="fan-section-head"><div><span className="fan-kicker">SAHADAN</span><h2>Son maçlar</h2></div><Link to="/maclar">Tüm maçlar ↗</Link></div>{past.slice(0,4).length?past.slice(0,4).map(m=><MatchRow key={m.id} match={m}/>):<EmptyState title="Sonuç verisi bulunamadı"/>}<SourceBar className="mt-3" envelope={sched} queryKey={["schedule"]}/></section>
<section><div className="fan-section-head"><div><span className="fan-kicker">GÜNCEL</span><h2>Son haberler</h2></div><Link to="/haberler">Tüm haberler ↗</Link></div>{news.data.slice(0,3).map(n=><NewsCard key={n.id} item={n}/>)}{!news.data.length&&<EmptyState title="Haber bulunamadı"/>}<SourceBar className="mt-3" envelope={news} queryKey={["news"]}/></section></div>
<div className="fan-footer-note">Resmî olmayan taraftar platformudur. Maç ve istatistik verileri açık spor veri kaynaklarından sağlanır.</div>
</Container></main>}
