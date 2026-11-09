import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Container, PageHeader } from "@/components/common/PageHeader";
import { TeamCrest } from "@/components/common/TeamCrest";
import { scheduleQuery } from "@/lib/data/queries";
import { seo } from "@/lib/seo";
import { formatDateTimeShort } from "@/lib/format";

export const Route = createFileRoute("/skor-tahmini")({
  head: () => seo("Skor tahmini", "Trabzonspor maç günü skor tahminini oluştur."),
  loader: ({ context }) => context.queryClient.ensureQueryData(scheduleQuery()).then(() => undefined),
  component: Page,
});

function Page() {
  const { data: env } = useSuspenseQuery(scheduleQuery());
  const matches = env.data.filter(m => m.state === "pre");
  const defaultMatch = matches.find(m => m.home.id === "994" || m.away.id === "994") ?? matches[0];
  const [id, setId] = useState("");
  const match = matches.find(m => m.id === id) ?? defaultMatch;
  const [home, setHome] = useState(0);
  const [away, setAway] = useState(0);
  const h = match?.home.name ?? "Trabzonspor";
  const a = match?.away.name ?? "Rakip takım";
  const date = match ? new Date(match.date) : null;
  const dateLabel = date ? date.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" }) : "MAÇ TARİHİ BEKLENİYOR";
  const timeLabel = date ? date.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }) : "";
  const competition = match?.competition.name ?? "TRABZONSPOR";

  async function downloadPoster() {
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1350;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#17191f";
    ctx.fillRect(0, 0, 1080, 1350);
    ctx.fillStyle = "#20232b";
    ctx.fillRect(0, 0, 1080, 900);
    ctx.fillStyle = "#8f2946";
    ctx.fillRect(0, 0, 8, 1350);


    const loadImage = (url?: string | null) => new Promise<HTMLImageElement | null>(resolve => {
      if (!url) return resolve(null);
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = url;
    });
    const [homeLogo, awayLogo] = await Promise.all([
      loadImage(/trabzonspor/i.test(h) ? "https://commons.wikimedia.org/wiki/Special:Redirect/file/Trabzonspor_logosu.svg" : match?.home.logo), loadImage(/trabzonspor/i.test(a) ? "https://commons.wikimedia.org/wiki/Special:Redirect/file/Trabzonspor_logosu.svg" : match?.away.logo)
    ]);
    const drawCrest = (img: HTMLImageElement | null, x: number, y: number, removeDarkMatte = false) => {
      if (img) {
        const ratio = Math.min(1, 190 / img.width, 190 / img.height);
        const w = img.width * ratio, h = img.height * ratio;
        ctx!.save();
        if (removeDarkMatte) ctx!.globalCompositeOperation = "screen";
        ctx!.drawImage(img, x - w / 2, y - h / 2, w, h);
        ctx!.restore();
      } else {
        ctx!.fillStyle = "#777"; ctx!.beginPath(); ctx!.arc(x, y, 82, 0, Math.PI * 2); ctx!.fill();
        ctx!.fillStyle = "#fff"; ctx!.font = "bold 44px Arial"; ctx!.textAlign = "center";
        ctx!.fillText((x < 540 ? h : a).slice(0, 3).toLocaleUpperCase("tr"), x, y + 15);
      }
    };
    drawCrest(homeLogo, 270, 300, /trabzonspor/i.test(h));
    drawCrest(awayLogo, 810, 300, /trabzonspor/i.test(a));

    ctx.textAlign = "center";
    ctx.fillStyle = "#fff";
    ctx.font = "900 52px Arial";
    ctx.fillText(h.toLocaleUpperCase("tr"), 270, 465, 440);
    ctx.fillStyle = "#f5f5f5";
    ctx.fillText(a.toLocaleUpperCase("tr"), 810, 465, 440);

    ctx.fillStyle = "#d9a84b";
    ctx.font = "bold 38px Arial";
    ctx.fillText("VS", 540, 465);

    ctx.fillStyle = "#09090b";
    ctx.font = "900 270px Arial";
    ctx.fillText(String(home), 270, 850);
    ctx.fillStyle = "#fff";
    ctx.fillText(String(away), 810, 850);

    ctx.fillStyle = "#d5d5d8";
    ctx.font = "bold 42px Arial";
    ctx.fillText(competition.toLocaleUpperCase("tr") + "  ·  " + dateLabel.toLocaleUpperCase("tr") + (timeLabel ? "  ·  " + timeLabel : ""), 540, 1085, 990);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 30px Arial";
    ctx.fillText("61DAKİKA", 540, 1265);
    ctx.fillStyle = "#d51f48";
    ctx.fillRect(475, 1290, 130, 7);

    canvas.toBlob(blob => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "61dakika-skor-tahmini.png";
      link.click();
      URL.revokeObjectURL(url);
    }, "image/png");
  }

  return <Container className="py-7">
    <PageHeader eyebrow="Maç günü aracı" title="Skor tahmini" description="Maçını seç, skorunu belirle ve 61Dakika imzalı paylaşım görselini indir." />
    <div className="mt-5 grid items-start gap-5 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="surface p-5">
        <h2 className="font-display text-xl font-bold">SKOR TAHMİNİNİ YAP</h2>
        <label className="mt-4 block text-sm">Maç
          <select value={match?.id ?? ""} onChange={e => { setId(e.target.value); setHome(0); setAway(0); }} className="mt-2 w-full rounded-lg border bg-background p-3">
            {matches.map(m => <option key={m.id} value={m.id}>{new Date(m.date).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })} · {m.home.name} – {m.away.name} ({m.competition.name})</option>)}
          </select>
        </label>
        {match ? <div className="mt-4 rounded-xl border border-primary/40 bg-primary-soft p-4">
          <b className="font-display text-xl">{h.toLocaleUpperCase("tr")} <span className="text-amber-400">VS</span> {a.toLocaleUpperCase("tr")}</b>
          <p className="mt-1 text-xs text-muted-foreground">{match.competition.name} · {formatDateTimeShort(match.date)} · {match.venue ?? "Stadyum bilgisi yok"}</p>
        </div> : <p className="mt-4 rounded-xl border p-4 text-sm text-muted-foreground">Kaynakta yaklaşan maç bulunamadı. Yeni fikstür geldiğinde burada listelenecek.</p>}
        <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-xl border p-4">
          <div className="text-center"><b className="text-sm">{h}</b><div className="mt-3 flex items-center justify-center gap-2">
            <button onClick={() => setHome(v => Math.max(0, v - 1))} className="rounded-full border px-3 py-2">−</button><strong className="text-3xl tabular">{home}</strong><button onClick={() => setHome(v => Math.min(20, v + 1))} className="rounded-full border px-3 py-2">+</button>
          </div></div>
          <span className="font-display text-2xl">—</span>
          <div className="text-center"><b className="text-sm">{a}</b><div className="mt-3 flex items-center justify-center gap-2">
            <button onClick={() => setAway(v => Math.max(0, v - 1))} className="rounded-full border px-3 py-2">−</button><strong className="text-3xl tabular">{away}</strong><button onClick={() => setAway(v => Math.min(20, v + 1))} className="rounded-full border px-3 py-2">+</button>
          </div></div>
        </div>
        <button onClick={() => { setHome(0); setAway(0); }} className="mt-3 rounded border px-3 py-2 text-sm">Skoru sıfırla</button>
        <p className="mt-4 text-xs text-muted-foreground">Tahmin kişisel paylaşım içindir; resmî sonuç veya bahis önerisi değildir.</p>
      </div>

      <div className="surface p-3">
        <div className="relative mx-auto aspect-[4/5] w-full max-w-[540px] overflow-hidden rounded-xl border" style={{ background: "linear-gradient(180deg,#20232b 0%,#17191f 72%,#111318 72%)" }}>
          <div className="relative grid h-[65%] grid-cols-2 items-center text-center">
            <div className="flex flex-col items-center px-2 pt-5 text-white"><TeamCrest name={h} logo={match?.home.logo ?? null} size={150} className="w-[150px] h-[150px]" /><b className="mt-5 font-display text-xl font-black uppercase">{h}</b><strong className="mt-5 text-8xl font-black leading-none">{home}</strong></div>
            <div className="flex flex-col items-center px-2 pt-5 text-white"><TeamCrest name={a} logo={match?.away.logo ?? null} size={150} className="w-[150px] h-[150px]" /><b className="mt-5 font-display text-xl font-black uppercase">{a}</b><strong className="mt-5 text-8xl font-black leading-none">{away}</strong></div>
          </div>
          <div className="absolute inset-x-0 bottom-0 bg-black/90 px-3 py-7 text-center text-white">
            <p className="font-display text-sm font-bold uppercase sm:text-lg">{competition} · {dateLabel} {timeLabel && "· " + timeLabel}</p>
            <p className="mt-6 text-sm font-black tracking-[.35em]">61DAKİKA</p>
            <div className="mx-auto mt-2 h-1 w-20 bg-primary"/>
          </div>
        </div>
        <button onClick={downloadPoster} className="mt-3 w-full rounded-lg bg-primary p-3 font-semibold text-white">PNG görselini indir</button>
        <p className="mt-2 text-center text-xs text-muted-foreground">Yalnızca maç posteri PNG olarak indirilir.</p>
      </div>
    </div>
  </Container>;
}
