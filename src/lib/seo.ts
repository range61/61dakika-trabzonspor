/** Builds per-route head meta with consistent title/description/og/twitter tags. */
export function seo(title: string, description: string, opts: { type?: "website" | "article"; noindex?: boolean } = {}) {
  const full = title.includes("61Dakika") ? title : `${title} · 61Dakika`;
  const meta: Record<string, string>[] = [
    { title: full },
    { name: "description", content: description },
    { property: "og:title", content: full },
    { property: "og:description", content: description },
    { property: "og:type", content: opts.type ?? "website" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: full },
    { name: "twitter:description", content: description },
  ];
  if (opts.noindex) meta.push({ name: "robots", content: "noindex" });
  return { meta };
}