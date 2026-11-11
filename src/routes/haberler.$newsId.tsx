import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/common/PageHeader";
import { RouteError, RouteNotFound } from "@/components/common/States";
import { NewsCard } from "@/components/news/NewsCard";
import { Badge } from "@/components/ui/badge";
import { NEWS_CATEGORIES } from "@/lib/data/config";
import { newsQuery } from "@/lib/data/queries";
import { formatDateTimeShort, formatDateYear } from "@/lib/format";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/haberler/$newsId")({
  loader: async ({ context, params }) => {
    const env = await context.queryClient.ensureQueryData(newsQuery());
    const item = env.data.find((n) => n.id === params.newsId);
    if (!item) throw notFound();
    return { title: item.title, excerpt: item.excerpt };
  },
  head: ({ loaderData }) =>
    loaderData
      ? seo(loaderData.title, loaderData.excerpt || "Trabzonspor haberi — kaynağında okuyun.", { type: "article" })
      : seo("Haber bulunamadı", "Bu haber artık listede değil.", { noindex: true }),
  component: NewsDetail,
  errorComponent: RouteError,
  notFoundComponent: () => (
    <RouteNotFound title="Haber bulunamadı" message="Bu başlık kaynak akışlarından kaldırılmış olabilir. Güncel haberlere göz atın." />
  ),
});

function NewsDetail() {
  const { newsId } = Route.useParams();
  const { data: env } = useSuspenseQuery(newsQuery());
  const item = env.data.find((n) => n.id === newsId);
  if (!item) return <RouteNotFound title="Haber bulunamadı" />;
  const related = env.data.filter((n) => n.id !== item.id && n.category === item.category).slice(0, 3);

  return (
    <Container className="py-8 sm:py-10">
      <Link to="/haberler" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="h-4 w-4" /> Haberler
      </Link>
      <article className="mx-auto mt-6 max-w-2xl">
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="sky">{NEWS_CATEGORIES[item.category]}</Badge>
          <span>{item.source.name}</span>
          <span aria-hidden>·</span>
          <time dateTime={item.publishedAt ?? undefined}>{formatDateYear(item.publishedAt)} · {formatDateTimeShort(item.publishedAt).split(" ").pop()}</time>
        </div>
        <h1 className="mt-4 text-2xl font-semibold leading-tight text-foreground sm:text-3xl">{item.title}</h1>
        {item.excerpt && <p className="mt-4 text-base leading-relaxed text-foreground/80">{item.excerpt}</p>}

        <div className="surface mt-6 p-4">
          <p className="text-sm font-semibold">Haber hakkında</p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Bu haberin yayıncı tarafından paylaşılan RSS açıklaması yukarıda gösteriliyor. Kaynak akışında tam haber metni bulunmadığı için devamını uydurarak eklemiyoruz. 61Dakika'da yalnızca doğrulanabilir kaynak bilgilerini paylaşıyoruz.
          </p>
          <p className="mt-3 text-xs text-muted-foreground">Haber kaynağı: {item.source.name}</p>
        </div>
      </article>

      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-3 font-display text-lg font-semibold uppercase">Benzer haberler</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((n) => (
              <NewsCard key={n.id} item={n} />
            ))}
          </div>
        </section>
      )}
    </Container>
  );
}