// --------------------------------------------------------
// IMPORTS
// --------------------------------------------------------

import type { Metadata } from "next";
import { Suspense } from "react";
import {
    BreakingNewsBanner,
    BreakingNewsBannerFallback,
} from "@/components/breaking-news-banner";
import { FeaturedArticles } from "@/components/featured-articles";

// --------------------------------------------------------
// PAGE METADATA
// `title.absolute` overrides the layout's title template
// so the home page reads as the publication name rather
// than getting the "%s | Vercel Daily" treatment.
// --------------------------------------------------------

export const metadata: Metadata = {
    title: { absolute: "Vercel Daily — News for modern web developers" },
    description:
        "Breaking changelog, engineering deep-dives, customer stories, and community updates from across the Vercel ecosystem.",
    openGraph: {
        title: "Vercel Daily — News for modern web developers",
        description:
            "Breaking changelog, engineering deep-dives, customer stories, and community updates from across the Vercel ecosystem.",
        type: "website",
    },
};

// --------------------------------------------------------
// HOME PAGE
// --------------------------------------------------------

export default function HomePage() {
    return (
        <>
            {/* --------------------------------------------------------
                BREAKING NEWS BANNER
                Streamed in via Suspense so a slow breaking-news fetch
                never holds up the rest of the home page.
                -------------------------------------------------------- */}
            <Suspense fallback={<BreakingNewsBannerFallback />}>
                <BreakingNewsBanner />
            </Suspense>

            {/* --------------------------------------------------------
            HERO
            -------------------------------------------------------- */}
            <section className="hero-bg border-b border-black">
                <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
                    <div className="flex max-w-2xl flex-col gap-6">
                        <p className="text-xs uppercase tracking-widest text-neutral-500">
                            Daily Edition
                        </p>
                        <h1 className="text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
                            The pulse of the modern web,
                            <br />
                            delivered daily.
                        </h1>
                        <p className="text-base text-neutral-700 sm:text-lg font-medium">
                            Vercel Daily is a fictional newsroom following the people,
                            products, and engineering decisions shaping the modern web.
                            Subscribe to read every article in full or browse the highlights
                            below.
                        </p>
                    </div>
                </div>
            </section>

            {/* FEATURED ARTICLES */}
            <FeaturedArticles />
        </>
    );
}
