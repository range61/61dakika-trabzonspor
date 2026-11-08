import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Search, X } from "lucide-react";
import { useMemo } from "react";
import { Container, PageHeader } from "@/components/common/PageHeader";
import { EmptyState, ListSkeleton, RouteError, Section } from "@/components/common/States";
import { SourceBar } from "@/components/common/SourceBar";
import { NewsCard } from "@/components/news/NewsCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NEWS_CATEGORIES } from "@/lib/data/config";
import { newsQuery } from "@/lib/data/queries";
import type { NewsCategory } from "@/lib/data/types";
import { trLower } from "@/lib/format";
import { seo } from "@/lib/seo";

interface NewsSearch {
  q?: string;
  kategori?: NewsCategory;
  kaynak?: string;
}

export const Route = createFileRoute("/haberler/")({
  validateSearch: (s: Record<string, unknown>): NewsSearch => ({
    q: typeof s.q === "string" && s.q ? s.q.slice(0, 80) : undefined,
    kategori: typeof s.kategori === "string" && s.kategori in NEWS_CATEGORIES ? (s.kategori as NewsCategory) : undefined,
    kaynak: typeof s.kaynak === "string" && s.kaynak ? s.kaynak : undefined,
  }),
  head: () =>
    seo("Trabzonspor haberleri", "Trabzonspor ile ilgili son haber başlıkları ve kısa özetler; her haber yayıncısının sitesine bağlanır."),
  loader: ({ context }) => context.queryClient.ensureQueryData(newsQuery()).then(() => undefined),
  component: NewsPage,
  errorComponent: RouteError,
});

function NewsPage() {
  return (
    <Container className="py-8 sm:py-10">
      <PageHeader
        eyebrow="Haberler"
        title="Trabzonspor gündemi"
        description="Yayıncıların herkese açık akışlarından başlıklar ve kısa özetler. Haberin tamamı her zaman kaynağında okunur."
      />
      <div className="mt-6">
        <Section errorTitle="Haberler yüklenemedi" fallback={<ListSkeleton rows={6} height={120} />}>
          <NewsList />
        </Section>
      </div>
    </Container>
  );
}

function NewsList() {
  const { data: env } = useSuspenseQuery(newsQuery());
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/haberler/" });
  const sources = useMemo(() => [...new Set(env.data.map((n) => n.source.name))], [env.data]);

  const filtered = useMemo(() => {
    const q = trLower(search.q ?? "");
    return env.data.filter(
      (n) =>
        (!search.kategori || n.category === search.kategori) &&
        (!search.kaynak || n.source.name === search.kaynak) &&
        (!q || trLower(`${n.title} ${n.excerpt}`).includes(q)),
    );
  }, [env.data, search]);

  const set = (patch: Partial<NewsSearch>) => navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true });

  return (
    <>
      <div className="flex flex-col gap-3">
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={search.q ?? ""}
            onChange={(e) => set({ q: e.target.value || undefined })}
            placeholder="Haberlerde ara…"
            aria-label="Haberlerde ara"
            className="pl-9"
          />
        </div>
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-none sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Kategori">
          <Button size="sm" variant="chip" data-active={!search.kategori} onClick={() => set({ kategori: undefined })}>
            Tümü
          </Button>
          {(Object.keys(NEWS_CATEGORIES) as NewsCategory[]).map((c) => (
            <Button key={c} size="sm" variant="chip" data-active={search.kategori === c} onClick={() => set({ kategori: search.kategori === c ? undefined : c })}>
              {NEWS_CATEGORIES[c]}
            </Button>
          ))}
        </div>
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-none sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Kaynak">
          <span className="self-center text-xs text-muted-foreground">Kaynak:</span>
          <Button size="sm" variant="chip" data-active={!search.kaynak} onClick={() => set({ kaynak: undefined })}>
            Hepsi
          </Button>
          {sources.map((s) => (
            <Button key={s} size="sm" variant="chip" data-active={search.kaynak === s} onClick={() => set({ kaynak: search.kaynak === s ? undefined : s })}>
              {s}
            </Button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">{filtered.length} haber</p>
        {(search.q || search.kategori || search.kaynak) && (
          <Button variant="ghost" size="sm" onClick={() => navigate({ search: {}, replace: true })}>
            <X /> Filtreleri temizle
          </Button>
        )}
      </div>

      {filtered.length ? (
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((n) => (
            <NewsCard key={n.id} item={n} />
          ))}
        </div>
      ) : (
        <div className="mt-3">
          <EmptyState title="Sonuç bulunamadı" message="Farklı bir arama ya da kategori deneyin." />
        </div>
      )}
      <SourceBar className="mt-6" envelope={env} queryKey={["news"]} />
    </>
  );
}