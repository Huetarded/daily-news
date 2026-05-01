// --------------------------------------------------------
// IMPORTS
// --------------------------------------------------------

import type { Metadata } from "next";
import { Suspense } from "react";
import { getCategories } from "@/lib/api";
import { SearchForm } from "@/components/search-form";
import {
    SearchResults,
    SearchResultsFallback,
} from "@/components/search-results";

// --------------------------------------------------------
// PAGE METADATA
// --------------------------------------------------------

export const metadata: Metadata = {
    title: "Search",
    description:
        "Search every article in Vercel Daily by keyword and filter by category.",
    openGraph: {
        title: "Search — Vercel Daily",
        description:
            "Search every article in Vercel Daily by keyword and filter by category.",
        type: "website",
    },
};

// --------------------------------------------------------
// SEARCH PARAM HELPERS
// --------------------------------------------------------

type Search = {
    q?: string | string[];
    category?: string | string[];
};

// --------------------------------------------------------
// PICK STRING
// Next.js may surface a search param as either a string or
// a string[] depending on how many times the key shows up
// in the query string. Collapse to a single string so the
// downstream form code never has to branch on the shape.
// --------------------------------------------------------
function pickString(value: string | string[] | undefined): string {
    if (Array.isArray(value)) return value[0] ?? "";
    return value ?? "";
}

// --------------------------------------------------------
// SEARCH PAGE
// --------------------------------------------------------

export default function SearchPage(props: {
    searchParams: Promise<Search>;
}) {
    return (
        <section className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6">
            {/* PAGE HEADER */}
            <header className="flex flex-col gap-3 border-b border-black pb-6">
                <p className="text-xs uppercase tracking-widest text-neutral-500">
                    Search
                </p>
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                    Find an article
                </h1>
                <p className="max-w-2xl text-sm text-neutral-700">
                    Search by keyword or filter by category. Press Enter, click search, or
                    just keep typing.
                </p>
            </header>

            {/* --------------------------------------------------------
            INTERACTIVE BLOCK
            The form + results are streamed inside their own
            Suspense boundary so the static page header renders
            immediately while we await searchParams and the
            categories fetch.
            -------------------------------------------------------- */}
            <Suspense fallback={<SearchInteractiveFallback />}>
                <SearchInteractive paramsPromise={props.searchParams} />
            </Suspense>
        </section>
    );
}

// --------------------------------------------------------
// SEARCH INTERACTIVE
// Awaits the search params and the category list, then
// hands them to the client form. Results stream inside a
// nested Suspense keyed on the active query+category so a
// new search shows the fallback while it fetches.
// --------------------------------------------------------

async function SearchInteractive({
    paramsPromise,
}: {
    paramsPromise: Promise<Search>;
}) {
    const sp = await paramsPromise;
    const query = pickString(sp.q).trim();
    const category = pickString(sp.category).trim();
    const categories = await getCategories();

    return (
        <>
            <SearchForm
                initialQuery={query}
                initialCategory={category}
                categories={categories}
            />
            <Suspense
                key={`${query}|${category}`}
                fallback={<SearchResultsFallback />}
            >
                <SearchResults query={query} category={category} />
            </Suspense>
        </>
    );
}

// --------------------------------------------------------
// INTERACTIVE FALLBACK
// Shown while the searchParams promise resolves. Mirrors
// the shape of the form + results grid so the page doesn't
// reflow when the real content streams in.
// --------------------------------------------------------

function SearchInteractiveFallback() {
    return (
        <>
            <div
                aria-hidden="true"
                className="h-16 w-full animate-pulse rounded-xl border border-neutral-200"
            />
            <SearchResultsFallback />
        </>
    );
}
