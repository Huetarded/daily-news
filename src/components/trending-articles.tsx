// --------------------------------------------------------
// IMPORTS
// --------------------------------------------------------

import Link from "next/link";
import Image from "next/image";
import { getTrendingArticles } from "@/lib/api";
import { formatCategoryLabel, formatPublishDate } from "@/lib/format";

// --------------------------------------------------------
// PROPS
// --------------------------------------------------------

// --------------------------------------------------------
// EXCLUDE ID
// When rendered on an article detail page we pass the
// current article's id so it doesn't appear in its own
// "Trending Now" rail.
// --------------------------------------------------------

type Props = {
    excludeId?: string;
};

// --------------------------------------------------------
// TRENDING ARTICLES
// --------------------------------------------------------

export async function TrendingArticles({ excludeId }: Props) {
    let trending;

    // FAIL-SOFT FETCH — TRENDING IS NON-ESSENTIAL
    try {
        trending = await getTrendingArticles(excludeId ? [excludeId] : []);
    } catch {
        return null;
    }

    // CAP AT FOUR FOR THE 2x2 GRID
    const items = trending.slice(0, 4);
    if (items.length === 0) return null;

    return (
        <section
            aria-labelledby="trending-articles-heading"
            className="border-t border-black bg-neutral-100"
        >
            <div className="mx-auto max-w-3xl px-4 py-12 sm:px-0">
                
                {/* SECTION HEADING */}
                <div className="mb-6 flex items-end justify-between border-b border-black pb-3">
                    <h2
                        id="trending-articles-heading"
                        className="text-xs uppercase tracking-widest"
                    >
                        Trending Now
                    </h2>
                    <span className="text-[10px] uppercase tracking-widest text-neutral-500">
                        {items.length} stories
                    </span>
                </div>

                {/* --------------------------------------------------------
                ARTICLE LIST
                -------------------------------------------------------- */}
                <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {items.map((article) => (
                        <li
                            key={article.id}
                            className="flex items-start gap-3 rounded-lg border border-neutral-200 p-3 transition-shadow hover:shadow-sm"
                        >
                            {/* THUMBNAIL */}
                            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md border border-neutral-200 bg-neutral-100">
                                {article.image ? (
                                    <Image
                                        src={article.image}
                                        alt={article.title}
                                        fill
                                        sizes="64px"
                                        className="object-cover"
                                    />
                                ) : null}
                            </div>

                            {/* TEXT BLOCK */}
                            <div className="flex flex-col gap-1">
                                <div className="text-[10px] uppercase tracking-widest text-neutral-600">
                                    <span>{formatCategoryLabel(article.category)}</span>
                                    <span aria-hidden="true"> · </span>
                                    <time dateTime={article.publishedAt}>
                                        {formatPublishDate(article.publishedAt)}
                                    </time>
                                </div>
                                <Link
                                    href={`/articles/${article.slug}`}
                                    className="text-sm font-semibold leading-snug underline-offset-4 hover:underline"
                                >
                                    {article.title}
                                </Link>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}

// --------------------------------------------------------
// LOADING FALLBACK
// Mirrors the trending grid's footprint with skeleton tiles
// so the page doesn't reflow once the data streams in.
// --------------------------------------------------------

export function TrendingArticlesFallback() {
    return (
        <section className="border-t border-black bg-neutral-100">
            <div className="mx-auto max-w-3xl px-4 py-12 sm:px-0">
                <div className="mb-6 h-6 w-40 animate-pulse rounded bg-neutral-200" />
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div
                            key={i}
                            className="h-24 animate-pulse rounded-lg border border-neutral-200"
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
