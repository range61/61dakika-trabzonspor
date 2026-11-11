import { cn } from "@/lib/utils";

/** 61Dakika publisher mark. The club crest is intentionally omitted in the header. */
export function Wordmark({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)} aria-label="61Dakika Trabzonspor">
      
      <span aria-hidden className="relative grid h-8 w-8 place-items-center overflow-hidden rounded-lg bg-primary/10 font-display text-[1.05rem] font-extrabold leading-none text-[#7a1f3d] ring-1 ring-[#7a1f3d]/20">
        61<span className="absolute inset-x-0 bottom-0 h-1 bg-sky" />
      </span>
      {!compact && <span aria-hidden className="font-display text-xl font-semibold uppercase tracking-wide text-foreground">Dakika</span>}
    </span>
  );
}
