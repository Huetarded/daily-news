// --------------------------------------------------------
// IMPORTS
// --------------------------------------------------------

import Link from "next/link";
import { getBreakingNews } from "@/lib/api";

// --------------------------------------------------------
// BREAKING NEWS BANNER
// --------------------------------------------------------

export async function BreakingNewsBanner() {
    let breaking;

    // --------------------------------------------------------
    // FAIL-SOFT FETCH
    // The banner is non-essential chrome — if the breaking
    // news endpoint is down or slow, swallow the error and
    // render nothing rather than crashing the whole layout.
    // --------------------------------------------------------
    try {
        breaking = await getBreakingNews();
    } catch {
        return null;
    }

    return (
        <section
            aria-label="Breaking news"
            className="border-y border-black bg-black text-white"
        >
            <div className="mx-auto flex max-w-6xl items-center justify-center gap-3 px-4 py-3 text-center sm:px-6">
                {/* URGENCY PILL */}
                <span
                    className="shrink-0 rounded border border-white px-2 py-0.5 text-[10px] uppercase tracking-widest"
                    aria-label={breaking.urgent ? "Urgent breaking news" : "Breaking news"}
                >
                    {breaking.urgent ? "Breaking" : "Latest"}
                </span>

                {/* HEADLINE LINK */}
                <Link
                    href={`/articles/${breaking.articleId}`}
                    className="text-sm font-semibold underline-offset-4 hover:underline"
                >
                    {breaking.headline}
                </Link>
            </div>
        </section>
    );
}

// --------------------------------------------------------
// LOADING FALLBACK
// Rendered inside a Suspense boundary while the banner
// fetch is in flight. Reserves the same vertical space the
// real banner will occupy so the page doesn't reflow when
// the data resolves.
// --------------------------------------------------------

export function BreakingNewsBannerFallback() {
    return (
        <div
            aria-hidden="true"
            className="border-y border-black bg-black/90 px-4 py-3 sm:px-6"
        >
            <div className="mx-auto h-5 w-full max-w-6xl animate-pulse rounded bg-neutral-700" />
        </div>
    );
}
