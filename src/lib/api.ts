// --------------------------------------------------------
// IMPORTS
// --------------------------------------------------------

import { cacheLife, cacheTag } from "next/cache";
import type {
    Article,
    ApiError,
    BreakingNews,
    Category,
    ListArticlesParams,
    PaginationMeta,
    PublicationConfig,
    Subscription,
} from "./types";

// --------------------------------------------------------
// CONFIG
// --------------------------------------------------------

const BASE_URL = process.env.API_BASE_URL ?? "https://vercel-daily-news-api.vercel.app/api";

// --------------------------------------------------------
// PROTECTION BYPASS TOKEN
// The upstream API sits behind Vercel Deployment Protection
// in non-production environments. This token is sent on
// every request so server-side fetches can reach it; it is
// blank in production where protection is disabled.
// --------------------------------------------------------
const BYPASS = process.env.API_BYPASS_TOKEN ?? "";

// --------------------------------------------------------
// API ERROR TYPE
// Thrown by `apiFetch` whenever the response is non-2xx or
// the envelope reports `success: false`. Carrying the HTTP
// status lets callers branch on 404 vs other failures.
// --------------------------------------------------------

class ApiHttpError extends Error {
    status: number;
    code: string;
    constructor(status: number, code: string, message: string) {
        super(message);
        this.status = status;
        this.code = code;
    }
}

// --------------------------------------------------------
// URL BUILDER
// Skips undefined / null / empty params so we don't ship
// `?category=` style noise to the API.
// --------------------------------------------------------

function buildUrl(path: string, params?: Record<string, string | number | undefined>) {
    const url = new URL(`${BASE_URL}${path}`);
    if (params) {
        for (const [key, value] of Object.entries(params)) {
            if (value === undefined || value === "" || value === null) continue;
            url.searchParams.set(key, String(value));
        }
    }
    return url.toString();
}

// --------------------------------------------------------
// CORE FETCH WRAPPER
// Single point that knows how to talk to the API: builds
// the URL, attaches the bypass header and accept type,
// unwraps the success envelope, and converts errors into
// the typed `ApiHttpError`. Every fetcher below routes
// through here so caching, headers, and error shape stay
// consistent across the whole library.
// --------------------------------------------------------

async function apiFetch<T>(
    path: string,
    init: RequestInit & {
        params?: Record<string, string | number | undefined>;
    } = {}
): Promise<{ data: T; headers: Headers; meta?: { pagination: PaginationMeta } }> {
    const { params, headers, ...rest } = init;
    const res = await fetch(buildUrl(path, params), {
        ...rest,
        headers: {
            "x-vercel-protection-bypass": BYPASS,
            accept: "application/json",
            ...(headers ?? {}),
        },
    });

    const json = (await res.json().catch(() => null)) as
        | { success: true; data: T; meta?: { pagination: PaginationMeta } }
        | ApiError
        | null;

    if (!res.ok || !json || json.success === false) {
        const code = json && "error" in json ? json.error.code : "INTERNAL_SERVER_ERROR";
        const message =
            json && "error" in json ? json.error.message : `Request failed with status ${res.status}`;
        throw new ApiHttpError(res.status, code, message);
    }

    return { data: json.data, headers: res.headers, meta: json.meta };
}

export { ApiHttpError };

// --------------------------------------------------------
// CACHED FETCHERS
// Used for content that backs the prerendered shell. Each
// one declares its own cacheLife and cacheTag so we can
// revalidate them independently when content changes.
// --------------------------------------------------------

// LIST ARTICLES
export async function getArticles(params: ListArticlesParams = {}) {
    "use cache";
    cacheLife("hours");
    cacheTag("articles");
    const { data, meta } = await apiFetch<Article[]>("/articles", { params });
    return { articles: data, pagination: meta?.pagination };
}

// SINGLE ARTICLE
export async function getArticle(idOrSlug: string) {
    "use cache";
    cacheLife("hours");
    cacheTag("articles", `article:${idOrSlug}`);
    const { data } = await apiFetch<Article>(`/articles/${encodeURIComponent(idOrSlug)}`);
    console.log("Fetched article:", data);
    return data;
}

// CATEGORIES
export async function getCategories() {
    "use cache";
    cacheLife("days");
    cacheTag("categories");
    const { data } = await apiFetch<Category[]>("/categories");
    return data;
}

// PUBLICATION CONFIG
export async function getPublicationConfig() {
    "use cache";
    cacheLife("days");
    cacheTag("publication-config");
    const { data } = await apiFetch<PublicationConfig>("/publication/config");
    return data;
}

// --------------------------------------------------------
// UNCACHED FETCHERS
// Endpoints that intentionally vary per-request — breaking
// news rotates and the trending list is randomised — so we
// opt out of the cache with `cache: "no-store"`.
// --------------------------------------------------------

// BREAKING NEWS
export async function getBreakingNews(): Promise<BreakingNews> {
    const { data } = await apiFetch<BreakingNews>("/breaking-news", { cache: "no-store" });
    return data;
}

// TRENDING ARTICLES
export async function getTrendingArticles(excludeIds: string[] = []): Promise<Article[]> {
    const params = excludeIds.length ? { exclude: excludeIds.join(",") } : undefined;
    const { data } = await apiFetch<Article[]>("/articles/trending", {
        params,
        cache: "no-store",
    });
    return data;
}

// --------------------------------------------------------
// SUBSCRIPTION ENDPOINTS
// Token-based and uncached. Every call sends the visitor's
// subscription token via `x-subscription-token` so the API
// can scope the response to that specific subscription.
// --------------------------------------------------------

// --------------------------------------------------------
// GET SUBSCRIPTION
// Returns null on 404 / 400 so callers can treat a missing
// or rejected token as a non-error "no subscription" state
// without unwrapping a thrown `ApiHttpError`.
// --------------------------------------------------------
export async function getSubscription(token: string): Promise<Subscription | null> {
    try {
        const { data } = await apiFetch<Subscription>("/subscription", {
            headers: { "x-subscription-token": token },
            cache: "no-store",
        });
        return data;
    } catch (err) {
        if (err instanceof ApiHttpError && (err.status === 400 || err.status === 404)) {
            return null;
        }
        throw err;
    }
}

// --------------------------------------------------------
// CREATE SUBSCRIPTION
// The API may return the new token either in the response
// body or as an `x-subscription-token` header — we accept
// whichever shows up first, and only throw if neither is
// present (which would mean an upstream contract bug).
// --------------------------------------------------------
export async function createSubscription(): Promise<{ token: string; subscription: Subscription }> {
    const { data, headers } = await apiFetch<Subscription>("/subscription/create", {
        method: "POST",
        cache: "no-store",
    });
    const token = headers.get("x-subscription-token") ?? data.token;
    if (!token) {
        throw new ApiHttpError(500, "INTERNAL_SERVER_ERROR", "Subscription token missing in response");
    }
    return { token, subscription: data };
}

// ACTIVATE SUBSCRIPTION
export async function activateSubscription(token: string): Promise<Subscription> {
    const { data } = await apiFetch<Subscription>("/subscription", {
        method: "POST",
        headers: { "x-subscription-token": token },
        cache: "no-store",
    });
    return data;
}

// --------------------------------------------------------
// DEACTIVATE SUBSCRIPTION
// Returns null on 404 so unsubscribing an already-revoked
// token is a no-op rather than a thrown error.
// --------------------------------------------------------
export async function deactivateSubscription(token: string): Promise<Subscription | null> {
    try {
        const { data } = await apiFetch<Subscription>("/subscription", {
            method: "DELETE",
            headers: { "x-subscription-token": token },
            cache: "no-store",
        });
        return data;
    } catch (err) {
        if (err instanceof ApiHttpError && err.status === 404) return null;
        throw err;
    }
}
