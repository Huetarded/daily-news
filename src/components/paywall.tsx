// --------------------------------------------------------
// IMPORTS
// --------------------------------------------------------

import type { ContentBlock } from "@/lib/types";
import { subscribeAction } from "@/app/actions/subscription";
import { ArticleContent } from "./article-content";

// --------------------------------------------------------
// PROPS
// --------------------------------------------------------

type Props = {
    previewBlocks: ContentBlock[];
};

// --------------------------------------------------------
// PAYWALL
// --------------------------------------------------------

export function Paywall({ previewBlocks }: Props) {
    return (
        <section
            aria-label="Subscriber paywall"
            className="overflow-hidden rounded-xl border border-neutral-300 bg-white shadow-sm"
        >
            {/* --------------------------------------------------------
            PREVIEW WITH FADE
            The mask gradient fades the trailing portion of the
            preview blocks into transparency. It's a visual cue —
            the truncation itself happens server-side; we never
            ship the gated content to the client.
            -------------------------------------------------------- */}
            <div className="px-6 pb-2 pt-6 sm:px-8 sm:pt-8">
                <div
                    style={{
                        maskImage:
                            "linear-gradient(to bottom, black 55%, transparent 100%)",
                        WebkitMaskImage:
                            "linear-gradient(to bottom, black 55%, transparent 100%)",
                    }}
                >
                    <ArticleContent blocks={previewBlocks} />
                </div>
            </div>

            {/* --------------------------------------------------------
            CONVERSION BLOCK
            -------------------------------------------------------- */}
            <div className="border-t border-neutral-200 p-6 sm:p-8">
                <p className="text-xs uppercase tracking-widest text-neutral-500">
                    Subscriber-only article
                </p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                    Continue reading with a free subscription.
                </h2>
                <p className="mt-3 max-w-2xl text-sm text-neutral-700">
                    Vercel Daily is reader-supported. Subscribe to read every article in
                    full. No credit card required, no spam, unsubscribe at any time.
                </p>

                {/* SUBSCRIBE FORM */}
                <form action={subscribeAction} className="mt-6">
                    <button
                        type="submit"
                        className="rounded-md border border-black bg-black px-6 py-3 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-white hover:text-black"
                    >
                        Subscribe to read more
                    </button>
                </form>
            </div>
        </section>
    );
}
