// --------------------------------------------------------
// DOMAIN PRIMITIVES
// --------------------------------------------------------

// CATEGORY SLUGS

export type CategorySlug =
    | "changelog"
    | "engineering"
    | "customers"
    | "company-news"
    | "community";

// AUTHOR

export type Author = {
    name: string;
    avatar: string;
};

// --------------------------------------------------------
// CONTENT BLOCK
// Discriminated union returned by the article API. The
// renderer in article-content.tsx switches on `type` to
// pick the right element. Image blocks occasionally arrive
// with an empty `src` and must be guarded at render time.
// --------------------------------------------------------

export type ContentBlock =
    | { type: "paragraph"; text: string }
    | { type: "heading"; level: 2 | 3; text: string }
    | { type: "blockquote"; text: string }
    | { type: "unordered-list"; items: string[] }
    | { type: "ordered-list"; items: string[] }
    | { type: "image"; src: string; alt: string; caption?: string };

// --------------------------------------------------------
// ARTICLES & BREAKING NEWS
// --------------------------------------------------------

// ARTICLE
export type Article = {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: ContentBlock[];
    category: CategorySlug | string;
    author: Author;
    image: string;
    publishedAt: string;
    featured: boolean;
    tags: string[];
};

// BREAKING NEWS
export type BreakingNews = {
    id: string;
    headline: string;
    summary: string;
    articleId: string;
    category: string;
    publishedAt: string;
    urgent: boolean;
};

// --------------------------------------------------------
// SUBSCRIPTIONS
// --------------------------------------------------------

// SUBSCRIPTION STATUS & RECORD
export type SubscriptionStatus = "active" | "inactive";

export type Subscription = {
    token: string;
    status: SubscriptionStatus;
    subscribedAt: string | null;
    createdAt: string;
    updatedAt: string;
};

// --------------------------------------------------------
// TAXONOMY & PAGINATION
// --------------------------------------------------------

// CATEGORY
export type Category = {
    slug: CategorySlug | string;
    name: string;
    articleCount: number;
};

// PAGINATION META
export type PaginationMeta = {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
};

// --------------------------------------------------------
// PUBLICATION CONFIG
// Returned by the publication-config endpoint. Drives the
// site name, feature flags, social links, and SEO defaults
// rendered in the root layout.
// --------------------------------------------------------

export type PublicationConfig = {
    publicationName: string;
    language: string;
    features: {
        newsletter: boolean;
        bookmarks: boolean;
        comments: boolean;
        darkMode: boolean;
        searchSuggestions: boolean;
    };
    socialLinks: {
        twitter?: string;
        github?: string;
        discord?: string;
    };
    seo: {
        defaultTitle: string;
        titleTemplate: string;
        defaultDescription: string;
    };
};

// --------------------------------------------------------
// API ENVELOPES
// --------------------------------------------------------

// --------------------------------------------------------
// SUCCESS ENVELOPE
// `meta` is conditional: list endpoints attach pagination
// info, single-resource endpoints don't. The conditional
// type keeps callers from having to hand-check for `meta`
// when they know they're calling a single-resource route.
// --------------------------------------------------------

export type ApiSuccess<T, M = undefined> = M extends undefined
    ? { success: true; data: T }
    : { success: true; data: T; meta: M };

// ERROR ENVELOPE
export type ApiError = {
    success: false;
    error: {
        code: "VALIDATION_ERROR" | "BAD_REQUEST" | "NOT_FOUND" | "INTERNAL_SERVER_ERROR" | string;
        message: string;
        details?: unknown;
    };
};

// --------------------------------------------------------
// REQUEST PARAMS
// --------------------------------------------------------

// LIST ARTICLES PARAMS
export type ListArticlesParams = {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    featured?: "true" | "false";
};
