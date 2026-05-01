"use client";

// --------------------------------------------------------
// IMPORTS
// --------------------------------------------------------

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Category } from "@/lib/types";

// --------------------------------------------------------
// PROPS
// --------------------------------------------------------

type Props = {
    initialQuery: string;
    initialCategory: string;
    categories: Category[];
};

// --------------------------------------------------------
// SEARCH FORM
// --------------------------------------------------------

export function SearchForm({
    initialQuery,
    initialCategory,
    categories,
}: Props) {
    // --------------------------------------------------------
    // LOCAL STATE
    // --------------------------------------------------------

    const router = useRouter();
    const [query, setQuery] = useState(initialQuery);
    const [category, setCategory] = useState(initialCategory);
    const [isPending, startTransition] = useTransition();
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // --------------------------------------------------------
    // URL → STATE SYNC
    // The query/category may change from outside this form
    // (browser back/forward, a parent navigation). These
    // effects keep the local inputs aligned with the URL so
    // we don't show stale values after a non-form nav.
    // --------------------------------------------------------
    useEffect(() => {
        setQuery(initialQuery);
    }, [initialQuery]);
    useEffect(() => {
        setCategory(initialCategory);
    }, [initialCategory]);

    // --------------------------------------------------------
    // NAVIGATION HELPERS
    // --------------------------------------------------------

    // PUSH STATE INTO THE URL
    function pushUrl(nextQuery: string, nextCategory: string) {
        const params = new URLSearchParams();
        if (nextQuery) params.set("q", nextQuery);
        if (nextCategory) params.set("category", nextCategory);
        const qs = params.toString();
        startTransition(() => {
            router.replace(qs ? `/search?${qs}` : "/search");
        });
    }

    // --------------------------------------------------------
    // DEBOUNCED SCHEDULER
    // We only navigate when the field is empty (which resets
    // the page to its default state) or when the visitor has
    // typed three or more characters. The 250ms debounce
    // keeps us from thrashing the route on every keystroke.
    // --------------------------------------------------------
    function scheduleSearch(nextQuery: string, nextCategory: string) {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (nextQuery.length === 0 || nextQuery.length >= 3) {
            debounceRef.current = setTimeout(() => {
                pushUrl(nextQuery, nextCategory);
            }, 250);
        }
    }

    // --------------------------------------------------------
    // INPUT HANDLERS
    // --------------------------------------------------------

    function onQueryChange(e: React.ChangeEvent<HTMLInputElement>) {
        const next = e.target.value;
        setQuery(next);
        scheduleSearch(next, category);
    }

    function onCategoryChange(e: React.ChangeEvent<HTMLSelectElement>) {
        const next = e.target.value;
        setCategory(next);
        pushUrl(query, next);
    }

    function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (debounceRef.current) clearTimeout(debounceRef.current);
        pushUrl(query, category);
    }

    return (
        <form
            action="/search"
            method="get"
            onSubmit={onSubmit}
            className="flex flex-col gap-3 rounded-xl border border-neutral-300 bg-neutral-100 p-4 sm:flex-row sm:items-stretch"
            role="search"
            aria-label="Search articles"
        >
            {/* --------------------------------------------------------
            QUERY INPUT
            -------------------------------------------------------- */}
            <div className="flex-1">
                <label htmlFor="search-query" className="sr-only">
                    Search articles
                </label>
                <input
                    id="search-query"
                    type="search"
                    name="q"
                    value={query}
                    onChange={onQueryChange}
                    placeholder="Search articles…"
                    autoComplete="off"
                    className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-base transition focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10"
                />
            </div>

            {/* --------------------------------------------------------
            CATEGORY SELECT
            -------------------------------------------------------- */}
            <div>
                <label htmlFor="search-category" className="sr-only">
                    Filter by category
                </label>
                <select
                    id="search-category"
                    name="category"
                    value={category}
                    onChange={onCategoryChange}
                    className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-base transition focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10 sm:w-48"
                >
                    <option value="">All categories</option>
                    {categories.map((cat) => (
                        <option key={cat.slug} value={cat.slug}>
                            {cat.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* SUBMIT BUTTON */}
            <button
                type="submit"
                className="rounded-md border border-black bg-black px-5 py-2 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-white hover:text-black"
                aria-busy={isPending}
            >
                {isPending ? "Searching…" : "Search"}
            </button>
        </form>
    );
}
