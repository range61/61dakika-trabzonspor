import { useEffect, useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight, BarChart3, CalendarDays, ChartNoAxesCombined, ClipboardList, Flag, GitCompareArrows, IdCard, SlidersHorizontal, Target, Trophy } from "lucide-react";
import { Container } from "@/components/common/PageHeader";
import { scheduleQuery } from "@/lib/data/queries";
import { nextMatch } from "@/lib/data/derive";
import { seo } from "@/lib/seo";
import { TeamCrest } from "@/components/common/TeamCrest";

export const Route=createFileRoute("/")({head:()=>seo("61Dakika — Trabzonspor Taraftar Merkezi","Trabzonspor maç merkezi ve taraftar araçları."),loader:async({context})=>{await context.queryClient.ensureQueryData(scheduleQuery())},component:Home});
const tiles=[
{to:"/maclar",title:"Maç Merkezi",desc:"Canlı takip, istatistik, son 20 maç",icon:Flag},
{to:"/ilk-11",title:"İlk 11 Oluşturucu",desc:"Kadronu kur, görselini indir",icon:ClipboardList},
{to:"/taktik",title:"Taktik Ekranı",desc:"Taktik çiz, GIF ve MP4 yap",icon:SlidersHorizontal},
{to:"/puan-durumu",title:"Puan Durumu ve Gelecek Maçlar",desc:"Lig tablosu ve gelecek maçlar",icon:Trophy},
{to:"/skor-tahmini",title:"Maç Günü Skor Tahmini",desc:"Skor tahminini görsele dök",icon:Target},
{to:"/oyuncu-karti",title:"Kartını Oluştur",desc:"Kendi oyuncu kartını tasarla",icon:IdCard},
{to:"/istatistikler",title:"Oyuncu İstatistikleri",desc:"Oyuncuların sezon istatistikleri",icon:ChartNoAxesCombined},
{to:"/karsilastir",title:"Oyuncu Karşılaştırma",desc:"İki oyuncuyu yan yana kıyasla",icon:GitCompareArrows},
];
function Home(){
const {data:sched}=useSuspenseQuery(scheduleQuery());
const match=nextMatch(sched.data);
const [now,setNow]=useState(Date.now());
useEffect(()=>{const id=window.setInterval(()=>setNow(Date.now()),1000);return()=>window.clearInterval(id)},[]);
const target=match?new Date(match.date).getTime():0;
const diff=Math.max(0,target-now);
const days=Math.floor(diff/86400000),hours=Math.floor(diff%86400000/3600000),mins=Math.floor(diff%3600000/60000),secs=Math.floor(diff%60000/1000);
return <main className="fan-home"><Container className="fan-container">
<div className="fan-matchbar"><div className="fan-next"><span className="fan-kicker">SIRADAKİ MAÇ</span>{match?<><div className="fan-fixture"><TeamCrest name={match.home.name} logo={match.home.logo} size={30}/><span>{match.home.name}</span><b>—</b><span>{match.away.name}</span><TeamCrest name={match.away.name} logo={match.away.logo} size={30}/></div><p>{match.competition.name} · {new Date(match.date).toLocaleString("tr-TR",{weekday:"long",day:"numeric",month:"long",hour:"2-digit",minute:"2-digit",timeZone:"Europe/Istanbul"})}{match.venue? " · "+match.venue:""}</p></>:<p>Yeni maç programı açıklandığında burada gösterilecek.</p>}</div>
{match?<div className="fan-countdown">{[[days,"GÜN"],[hours,"SAAT"],[mins,"DAKİKA"],[secs,"SANİYE"]].map(([v,l])=><div className="fan-countbox" key={l}><strong>{String(v).padStart(2,"0")}</strong><small>{l}</small></div>)}</div>:<div className="fan-countdown"><div className="fan-countbox"><strong>61</strong><small>DAKİKA</small></div></div>}
</div>
<section className="fan-grid">{tiles.map(t=><Link to={t.to} className="fan-tile" key={t.to}><span className="fan-tile-icon"><t.icon size={25}/></span><span className="fan-arrow"><ArrowUpRight size={17}/></span><div><h2>{t.title}</h2><p>{t.desc}</p></div></Link>)}</section>
<div className="fan-footer-note">Resmî olmayan taraftar sitesidir. Maç ve istatistik verileri herkese açık spor veri kaynaklarından otomatik çekilir.</div>
</Container></main>}
