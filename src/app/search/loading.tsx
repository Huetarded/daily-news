// --------------------------------------------------------
// IMPORTS
// --------------------------------------------------------

import { SearchResultsFallback } from "@/components/search-results";

// --------------------------------------------------------
// SEARCH LOADING STATE
// Rendered by Next.js while the /search route is preparing
// to stream. Mirrors the page layout (header, form, grid)
// with skeleton blocks so the visitor sees the shape of
// the page immediately.
// --------------------------------------------------------

export default function Loading() {
    return (
        <section className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6">

            {/* HEADER PLACEHOLDER */}
            <div className="space-y-3 border-b border-black pb-6">
                <div className="h-3 w-16 animate-pulse rounded bg-neutral-200" />
                <div className="h-9 w-2/3 animate-pulse rounded bg-neutral-200" />
                <div className="h-4 w-3/4 animate-pulse rounded bg-neutral-200" />
            </div>

            {/* FORM PLACEHOLDER */}
            <div className="h-16 w-full animate-pulse rounded-xl border border-neutral-200" />

            {/* RESULTS PLACEHOLDER */}
            <SearchResultsFallback />
        </section>
    );
}
