import { useState } from "react";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";

// User-supplied current Trabzonspor crest, served locally to keep every view/export consistent.
export const TRABZONSPOR_CREST = "/trabzonspor-crest.svg";

export function TeamCrest({ name, logo, size = 28, className }: { name: string; logo: string | null; size?: number; className?: string }) {
  const [failed, setFailed] = useState(false);
  const isTrabzonspor = /trabzonspor/i.test(name);
  const src = isTrabzonspor ? TRABZONSPOR_CREST : logo;
  if (!src || failed) return <span aria-hidden style={{ width:size,height:size,fontSize:Math.max(9,size*.36) }} className={cn("inline-grid shrink-0 place-items-center rounded-full border border-border bg-muted font-display font-semibold text-muted-foreground",className)}>{initials(name)}</span>;
  return <span className={cn("inline-flex shrink-0 items-center justify-center bg-transparent",className)} style={{width:size,height:size}}>
    <img src={src} alt={name} width={size} height={size} loading="lazy" decoding="async" onError={()=>setFailed(true)} className="block h-full w-full bg-transparent object-contain"/>
  </span>;
}
