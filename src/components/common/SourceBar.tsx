import { RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDateTimeShort } from "@/lib/format";
import { useRefresh } from "@/lib/data/queries";
import type { DataEnvelope } from "@/lib/data/types";
import { cn } from "@/lib/utils";

/** Attribution + last-updated timestamp + manual refresh for one data envelope. */
export function SourceBar({
  envelope,
  queryKey,
  live = false,
  className,
}: {
  envelope: DataEnvelope<unknown>;
  queryKey: readonly unknown[];
  live?: boolean;
  className?: string;
}) {
  const { refresh, pending, error } = useRefresh(queryKey);
  const { source } = envelope;
  return (
    <div className={cn("flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-muted-foreground", className)}>
      {source.isDemo && <Badge variant="demo">Örnek veri · gerçek değildir</Badge>}
      {live && (
        <span className="inline-flex items-center gap-1.5 font-medium text-live">
          <span className="h-1.5 w-1.5 rounded-full bg-live animate-live" /> Otomatik yenileniyor
        </span>
      )}
      <span>
        Kaynak:{" "}
        {source.url.startsWith("http") ? (
          <a href={source.url} target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:underline">
            {source.name}
          </a>
        ) : (
          source.name
        )}
        {source.note && <span className="hidden sm:inline"> · {source.note}</span>}
      </span>
      <span className="tabular">Son güncelleme: {formatDateTimeShort(envelope.fetchedAt)}</span>
      <Button variant="ghost" size="sm" className="h-7 px-2" onClick={refresh} disabled={pending} aria-label="Verileri yenile">
        <RefreshCw className={cn(pending && "animate-spin")} /> Yenile
      </Button>
      {error && <span className="text-destructive">{error}</span>}
    </div>
  );
}