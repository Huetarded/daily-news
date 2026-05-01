// --------------------------------------------------------
// IMPORTS
// --------------------------------------------------------

import Image from "next/image";
import Link from "next/link";
import type { Article } from "@/lib/types";
import { formatCategoryLabel, formatPublishDate } from "@/lib/format";

// --------------------------------------------------------
// PROPS
// --------------------------------------------------------

// --------------------------------------------------------
// PRIORITY FLAG
// `priority` is used for above-the-fold cards on the home
// feed — it switches the image to eager loading and high
// fetch priority so the LCP image isn't deferred.
// --------------------------------------------------------

type Props = {
    article: Article;
    priority?: boolean;
};

// --------------------------------------------------------
// ARTICLE CARD
// --------------------------------------------------------

export function ArticleCard({ article, priority = false }: Props) {
    return (
        <article className="group flex flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white transition-all duration-200 hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-md">
            <Link
                href={`/articles/${article.slug}`}
                className="flex flex-1 flex-col"
            >
                {/* --------------------------------------------------------
                COVER IMAGE
                -------------------------------------------------------- */}
                <div className="relative aspect-16/10 w-full overflow-hidden border-b border-neutral-200 bg-neutral-100">
                    {article.image ? (
                        <Image
                            src={article.image}
                            alt={article.title}
                            fill
                            loading={priority ? "eager" : "lazy"}
                            fetchPriority={priority ? "high" : "auto"}
                            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                        />
                    ) : null}
                </div>

                {/* --------------------------------------------------------
                CARD BODY
                -------------------------------------------------------- */}
                <div className="flex flex-1 flex-col gap-3 p-4">
                    {/* META ROW */}
                    <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-neutral-600">
                        <span>{formatCategoryLabel(article.category)}</span>
                        <time dateTime={article.publishedAt}>
                            {formatPublishDate(article.publishedAt)}
                        </time>
                    </div>

                    {/* TITLE */}
                    <h3 className="text-lg font-semibold leading-tight tracking-tight underline-offset-4 group-hover:underline">
                        {article.title}
                    </h3>

                    {/* EXCERPT */}
                    {article.excerpt ? (
                        <p className="line-clamp-3 text-sm text-neutral-700">
                            {article.excerpt}
                        </p>
                    ) : null}
                </div>
            </Link>
        </article>
    );
}
