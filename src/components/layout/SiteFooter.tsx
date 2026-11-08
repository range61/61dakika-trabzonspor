import { Link } from "@tanstack/react-router";
import { Wordmark } from "@/components/brand/Wordmark";
import { MAIN_NAV, TOOLS_NAV } from "./nav";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border bg-card">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="max-w-sm">
          <Wordmark />
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Trabzonspor taraftarları için bağımsız bir maç, haber ve istatistik portalı. Resmî kulüp sitesi değildir;
            kulüple bağlantısı yoktur.
          </p>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            Maç ve istatistik verileri herkese açık spor veri kaynaklarından, haber başlıkları yayıncıların RSS
            akışlarından alınır ve her zaman kaynağına bağlantı verilir.
          </p>
        </div>
        <FooterCol title="Bölümler" items={MAIN_NAV} />
        <FooterCol title="Araçlar" items={TOOLS_NAV} />
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span>© {new Date().getFullYear()} 61Dakika · Bordo-mavi bir taraftar projesi</span>
          <span>Saatler Türkiye saatiyle (Europe/Istanbul) gösterilir.</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, items }: { title: string; items: typeof MAIN_NAV }) {
  return (
    <nav aria-label={title}>
      <p className="eyebrow">{title}</p>
      <ul className="mt-3 space-y-2">
        {items.map((i) => (
          <li key={i.to}>
            <Link to={i.to} className="text-sm text-foreground/80 hover:text-primary">
              {i.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}