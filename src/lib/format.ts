// --------------------------------------------------------
// FORMATTING HELPERS
// --------------------------------------------------------

// PUBLISH DATE
export function formatPublishDate(iso: string): string {
    const date = new Date(iso);

    // --------------------------------------------------------
    // INVALID INPUT FALLBACK
    // If the API returns a non-ISO string we hand the raw
    // value back rather than rendering "Invalid Date" in the
    // UI. The article view stays readable either way.
    // --------------------------------------------------------
    if (Number.isNaN(date.getTime())) return iso;

    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

// CATEGORY LABEL
export function formatCategoryLabel(slug: string): string {
    return slug
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
}
