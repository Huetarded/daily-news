// --------------------------------------------------------
// IMPORTS
// --------------------------------------------------------

import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ApiHttpError, getArticle } from "@/lib/api";
import type { ContentBlock } from "@/lib/types";
import { isSubscribed } from "@/lib/subscription";
import { ArticleContent } from "@/components/article-content";
import { Paywall } from "@/components/paywall";
import {
    TrendingArticles,
    TrendingArticlesFallback,
} from "@/components/trending-articles";
import { formatCategoryLabel, formatPublishDate } from "@/lib/format";

// --------------------------------------------------------
// ROUTE PARAMS
// --------------------------------------------------------

type Params = { param: string };

// --------------------------------------------------------
// LOAD ARTICLE
// Wraps the API fetch so a real 404 from the upstream
// service triggers Next's notFound() (which renders the
// nearest not-found.tsx). Any other error is rethrown so
// the route segment's error boundary picks it up.
// --------------------------------------------------------

async function loadArticle(idOrSlug: string) {
    try {
        return await getArticle(idOrSlug);
    } catch (err) {
        if (err instanceof ApiHttpError && err.status === 404) {
            notFound();
        }
        throw err;
    }
}

// --------------------------------------------------------
// METADATA
// Built from the article itself so social cards, the page
// title, and the OG image all reflect the live story. If
// the article fetch fails we fall back to a generic title
// rather than throwing during metadata generation.
// --------------------------------------------------------

export async function generateMetadata(props: {
    params: Promise<Params>;
}): Promise<Metadata> {
    const { param } = await props.params;
    try {
        const article = await getArticle(param);
        return {
            title: article.title,
            description: article.excerpt,
            openGraph: {
                type: "article",
                title: article.title,
                description: article.excerpt,
                images: article.image ? [{ url: article.image }] : undefined,
                publishedTime: article.publishedAt,
                authors: article.author?.name ? [article.author.name] : undefined,
                tags: article.tags,
            },
            twitter: {
                card: "summary_large_image",
                title: article.title,
                description: article.excerpt,
                images: article.image ? [article.image] : undefined,
            },
        };
    } catch {
        return {
            title: "Article",
        };
    }
}

// --------------------------------------------------------
// ARTICLE PAGE
// --------------------------------------------------------

export default function ArticlePage(props: {
    params: Promise<Params>;
}) {
    return (
        <article>
            {/* --------------------------------------------------------
          MAIN ARTICLE
          The body and the trending rail are independent fetches,
          each in its own Suspense boundary so they stream side
          by side without one blocking the other.
          -------------------------------------------------------- */}
            <Suspense fallback={<ArticleSkeleton />}>
                <ArticleView paramsPromise={props.params} />
            </Suspense>

            {/* TRENDING RAIL */}
            <Suspense fallback={<TrendingArticlesFallback />}>
                <TrendingSection paramsPromise={props.params} />
            </Suspense>
        </article>
    );
}

// --------------------------------------------------------
// ARTICLE VIEW
// Resolves the article and the visitor's subscription state
// in parallel, then either renders the full content or the
// paywall preview depending on access.
// --------------------------------------------------------

async function ArticleView({
    paramsPromise,
}: {
    paramsPromise: Promise<Params>;
}) {
    const { param } = await paramsPromise;
    const [article, subscribed] = await Promise.all([
        loadArticle(param),
        isSubscribed(),
    ]);

    // --------------------------------------------------------
    // PAYWALL PREVIEW
    // Anonymous visitors see the first two content blocks. If
    // the article has no body blocks at all, we fall back to
    // a single paragraph built from the excerpt so the paywall
    // never renders an empty teaser.
    // --------------------------------------------------------
    const previewBlocks: ContentBlock[] =
        article.content.length > 0
            ? article.content.slice(0, 2)
            : [{ type: "paragraph", text: article.excerpt }];

    return (
        <>
            {/* --------------------------------------------------------
            ARTICLE HEADER
            -------------------------------------------------------- */}
            <header className="border-b border-black bg-neutral-100">
                <div className="mx-auto flex max-w-3xl flex-col gap-5 px-4 py-12 sm:px-0">
                    <div className="flex flex-wrap items-center gap-3 text-[10px] uppercase tracking-widest text-neutral-600">
                        <span className="rounded-md border border-black px-2 py-0.5">
                            {formatCategoryLabel(article.category)}
                        </span>
                        <span aria-hidden="true">·</span>
                        <time dateTime={article.publishedAt}>
                            {formatPublishDate(article.publishedAt)}
                        </time>
                    </div>
                    <h1 className="text-3xl font-bold leading-[1.1] tracking-tight sm:text-5xl">
                        {article.title}
                    </h1>
                    <p className="text-base text-neutral-700 sm:text-lg">
                        {article.excerpt}
                    </p>
                    <p className="text-xs uppercase tracking-widest text-neutral-700">
                        By {article.author?.name || "Vercel Daily"}
                    </p>
                </div>
            </header>

            {/* --------------------------------------------------------
            HERO IMAGE
            Eager-loaded and high priority — this is the LCP
            candidate on the article view.
            -------------------------------------------------------- */}
            {article.image ? (
                <div className="border-b border-neutral-200">
                    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-0">
                        <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100">
                            <Image
                                src={article.image}
                                alt={article.title}
                                fill
                                loading="eager"
                                fetchPriority="high"
                                sizes="(min-width: 1024px) 768px, 100vw"
                                className="object-cover"
                            />
                        </div>
                    </div>
                </div>
            ) : null}

            {/* --------------------------------------------------------
            BODY OR PAYWALL
            -------------------------------------------------------- */}
            <div className="mx-auto max-w-3xl px-4 py-10 sm:px-0">
                {subscribed ? (
                    <>
                        <ArticleContent blocks={article.content} />
                        <div className="mt-12 border-t border-black pt-8 text-[10px] uppercase tracking-widest text-neutral-500">
                            End of article
                        </div>
                    </>
                ) : (
                    <Paywall previewBlocks={previewBlocks} />
                )}
            </div>
        </>
    );
}

// --------------------------------------------------------
// TRENDING SECTION
// Re-fetches the article only to grab its id for exclusion.
// The fetch is cached upstream, so this is effectively free
// after the main view's request resolves it.
// --------------------------------------------------------

async function TrendingSection({
    paramsPromise,
}: {
    paramsPromise: Promise<Params>;
}) {
    const { param } = await paramsPromise;
    let excludeId: string | undefined;
    try {
        const article = await getArticle(param);
        excludeId = article.id;
    } catch {
        excludeId = undefined;
    }
    return <TrendingArticles excludeId={excludeId} />;
}

// --------------------------------------------------------
// ARTICLE SKELETON
// Placeholder shown while the article view streams in.
// Approximates the eventual layout (title, hero, body)
// to minimise reflow.
// --------------------------------------------------------

function ArticleSkeleton() {
    return (
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-0">
            <div className="h-4 w-24 animate-pulse rounded bg-neutral-200" />
            <div className="mt-4 h-12 w-full animate-pulse rounded bg-neutral-200" />
            <div className="mt-2 h-12 w-2/3 animate-pulse rounded bg-neutral-200" />
            <div className="mt-8 aspect-video w-full animate-pulse rounded-lg bg-neutral-200" />
            <div className="mt-8 space-y-3">
                <div className="h-4 w-full animate-pulse rounded bg-neutral-200" />
                <div className="h-4 w-full animate-pulse rounded bg-neutral-200" />
                <div className="h-4 w-5/6 animate-pulse rounded bg-neutral-200" />
            </div>
        </div>
    );
}
