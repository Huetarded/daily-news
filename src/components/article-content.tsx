// --------------------------------------------------------
// IMPORTS
// --------------------------------------------------------

import Image from "next/image";
import type { ReactNode } from "react";
import type { ContentBlock } from "@/lib/types";

// --------------------------------------------------------
// PROPS
// --------------------------------------------------------

type Props = {
    blocks: ContentBlock[];
};

// --------------------------------------------------------
// INLINE MARKDOWN RENDERER
// --------------------------------------------------------

// --------------------------------------------------------
// INLINE MARKDOWN REGEX
// Matches either a `[text](url)` link or a `**bold**` run.
// Capture groups:
//   1: full link match
//   2: link text
//   3: link href
//   4: full bold match
//   5: bold text
// --------------------------------------------------------
const INLINE_MARKDOWN_RE =
    /(\[([^\]]+)\]\(([^)]+)\))|(\*\*([^*]+)\*\*)/g;

// --------------------------------------------------------
// RENDER INLINE
// The article API ships paragraph, heading, and list text
// with inline markdown (`**bold**` and `[text](url)`). We
// walk the regex matches and emit React nodes for the
// formatted spans, passing untouched text through verbatim.
// --------------------------------------------------------
function renderInline(text: string): ReactNode {
    const out: ReactNode[] = [];
    let lastIndex = 0;
    let key = 0;

    for (const match of text.matchAll(INLINE_MARKDOWN_RE)) {
        const start = match.index ?? 0;

        // PRECEDING PLAIN TEXT
        if (start > lastIndex) {
            out.push(text.slice(lastIndex, start));
        }

        // LINK MATCH
        if (match[1]) {
            out.push(
                <a
                    key={key++}
                    href={match[3]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline decoration-neutral-400 underline-offset-2 transition-colors hover:decoration-black"
                >
                    {match[2]}
                </a>
            );
        }
        // BOLD MATCH
        else if (match[4]) {
            out.push(<strong key={key++}>{match[5]}</strong>);
        }

        lastIndex = start + match[0].length;
    }

    // TRAILING PLAIN TEXT
    if (lastIndex < text.length) {
        out.push(text.slice(lastIndex));
    }

    return out.length === 1 ? out[0] : out;
}

// --------------------------------------------------------
// ARTICLE CONTENT
// --------------------------------------------------------

export function ArticleContent({ blocks }: Props) {
    return (
        <div className="flex flex-col gap-6 text-base leading-relaxed text-neutral-900">
            {blocks.map((block, i) => {
                switch (block.type) {
                    // PARAGRAPH
                    case "paragraph":
                        return (
                            <p key={i} className="text-base leading-relaxed">
                                {renderInline(block.text)}
                            </p>
                        );

                    // HEADING (LEVEL 2 OR 3)
                    case "heading":
                        return block.level === 2 ? (
                            <h2
                                key={i}
                                className="mt-4 border-b border-neutral-300 pb-2 text-2xl font-bold tracking-tight"
                            >
                                {renderInline(block.text)}
                            </h2>
                        ) : (
                            <h3
                                key={i}
                                className="mt-2 text-xl font-semibold tracking-tight"
                            >
                                {renderInline(block.text)}
                            </h3>
                        );

                    // BLOCKQUOTE
                    case "blockquote":
                        return (
                            <blockquote
                                key={i}
                                className="border-l-4 border-black pl-4 text-lg italic text-neutral-800"
                            >
                                {renderInline(block.text)}
                            </blockquote>
                        );

                    // UNORDERED LIST
                    case "unordered-list":
                        return (
                            <ul key={i} className="list-disc space-y-1 pl-6">
                                {block.items.map((item, j) => (
                                    <li key={j}>{renderInline(item)}</li>
                                ))}
                            </ul>
                        );

                    // ORDERED LIST
                    case "ordered-list":
                        return (
                            <ol key={i} className="list-decimal space-y-1 pl-6">
                                {block.items.map((item, j) => (
                                    <li key={j}>{renderInline(item)}</li>
                                ))}
                            </ol>
                        );

                    // --------------------------------------------------------
                    // IMAGE
                    // The API occasionally hands back image blocks with an
                    // empty `src`. Returning null short-circuits the render so
                    // Next/Image never throws and the article layout stays
                    // intact.
                    // --------------------------------------------------------
                    case "image":
                        if (!block.src) return null;
                        return (
                            <figure
                                key={i}
                                className="overflow-hidden rounded-lg border border-neutral-200"
                            >
                                <div className="relative aspect-video w-full overflow-hidden bg-neutral-100">
                                    <Image
                                        src={block.src}
                                        alt={block.alt}
                                        fill
                                        sizes="(min-width: 1024px) 768px, 100vw"
                                        className="object-cover"
                                    />
                                </div>
                                {block.caption ? (
                                    <figcaption className="border-t border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-600">
                                        {block.caption}
                                    </figcaption>
                                ) : null}
                            </figure>
                        );
                }
            })}
        </div>
    );
}
