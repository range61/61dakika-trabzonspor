import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Container, PageHeader } from "@/components/common/PageHeader";
import { squadQuery } from "@/lib/data/queries";
import { seo } from "@/lib/seo";
import { PlayerAvatar } from "@/components/player/PlayerAvatar";
import { TRABZONSPOR_CREST } from "@/components/common/TeamCrest";

export const Route=createFileRoute("/oyuncu-karti")({head:()=>seo("Oyuncu kartı oluştur","61Dakika altın futbolcu kartını tasarla ve PNG indir."),loader:({context})=>context.queryClient.ensureQueryData(squadQuery()).then(()=>undefined),component:Page});
const CREST=TRABZONSPOR_CREST;
const positions=["GK","SLB","STP","SGK","SLK","OS","MO","SĞK","SĞO","SLO","SF","ST","OF"];
function Page(){
 const {data:env}=useSuspenseQuery(squadQuery()); const players=env.data;
 const [id,setId]=useState(""); const [name,setName]=useState("Oyuncu Adı"); const [position,setPosition]=useState("SF"); const [nationality,setNationality]=useState("Türkiye");
 const [rating,setRating]=useState(80); const [kind,setKind]=useState("Otomatik (reytinge göre)");
 const [auto,setAuto]=useState(true); const [photo,setPhoto]=useState<string|null>(null); const [manual,setManual]=useState([80,80,80,80,80,80]);
 const selected=players.find(p=>p.id===id);
 const attrs=useMemo(()=>auto?[Math.min(99,rating+2),Math.min(99,rating),Math.min(99,rating),Math.min(99,rating),Math.min(99,rating),Math.min(99,rating)]:manual,[auto,rating,manual]);
 function choose(v:string){setId(v);const p=players.find(x=>x.id===v);if(p){setName(p.name);setPosition(p.position==="GK"?"GK":p.position==="DEF"?"STP":p.position==="MID"?"OS":"SF");setNationality(p.nationality??"Türkiye");setPhoto(p.photo);}}
 function updateAttr(i:number,v:number){setManual(a=>a.map((x,j)=>i===j?v:x));}
 async function download(){
  const canvas=document.createElement("canvas");canvas.width=900;canvas.height=1400;const c=canvas.getContext("2d");if(!c)return;
  const grad=c.createLinearGradient(0,0,900,1400);grad.addColorStop(0,"#f8df8c");grad.addColorStop(.5,"#d7b65d");grad.addColorStop(1,"#9e792d");c.fillStyle="#17130b";c.fillRect(0,0,900,1400);
  c.fillStyle=grad;c.beginPath();c.roundRect(22,22,856,1356,62);c.fill();c.strokeStyle="#fff0b2";c.lineWidth=9;c.stroke();
  c.save();c.beginPath();c.roundRect(42,42,816,1316,48);c.clip();c.globalAlpha=.10;c.strokeStyle="#fff";c.lineWidth=22;for(let x=-900;x<1800;x+=80){c.beginPath();c.moveTo(x,0);c.lineTo(x+700,1400);c.stroke();}c.restore();
  c.fillStyle="#34250b";c.font="900 160px Arial";c.fillText(String(rating),85,225);c.font="bold 58px Arial";c.fillText(position,100,295);c.font="bold 28px Arial";c.fillText(nationality.toLocaleUpperCase("tr-TR"),100,355);
  c.fillStyle="rgba(255,255,255,.18)";c.beginPath();c.roundRect(310,140,490,510,34);c.fill();
  const load=(src:string)=>new Promise<HTMLImageElement>((resolve,reject)=>{const im=new Image();im.crossOrigin="anonymous";im.onload=()=>resolve(im);im.onerror=reject;im.src=src;});
  if(photo){try{const im=await load(photo);c.save();c.beginPath();c.roundRect(315,145,480,500,28);c.clip();const s=Math.max(480/im.width,500/im.height);c.drawImage(im,315+(480-im.width*s)/2,145+(500-im.height*s)/2,im.width*s,im.height*s);c.restore();}catch{}}
  try{const logo=await load(CREST);const max=125;const scale=Math.min(max/logo.width,max/logo.height);const w=logo.width*scale;const h=logo.height*scale;c.drawImage(logo,150-w/2,438-h/2,w,h);}catch{}
  c.textAlign="center";c.fillStyle="#2b210e";c.font="900 78px Arial";c.fillText(name.toLocaleUpperCase("tr-TR"),450,760,760);
  c.strokeStyle="rgba(60,40,10,.5)";c.lineWidth=3;c.beginPath();c.moveTo(120,800);c.lineTo(780,800);c.stroke();
  const labels=["HIZ","ŞUT","PAS","DRİ","DEF","FİZ"];c.font="900 58px Arial";attrs.forEach((v,i)=>{const x=i%2?570:280,y=900+Math.floor(i/2)*125;c.textAlign="right";c.fillText(String(v),x,y);c.textAlign="left";c.font="bold 34px Arial";c.fillText(labels[i],x+18,y);c.font="900 58px Arial";});
  c.textAlign="center";c.font="bold 26px Arial";c.fillText("61DAKİKA",450,1310);c.fillRect(365,1328,170,6);
  const a=document.createElement("a");a.download="61dakika-oyuncu-karti.png";try{a.href=canvas.toDataURL("image/png");a.click();}catch(error){console.error("Kart PNG dışa aktarılamadı",error);alert("Fotoğraf kaynağı dışa aktarıma izin vermedi. Oyuncu fotoğrafını cihazından yükleyip tekrar deneyebilirsin.");}
 }
 return <Container className="py-7"><PageHeader eyebrow="61Dakika · Tasarım aracı" title="Oyuncu kartı oluştur" description="Oyuncunu seç veya boş kartı kendin doldur. Kartını PNG olarak indir."/>
 <div className="mt-5 grid items-start gap-6 lg:grid-cols-[1fr_382px]">
 <section className="surface space-y-5 p-5">
 <div><h2 className="font-display text-lg font-bold">① OYUNCU</h2><label className="mt-3 block text-sm text-muted-foreground">Oyuncu (kadrod an)</label><select value={id} onChange={e=>choose(e.target.value)} className="mt-1 w-full rounded-xl border bg-background p-3"><option value="">— Boş kart —</option>{players.map(p=><option key={p.id} value={p.id}>{p.name} · {p.position}</option>)}</select>
 <label className="mt-3 block text-sm text-muted-foreground">İsim</label><input value={name} onChange={e=>setName(e.target.value)} className="mt-1 w-full rounded-xl border bg-background p-3"/>
 <div className="mt-3 grid grid-cols-2 gap-3"><label className="text-sm text-muted-foreground">Pozisyon<select value={position} onChange={e=>setPosition(e.target.value)} className="mt-1 w-full rounded-xl border bg-background p-3">{positions.map(x=><option key={x}>{x}</option>)}</select></label><label className="text-sm text-muted-foreground">Uyruk<input value={nationality} onChange={e=>setNationality(e.target.value)} className="mt-1 w-full rounded-xl border bg-background p-3"/></label></div></div>
 <div className="border-t border-border pt-4"><h2 className="font-display text-lg font-bold">② DEĞERLER</h2><div className="mt-3 grid grid-cols-2 gap-3"><label className="text-sm text-muted-foreground">Genel reyting<input type="number" min="1" max="99" value={rating} onChange={e=>setRating(Math.max(1,Math.min(99,Number(e.target.value))))} className="mt-1 w-full rounded-xl border bg-background p-3"/></label><label className="text-sm text-muted-foreground">Kart türü<select value={kind} onChange={e=>setKind(e.target.value)} className="mt-1 w-full rounded-xl border bg-background p-3"><option>Otomatik (reytinge göre)</option><option>Altın</option><option>Özel</option></select></label></div><label className="mt-3 flex items-center gap-2 text-sm"><input type="checkbox" checked={auto} onChange={e=>setAuto(e.target.checked)}/>Genel reytingi özelliklerden otomatik hesapla</label><div className="mt-3 grid grid-cols-3 gap-2">{["HIZ","ŞUT","PAS","DRİ","DEF","FİZ"].map((l,i)=><label key={l} className="text-xs text-muted-foreground">{l}<input type="number" min="1" max="99" value={attrs[i]} disabled={auto} onChange={e=>updateAttr(i,Math.max(1,Math.min(99,Number(e.target.value))))} className="mt-1 w-full rounded-xl border bg-background p-3 text-center text-base font-bold disabled:opacity-70"/></label>)}</div></div>
 <div className="border-t border-border pt-4"><h2 className="font-display text-lg font-bold">③ FOTOĞRAF</h2><label className="mt-3 block text-sm text-muted-foreground">Fotoğraf yükle (isteğe bağlı)</label><input type="file" accept="image/*" onChange={e=>{const file=e.target.files?.[0];if(file){const reader=new FileReader();reader.onload=()=>setPhoto(String(reader.result));reader.readAsDataURL(file);}}} className="mt-2 w-full text-sm"/><p className="mt-2 text-xs text-muted-foreground">Kadrodaki oyuncuyu seçtiğinde fotoğrafı otomatik gelir. İstersen kendi fotoğrafını yükleyebilirsin.</p></div>
 <button onClick={download} className="w-full rounded-xl bg-primary px-5 py-3 font-bold text-white">PNG görselini indir</button>
 </section>
 <div className="mx-auto w-full max-w-[382px]"><div className="player-card-preview relative aspect-[5/8] overflow-hidden rounded-[28px] border-[5px] border-amber-200/80 p-5 text-[#33250b] shadow-2xl" style={{background:"linear-gradient(135deg,#f8df8c,#d4b35c 52%,#a78336)"}}>
 <div className="absolute inset-0 opacity-20" style={{background:"repeating-linear-gradient(55deg,transparent 0 18px,#fff 19px 29px)"}}/>
 <div className="relative flex h-full flex-col"><div className="flex"><div className="w-[34%]"><strong className="block text-6xl font-black leading-none">{rating}</strong><b className="mt-1 block text-2xl">{position}</b><small className="mt-2 block font-bold">{nationality.toLocaleUpperCase("tr-TR")}</small><img src={CREST} alt="Trabzonspor" className="mt-3 h-14 w-14 object-contain drop-shadow-md"/></div><div className="relative flex h-[47%] min-h-[180px] flex-1 items-center justify-center overflow-hidden rounded-2xl border border-white/30 bg-gradient-to-br from-white/30 to-black/10 shadow-inner">{photo?<img src={photo} alt={name} className="h-full w-full object-cover"/>:<span className="text-6xl font-black text-black/20">61</span>}</div></div>
 <div className="mt-auto text-center"><h3 className="break-words text-3xl font-black uppercase">{name}</h3><div className="my-3 h-px bg-black/40"/><div className="grid grid-cols-2 gap-x-4 gap-y-2 text-left">{["HIZ","ŞUT","PAS","DRİ","DEF","FİZ"].map((l,i)=><div key={l} className="flex items-baseline gap-2"><b className="text-3xl">{attrs[i]}</b><span className="font-bold">{l}</span></div>)}</div><div className="mt-7 text-center text-[10px] font-black tracking-[.35em]">61DAKİKA</div></div></div></div><p className="mt-3 text-center text-xs text-muted-foreground">Kart önizlemesi · PNG olarak indirilebilir</p></div>
 </div></Container>
}
