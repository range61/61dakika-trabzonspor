import { useState } from "react";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";

// Official current full-colour Trabzonspor crest from the club's corporate identity page.
const TRABZONSPOR_CREST = "https://cdn.trabzonspor.org.tr/ed5615de86e84e4292fedcf65d4b3be4.png";

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
  return <img src={src} alt={isTrabzonspor ? "Trabzonspor" : ""} width={size} height={size}
    loading="lazy" onError={() => setFailed(true)} style={{ width: size, height: size }}
    className={cn("shrink-0 object-contain", className)} />;
}
