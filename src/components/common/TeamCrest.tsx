import { useState } from "react";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";

// Current transparent crest (SVG) rather than a boxed raster badge.
const TRABZONSPOR_CREST = "https://commons.wikimedia.org/wiki/Special:Redirect/file/Trabzonspor_logosu.svg";

export function TeamCrest({ name, logo, size = 28, className }: {
  name: string; logo: string | null; size?: number; className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const isTrabzonspor = /trabzonspor/i.test(name);
  const src = isTrabzonspor ? TRABZONSPOR_CREST : logo;
  if (!src || failed) {
    return <span aria-hidden style={{ width: size, height: size, fontSize: Math.max(9, size * 0.36) }}
      className={cn("inline-grid shrink-0 place-items-center rounded-full border border-border bg-muted font-display font-semibold text-muted-foreground", className)}>
      {initials(name)}
    </span>;
  }
  return <span className={cn("inline-flex shrink-0 items-center justify-center bg-transparent", className)} style={{width:size,height:size}}>
    <img src={src} alt={isTrabzonspor ? "Trabzonspor" : name} width={size} height={size}
      loading="lazy" onError={() => setFailed(true)}
      className="block h-full w-full bg-transparent object-contain" />
  </span>;
}
