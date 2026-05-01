// --------------------------------------------------------
// IMPORTS
// --------------------------------------------------------

import { getArticles } from "@/lib/api";
import { ArticleCard } from "./article-card";

// --------------------------------------------------------
// PROPS
// --------------------------------------------------------

type Props = {
    query: string;
    category: string;
};

// --------------------------------------------------------
// SEARCH RESULTS
// --------------------------------------------------------

export async function SearchResults({ query, category }: Props) {
    const isDefault = query.length === 0 && category.length === 0;

    // --------------------------------------------------------
    // RESULT LIMIT
    // The product spec caps active search results at 5 so the
    // best matches stay above the fold. The empty default
    // state surfaces 6 recent stories instead, which fits a
    // clean 2x3 grid on desktop.
    // --------------------------------------------------------
    const limit = query.length > 0 ? 5 : 6;

    const { articles } = await getArticles({
        search: query || undefined,
        category: category || undefined,
        limit,
    });

    // --------------------------------------------------------
    // EMPTY STATE
    // --------------------------------------------------------
    if (articles.length === 0) {
        return (
            <div className="rounded-xl border border-dashed border-neutral-300 p-8 text-center">
                <p className="text-xs uppercase tracking-widest text-neutral-500">
                    No results
                </p>
                <p className="mt-2 text-base">
                    {query
                        ? `No articles match “${query}”${category ? ` in ${category}` : ""}.`
                        : "No articles found for this filter."}
                </p>
                <p className="mt-1 text-sm text-neutral-600">
                    Try a different search term or clear the category filter.
                </p>
            </div>
        );
    }

    return (
        <div>
            {/* RESULTS HEADER */}
            <div className="mb-4 flex items-center justify-between text-[10px] uppercase tracking-widest text-neutral-500">
                <span>
                    {isDefault ? "Recent articles" : `Results for “${query || "all"}”`}
                    {category ? ` · ${category}` : ""}
                </span>
                <span>
                    {articles.length} {articles.length === 1 ? "story" : "stories"}
                </span>
            </div>

            {/* RESULTS GRID */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {articles.map((article) => (
                    <ArticleCard key={article.id} article={article} />
                ))}
            </div>
        </div>
    );
}

// --------------------------------------------------------
// LOADING FALLBACK
// Skeleton tiles that match the article-card footprint so
// the grid doesn't reflow when the real results stream in.
// --------------------------------------------------------

export function SearchResultsFallback() {
    return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
                <div
                    key={i}
                    className="flex animate-pulse flex-col overflow-hidden rounded-lg border border-neutral-200"
                >
                    <div className="aspect-16/10 bg-neutral-100" />
                    <div className="space-y-2 p-4">
                        <div className="h-3 w-1/3 rounded bg-neutral-200" />
                        <div className="h-5 w-full rounded bg-neutral-200" />
                        <div className="h-4 w-5/6 rounded bg-neutral-200" />
                    </div>
                </div>
            ))}
        </div>
    );
}
