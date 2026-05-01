// --------------------------------------------------------
// IMPORTS
// --------------------------------------------------------

import Link from "next/link";
import { Suspense } from "react";
import {
    SubscriptionIndicator,
    SubscriptionIndicatorFallback,
} from "./subscription-indicator";

// --------------------------------------------------------
// HEADER
// --------------------------------------------------------

export function Header() {
    return (
        <header className="border-b border-black">
            <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
                
                {/* WORDMARK */}
                <Link href="/" className="text-lg font-bold uppercase tracking-widest">
                    Vercel Daily
                </Link>

                {/* --------------------------------------------------------
                PRIMARY NAV
                -------------------------------------------------------- */}
                <nav className="flex items-center gap-6 text-sm uppercase tracking-wider">
                    <Link
                        href="/"
                        className="underline-offset-4 hover:underline"
                    >
                        Home
                    </Link>
                    <Link
                        href="/search"
                        className="underline-offset-4 hover:underline"
                    >
                        Search
                    </Link>

                    {/* --------------------------------------------------------
                    SUBSCRIPTION INDICATOR
                    The indicator depends on per-request cookie state, so
                    it cannot be prerendered with the rest of the layout.
                    The Suspense boundary streams a placeholder while the
                    subscription lookup resolves on each request.
                    -------------------------------------------------------- */}
                    <Suspense fallback={<SubscriptionIndicatorFallback />}>
                        <SubscriptionIndicator />
                    </Suspense>
                </nav>
            </div>
        </header>
    );
}
