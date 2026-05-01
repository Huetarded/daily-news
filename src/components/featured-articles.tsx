// --------------------------------------------------------
// IMPORTS
// --------------------------------------------------------

import { getArticles } from "@/lib/api";
import { ArticleCard } from "./article-card";

// --------------------------------------------------------
// FEATURED ARTICLES
// --------------------------------------------------------

export async function FeaturedArticles() {

    // --------------------------------------------------------
    // FEATURED-FIRST WITH FALLBACK
    // We pull the curated featured set first. If editorial
    // hasn't flagged enough stories to fill the 6-slot grid,
    // we top up from the general feed and de-dupe by id so
    // the same article never appears twice.
    // --------------------------------------------------------
    const featured = await getArticles({ featured: "true", limit: 12 });
    const articles = featured.articles;

    if (articles.length < 6) {
        const general = await getArticles({ limit: 12 });
        const existing = new Set(articles.map((a) => a.id));
        for (const article of general.articles) {
            if (!existing.has(article.id)) articles.push(article);
            if (articles.length >= 6) break;
        }
    }

    // EMPTY STATE
    if (articles.length === 0) {
        return (
            <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
                <p className="text-sm text-neutral-600">No articles available.</p>
            </section>
        );
    }

    const grid = articles.slice(0, 6);

    return (
        <section
            aria-labelledby="featured-articles-heading"
            className="mx-auto max-w-6xl px-4 py-12 sm:px-6"
        >
            {/* SECTION HEADING */}
            <div className="mb-6 flex items-end justify-between border-b border-black pb-3">
                <h2
                    id="featured-articles-heading"
                    className="text-xs uppercase tracking-widest"
                >
                    Featured Articles
                </h2>
                <span className="text-[10px] uppercase tracking-widest text-neutral-500">
                    {grid.length} stories
                </span>
            </div>

            {/* --------------------------------------------------------
            ARTICLE GRID
            The first card is flagged `priority` so its image is
            eager-loaded as the LCP candidate above the fold.
            -------------------------------------------------------- */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {grid.map((article, i) => (
                    <ArticleCard
                        key={article.id}
                        article={article}
                        priority={i === 0}
                    />
                ))}
            </div>
        </section>
    );
}
