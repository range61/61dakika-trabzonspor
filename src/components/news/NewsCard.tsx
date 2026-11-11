import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { NEWS_CATEGORIES } from "@/lib/data/config";
import type { NewsItem } from "@/lib/data/types";
import { formatDateTimeShort } from "@/lib/format";

export function NewsCard({ item, compact = false }: { item: NewsItem; compact?: boolean }) {
  return (
    <article className="surface surface-interactive group relative flex h-full flex-col p-4 sm:p-5">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Badge variant="sky">{NEWS_CATEGORIES[item.category]}</Badge>
        <span className="truncate">{item.source.name}</span>
        <span aria-hidden>·</span>
        <time className="shrink-0 tabular" dateTime={item.publishedAt ?? undefined}>
          {formatDateTimeShort(item.publishedAt)}
        </time>
      </div>
      <h3 className="mt-3 text-[0.98rem] font-semibold leading-snug text-foreground">
        <Link to="/haberler/$newsId" params={{ newsId: item.id }} className="after:absolute after:inset-0 group-hover:text-primary">
          {item.title}
        </Link>
      </h3>
      {!compact && item.excerpt && <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{item.excerpt}</p>}
      <div className="mt-auto pt-4">
        <span className="relative z-10 inline-flex items-center gap-1 text-xs font-semibold text-primary">
          61Dakika'da oku
        </span>
      </div>
    </article>
  );
}