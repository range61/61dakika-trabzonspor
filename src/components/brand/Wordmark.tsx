import { cn } from "@/lib/utils";

const CREST = "https://cdn.trabzonspor.org.tr/ed5615de86e84e4292fedcf65d4b3be4.png";

/** 61Dakika publisher mark paired with the current official Trabzonspor crest. */
export function Wordmark({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)} aria-label="61Dakika Trabzonspor">
      <img src={CREST} alt="Trabzonspor" width={30} height={36} className="h-9 w-auto object-contain" />
      <span aria-hidden className="relative grid h-8 w-8 place-items-center overflow-hidden rounded-lg bg-primary font-display text-[1.05rem] font-bold leading-none text-primary-foreground">
        61<span className="absolute inset-x-0 bottom-0 h-1 bg-sky" />
      </span>
      {!compact && <span aria-hidden className="font-display text-xl font-semibold uppercase tracking-wide text-foreground">Dakika</span>}
    </span>
  );
}
