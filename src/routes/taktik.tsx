import {useEffect,useMemo,useRef,useState} from "react";
import {GIFEncoder,quantize,applyPalette} from "gifenc";
import {createFileRoute} from "@tanstack/react-router";
import {useSuspenseQuery} from "@tanstack/react-query";
import {Container,PageHeader} from "@/components/common/PageHeader";
import {PlayerAvatar} from "@/components/player/PlayerAvatar";
import {squadQuery} from "@/lib/data/queries";
import {seo} from "@/lib/seo";
import type {Player} from "@/lib/data/types";

export const Route=createFileRoute("/taktik")({head:()=>seo("Trabzonspor taktik ekranı","Oyuncu, rakip ve top yerleşimi; koşu, pas ve şut çizimleri ile taktik animasyonu."),loader:({context})=>context.queryClient.ensureQueryData(squadQuery()).then(()=>undefined),component:Page});

type Tool="select"|"player"|"opponent"|"ball"|"run"|"pass"|"shot";
type Point={x:number;y:number};
type Arrow=Point&{xx:number;yy:number;kind:"run"|"pass"|"shot"};
type Token={id:number;x:number;y:number};
const formations:Record<string,Point[]>={
 "4-2-3-1":[{x:50,y:91},{x:16,y:73},{x:39,y:75},{x:61,y:75},{x:84,y:73},{x:39,y:57},{x:61,y:57},{x:17,y:37},{x:50,y:34},{x:83,y:37},{x:50,y:16}],
 "4-3-3":[{x:50,y:91},{x:16,y:73},{x:39,y:75},{x:61,y:75},{x:84,y:73},{x:31,y:54},{x:50,y:61},{x:69,y:54},{x:18,y:29},{x:50,y:18},{x:82,y:29}],
 "4-4-2":[{x:50,y:91},{x:16,y:73},{x:39,y:75},{x:61,y:75},{x:84,y:73},{x:17,y:51},{x:39,y:54},{x:61,y:54},{x:83,y:51},{x:38,y:25},{x:62,y:25}],
 "3-5-2":[{x:50,y:91},{x:26,y:74},{x:50,y:76},{x:74,y:74},{x:12,y:52},{x:31,y:54},{x:50,y:58},{x:69,y:54},{x:88,y:52},{x:38,y:27},{x:62,y:27}],
 "4-1-4-1":[{x:50,y:91},{x:16,y:73},{x:39,y:75},{x:61,y:75},{x:84,y:73},{x:50,y:63},{x:17,y:43},{x:39,y:45},{x:61,y:45},{x:83,y:43},{x:50,y:19}]
};
const toolItems:{id:Tool;label:string;symbol:string}[]=[{id:"select",label:"Seç / taşı",symbol:"↖"},{id:"player",label:"Oyuncu",symbol:"○"},{id:"opponent",label:"Rakip",symbol:"●"},{id:"ball",label:"Top",symbol:"⚽"},{id:"run",label:"Koşu",symbol:"↗"},{id:"pass",label:"Pas",symbol:"➜"},{id:"shot",label:"Şut",symbol:"⤴"}];

function Page(){
 const {data:env}=useSuspenseQuery(squadQuery());const players=env.data;
 const [shape,setShape]=useState("4-2-3-1");const [placed,setPlaced]=useState<(Player|null)[]>(Array(11).fill(null));const [points,setPoints]=useState<Point[]>(formations["4-2-3-1"]);
 const [tool,setTool]=useState<Tool>("select");const [selectedPlayer,setSelectedPlayer]=useState<Player|null>(null);const [search,setSearch]=useState("");const [opponents,setOpponents]=useState<Token[]>([]);const [balls,setBalls]=useState<Token[]>([]);const [arrows,setArrows]=useState<Arrow[]>([]);const [drawStart,setDrawStart]=useState<Point|null>(null);const [dragging,setDragging]=useState<number|null>(null);
 const [playing,setPlaying]=useState(false);const [visibleArrowCount,setVisibleArrowCount]=useState(0);const [title,setTitle]=useState("Trabzonspor taktik planı");const [opponentName,setOpponentName]=useState("Rakip takım");const [color,setColor]=useState("#ffffff");const pitchRef=useRef<HTMLDivElement>(null);
 const filtered=useMemo(()=>players.filter(p=>p.name.toLocaleLowerCase("tr").includes(search.toLocaleLowerCase("tr"))),[players,search]);
 useEffect(()=>{if(!playing)return;const timer=window.setInterval(()=>setVisibleArrowCount(v=>{if(v>=arrows.length){setPlaying(false);return arrows.length;}return v+1}),650);return()=>window.clearInterval(timer)},[playing,arrows.length]);
 function pointAt(e:{clientX:number;clientY:number}):Point{const r=pitchRef.current!.getBoundingClientRect();return{x:Math.max(3,Math.min(97,(e.clientX-r.left)/r.width*100)),y:Math.max(3,Math.min(97,(e.clientY-r.top)/r.height*100))}}
 function addPlayer(p:Player){setSelectedPlayer(p);setTool("player")}
 function placePlayer(pt:Point){if(!selectedPlayer)return;const old=placed.findIndex(p=>p?.id===selectedPlayer.id);const idx=old>=0?old:placed.findIndex(p=>!p);const target=idx<0?10:idx;setPlaced(a=>a.map((p,i)=>i===target?selectedPlayer:p));setPoints(a=>a.map((p,i)=>i===target?pt:p));setSelectedPlayer(null);setTool("select")}
 function handlePitchClick(e:React.MouseEvent<HTMLDivElement>){if((e.target as HTMLElement).closest("[data-token]"))return;const pt=pointAt(e);if(tool==="player"&&selectedPlayer){placePlayer(pt);return}if(tool==="opponent"){setOpponents(a=>[...a,{id:Date.now(),...pt}]);return}if(tool==="ball"){setBalls(a=>[...a,{id:Date.now(),...pt}]);return}}
 function handlePointerDown(e:React.PointerEvent<HTMLDivElement>){if(["run","pass","shot"].includes(tool)){const pt=pointAt(e);setDrawStart(pt);e.currentTarget.setPointerCapture(e.pointerId)}}
 function handlePointerUp(e:React.PointerEvent<HTMLDivElement>){if(drawStart&&["run","pass","shot"].includes(tool)){const end=pointAt(e);if(Math.hypot(end.x-drawStart.x,end.y-drawStart.y)>1.5)setArrows(a=>[...a,{...drawStart,xx:end.x,yy:end.y,kind:tool as Arrow["kind"]}]);setDrawStart(null)}}
 function handlePointerMove(e:React.PointerEvent<HTMLDivElement>){if(dragging!==null&&tool==="select"){const pt=pointAt(e);setPoints(a=>a.map((p,i)=>i===dragging?pt:p))}}
 function resetBoard(){setPlaced(Array(11).fill(null));setPoints(formations[shape]);setOpponents([]);setBalls([]);setArrows([]);setSelectedPlayer(null);setVisibleArrowCount(0);setPlaying(false)}
 function changeFormation(v:string){setShape(v);setPoints(formations[v]);setArrows([])}
 function drawScene(ctx:CanvasRenderingContext2D,w:number,h:number,count:number){
  ctx.fillStyle="#0b1712";ctx.fillRect(0,0,w,h);const x=24,y=24,pw=w-48,ph=h-48;ctx.fillStyle="#17613f";ctx.fillRect(x,y,pw,ph);ctx.strokeStyle="rgba(255,255,255,.86)";ctx.lineWidth=4;ctx.strokeRect(x+10,y+10,pw-20,ph-20);ctx.beginPath();ctx.moveTo(x+10,y+ph/2);ctx.lineTo(x+pw-10,y+ph/2);ctx.stroke();ctx.beginPath();ctx.arc(w/2,h/2,Math.min(pw,ph)*.105,0,Math.PI*2);ctx.stroke();ctx.strokeRect(w*.29,y+10,w*.42,ph*.15);ctx.strokeRect(w*.29,y+ph*.85,w*.42,ph*.15);ctx.strokeRect(w*.39,y+10,w*.22,ph*.065);ctx.strokeRect(w*.39,y+ph*.935,w*.22,ph*.065);
  ctx.textAlign="center";placed.forEach((p,i)=>{const pt=points[i],px=x+pt.x/100*pw,py=y+pt.y/100*ph;ctx.fillStyle="#b92f50";ctx.beginPath();ctx.arc(px,py,27,0,Math.PI*2);ctx.fill();ctx.strokeStyle="#fff";ctx.lineWidth=3;ctx.stroke();ctx.fillStyle="#fff";ctx.font="bold 16px Arial";ctx.fillText(String(p?.jersey??i+1),px,py+6);ctx.font="bold 14px Arial";ctx.fillText((p?.name??"Oyuncu").slice(0,20),px,py+47)});
  opponents.forEach((p,i)=>{const px=x+p.x/100*pw,py=y+p.y/100*ph;ctx.fillStyle="#dc3545";ctx.beginPath();ctx.arc(px,py,25,0,Math.PI*2);ctx.fill();ctx.strokeStyle="#fff";ctx.lineWidth=2;ctx.stroke();ctx.fillStyle="#fff";ctx.font="bold 15px Arial";ctx.fillText("R"+(i+1),px,py+5)});
  balls.forEach(p=>{const px=x+p.x/100*pw,py=y+p.y/100*ph;ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(px,py,12,0,Math.PI*2);ctx.fill();ctx.strokeStyle="#111";ctx.lineWidth=2;ctx.stroke()});
  arrows.slice(0,count).forEach(a=>{const sx=x+a.x/100*pw,sy=y+a.y/100*ph,ex=x+a.xx/100*pw,ey=y+a.yy/100*ph;ctx.strokeStyle=a.kind==="run"?"#f6d365":a.kind==="pass"?"#fff":"#ff5252";ctx.fillStyle=ctx.strokeStyle;ctx.lineWidth=6;ctx.setLineDash(a.kind==="run"?[12,8]:[]);ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo(ex,ey);ctx.stroke();ctx.setLineDash([]);const angle=Math.atan2(ey-sy,ex-sx);ctx.beginPath();ctx.moveTo(ex,ey);ctx.lineTo(ex-22*Math.cos(angle-.45),ey-22*Math.sin(angle-.45));ctx.lineTo(ex-22*Math.cos(angle+.45),ey-22*Math.sin(angle+.45));ctx.closePath();ctx.fill()});
  ctx.fillStyle="#fff";ctx.font="bold 28px Arial";ctx.fillText("61 DAKİKA",w/2,h-8);
 }
 function downloadBlob(blob:Blob,name:string){const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=name;a.click();window.setTimeout(()=>URL.revokeObjectURL(url),1800)}
 function downloadPng(){const canvas=document.createElement("canvas");canvas.width=1080;canvas.height=1450;const ctx=canvas.getContext("2d");if(!ctx)return;drawScene(ctx,1080,1450,arrows.length);canvas.toBlob(b=>{if(b)downloadBlob(b,"61dakika-taktik-tahtasi.png")}, "image/png")}
 async function downloadGif(){if(!arrows.length){alert("Önce sahaya en az bir ok çiz.");return}const canvas=document.createElement("canvas");canvas.width=540;canvas.height=740;const ctx=canvas.getContext("2d");if(!ctx)return;const gif=GIFEncoder();for(let i=0;i<=arrows.length;i++){drawScene(ctx,540,740,i);const data=ctx.getImageData(0,0,540,740).data;const palette=quantize(data,256);gif.writeFrame(applyPalette(data,palette),540,740,{palette,delay:650,repeat:0})}gif.finish();downloadBlob(new Blob([gif.bytes()],{type:"image/gif"}),"61dakika-taktik-animasyonu.gif")}
 async function downloadMp4(){if(!("MediaRecorder" in window)||!("captureStream" in HTMLCanvasElement.prototype)){alert("Bu tarayıcı MP4 kaydını desteklemiyor. GIF indir seçeneğini kullanabilirsin.");return}if(!arrows.length){alert("Önce sahaya ok çiz.");return}const canvas=document.createElement("canvas");canvas.width=720;canvas.height=980;const ctx=canvas.getContext("2d");if(!ctx)return;const stream=canvas.captureStream(2);const mime=MediaRecorder.isTypeSupported("video/mp4")?"video/mp4":"video/webm";const recorder=new MediaRecorder(stream,{mimeType:mime});const chunks:BlobPart[]=[];recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};recorder.onstop=()=>downloadBlob(new Blob(chunks,{type:mime}),mime==="video/mp4"?"61dakika-taktik.mp4":"61dakika-taktik.webm");recorder.start();for(let i=0;i<=arrows.length;i++){drawScene(ctx,720,980,i);await new Promise(r=>setTimeout(r,650))}recorder.stop()}
 function play(){if(!arrows.length)return;setVisibleArrowCount(0);setPlaying(true)}
 const toolHelp:Record<Tool,string>={select:"Oyuncuları sahada sürükleyerek konumlandır.",player:"Kadrodan oyuncu seç, ardından sahada istediğin noktaya dokun.",opponent:"Rakip aracını seçip sahaya dokunarak rakip ekle.",ball:"Top aracını seçip sahaya dokunarak top yerleştir.",run:"Sahada başlangıçtan bitişe sürükleyerek koşu oku çiz.",pass:"Sahada sürükleyerek pas yönünü çiz.",shot:"Sahada sürükleyerek şut yönünü çiz."};
 return <Container className="py-6 sm:py-8">
  <PageHeader eyebrow="61Dakika · Taktik tahtası" title="Taktik ekranı" description="Kadronu yerleştir, rakibi ve topu ekle; oyun planını çiz ve animasyon olarak paylaş."/>
  <div className="mt-5 overflow-hidden rounded-2xl border border-border bg-[#141619] shadow-xl">
   <div className="flex items-center gap-2 overflow-x-auto border-b border-white/10 bg-[#101214] p-3">
    <span className="shrink-0 px-1 text-[10px] font-bold tracking-widest text-white/45">YERLEŞTİR</span>
    {toolItems.slice(0,4).map(t=><button key={t.id} onClick={()=>setTool(t.id)} className={`flex min-w-[76px] shrink-0 flex-col items-center gap-1 rounded-xl border px-3 py-2 text-xs font-semibold transition ${tool===t.id?"border-amber-300 bg-white text-black":"border-white/10 bg-[#1b1e21] text-white"}`}><span className="text-xl leading-5">{t.symbol}</span>{t.label}</button>)}
    <span className="mx-1 h-10 border-l border-white/15"/>
    <span className="shrink-0 px-1 text-[10px] font-bold tracking-widest text-white/45">OKLAR</span>
    {toolItems.slice(4).map(t=><button key={t.id} onClick={()=>setTool(t.id)} className={`flex min-w-[76px] shrink-0 flex-col items-center gap-1 rounded-xl border px-3 py-2 text-xs font-semibold transition ${tool===t.id?"border-amber-300 bg-white text-black":"border-white/10 bg-[#1b1e21] text-white"}`}><span className="text-xl leading-5">{t.symbol}</span>{t.label}</button>)}
   </div>
   <div className="grid gap-3 p-3 lg:grid-cols-[minmax(0,1fr)_260px] lg:p-4">
    <div className="min-w-0">
     <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-2"><select value={shape} onChange={e=>changeFormation(e.target.value)} className="rounded-lg border border-white/15 bg-[#202428] px-3 py-2 text-sm text-white">{Object.keys(formations).map(v=><option key={v}>{v}</option>)}</select><button onClick={resetBoard} className="rounded-lg border border-white/15 px-3 py-2 text-xs text-white">Temizle</button></div>
      <div className="flex items-center gap-1">{["#ffffff","#f6d365","#ff5252","#54a8ff"].map(c=><button key={c} onClick={()=>setColor(c)} aria-label={"Çizim rengi "+c} className="h-7 w-7 rounded-full border-2" style={{background:c,borderColor:color===c?"#f6d365":"#777"}}/>)}</div>
     </div>
     <div ref={pitchRef} onClick={handlePitchClick} onPointerDown={handlePointerDown} onPointerUp={handlePointerUp} onPointerMove={handlePointerMove} className="relative mx-auto aspect-[.72/1] w-full max-w-[560px] touch-none overflow-hidden rounded-xl border-[5px] border-[#0b392a] bg-[#17613f] shadow-inner" style={{backgroundImage:"repeating-linear-gradient(0deg,rgba(255,255,255,.035) 0 10%,transparent 10% 20%)"}}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full"><rect x="2" y="1" width="96" height="98" fill="none" stroke="white" strokeOpacity=".8" strokeWidth=".35"/><path d="M2 50H98 M25 1V15H75V1 M25 99V85H75V99" stroke="white" strokeOpacity=".8" strokeWidth=".35" fill="none"/><circle cx="50" cy="50" r="11" stroke="white" strokeOpacity=".8" strokeWidth=".35" fill="none"/><circle cx="50" cy="50" r=".7" fill="white"/><rect x="38" y="1" width="24" height="8" stroke="white" strokeOpacity=".8" strokeWidth=".35" fill="none"/><rect x="38" y="91" width="24" height="8" stroke="white" strokeOpacity=".8" strokeWidth=".35" fill="none"/>{arrows.slice(0,playing?visibleArrowCount:arrows.length).map((a,i)=><g key={i}><path d={`M${a.x} ${a.y} L${a.xx} ${a.yy}`} stroke={a.kind==="run"?"#f6d365":a.kind==="pass"?"#fff":"#ff5252"} strokeWidth="1.1" strokeDasharray={a.kind==="run"?"2 1":undefined} fill="none"/><path d={`M${a.xx-1.5} ${a.yy-1} L${a.xx} ${a.yy} L${a.xx-1.5} ${a.yy+1}`} stroke={a.kind==="run"?"#f6d365":a.kind==="pass"?"#fff":"#ff5252"} strokeWidth="1" fill="none"/></g>)}</svg>
      {points.map((pt,i)=>{const p=placed[i];return <div key={i} data-token="player" onPointerDown={e=>{e.stopPropagation();if(tool==="select"){setDragging(i);(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)}}} onPointerUp={e=>{e.stopPropagation();setDragging(null)}} onClick={e=>{e.stopPropagation();setTool("select")}} style={{left:pt.x+"%",top:pt.y+"%",transform:"translate(-50%,-50%)",touchAction:"none"}} className="absolute z-10 flex w-[58px] -translate-x-1/2 -translate-y-1/2 cursor-pointer flex-col items-center"><span className="grid h-10 w-10 place-items-center overflow-hidden rounded-full border-2 border-white bg-[#101820] text-xs font-black text-white shadow-lg">{p?<PlayerAvatar name={p.name} jersey={p.jersey} photo={p.photo} size={40} className="h-full w-full rounded-full object-cover"/>:<span>{i===0?"KL":i+1}</span>}</span><span className="mt-0.5 max-w-[70px] truncate rounded bg-black/75 px-1 py-0.5 text-[9px] font-semibold text-white">{p?.name??["KL","SLB","STP","STP","SĞB","OS","OS","SLK","OF","SĞK","SF"][i]}</span></div>})}
      {opponents.map((p,i)=><div key={p.id} data-token="opponent" onClick={e=>e.stopPropagation()} style={{left:p.x+"%",top:p.y+"%",transform:"translate(-50%,-50%)"}} className="pointer-events-none absolute z-20 grid h-9 w-9 place-items-center rounded-full border-2 border-white bg-red-600 text-xs font-black text-white shadow-lg">R{i+1}</div>)}
      {balls.map(p=><div key={p.id} data-token="ball" style={{left:p.x+"%",top:p.y+"%",transform:"translate(-50%,-50%)"}} className="pointer-events-none absolute z-20 text-2xl drop-shadow">⚽</div>)}
      <div className="pointer-events-none absolute bottom-2 left-0 right-0 text-center text-[9px] font-bold tracking-[.25em] text-white/70">61 DAKİKA</div>
     </div>
     <p className="mt-2 rounded-lg bg-[#202428] px-3 py-2 text-xs text-white/65">{toolHelp[tool]}{selectedPlayer?" Seçili oyuncu: "+selectedPlayer.name:""}</p>
     <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
      <button onClick={play} disabled={!arrows.length||playing} className="rounded-xl bg-white px-3 py-3 font-bold text-black disabled:opacity-40">▶ Oynat</button>
      <button onClick={downloadGif} className="rounded-xl bg-white px-3 py-3 font-bold text-black">GIF indir</button>
      <button onClick={downloadMp4} className="rounded-xl bg-white px-3 py-3 font-bold text-black">MP4 indir</button>
      <button onClick={downloadPng} className="rounded-xl bg-white px-3 py-3 font-bold text-black">Görseli indir</button>
     </div>
     <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-white/55"><span>{arrows.length} çizim · {opponents.length} rakip · {balls.length} top</span><button onClick={()=>{setArrows([]);setVisibleArrowCount(0);setPlaying(false)}} className="underline">Okları temizle</button></div>
    </div>
    <aside className="space-y-3">
     <section className="rounded-xl border border-white/10 bg-[#1b1e21] p-3">
      <div className="mb-2 flex items-center justify-between"><h2 className="font-display text-lg font-bold text-white">TAKIM BİLGİSİ</h2><span className="text-[10px] text-white/45">11 OYUNCU</span></div>
      <label className="mb-2 block text-xs text-white/65">TAKIM ADI<input value="TRABZONSPOR" readOnly className="mt-1 w-full rounded-lg border border-white/10 bg-[#101214] p-2 text-sm text-white"/></label>
      <label className="block text-xs text-white/65">RAKİP ADI<input value={opponentName} onChange={e=>setOpponentName(e.target.value)} className="mt-1 w-full rounded-lg border border-white/10 bg-[#101214] p-2 text-sm text-white"/></label>
      <label className="mt-2 block text-xs text-white/65">TAKTİK BAŞLIĞI<input value={title} onChange={e=>setTitle(e.target.value)} className="mt-1 w-full rounded-lg border border-white/10 bg-[#101214] p-2 text-sm text-white"/></label>
     </section>
     <section className="rounded-xl border border-white/10 bg-[#1b1e21] p-3">
      <div className="mb-2 flex items-center justify-between"><h2 className="font-display text-lg font-bold text-white">KADRO</h2><span className="text-[10px] text-white/45">{players.length} OYUNCU</span></div>
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Oyuncu ara..." className="mb-2 w-full rounded-lg border border-white/10 bg-[#101214] p-2 text-sm text-white placeholder:text-white/35"/>
      <div className="max-h-[440px] space-y-1 overflow-y-auto">{filtered.map(p=><button key={p.id} onClick={()=>addPlayer(p)} className={`flex w-full items-center gap-2 rounded-lg border p-2 text-left ${selectedPlayer?.id===p.id?"border-amber-300 bg-amber-300/10":"border-white/5 bg-[#15181a]"}`}><PlayerAvatar name={p.name} jersey={p.jersey} photo={p.photo} size={36}/><span className="min-w-0 flex-1 truncate text-xs font-semibold text-white">{p.name}</span><small className="text-xs text-white/55">#{p.jersey??"—"}</small></button>)}</div>
      <p className="mt-2 text-[11px] text-white/45">Oyuncuya dokun, ardından sahada istediğin noktaya dokunarak yerleştir.</p>
     </section>
     <section className="rounded-xl border border-white/10 bg-[#1b1e21] p-3"><h2 className="font-display text-sm font-bold text-white">ÇİZİM KILAVUZU</h2><div className="mt-2 space-y-2 text-xs text-white/65"><p><span className="mr-2 inline-block w-7 border-t-2 border-dashed border-amber-300 align-middle"/>Koşu yolu</p><p><span className="mr-2 inline-block w-7 border-t-2 border-white align-middle"/>Pas yolu</p><p><span className="mr-2 inline-block w-7 border-t-2 border-red-500 align-middle"/>Şut yolu</p></div></section>
    </aside>
   </div>
  </div>
 </Container>
}
