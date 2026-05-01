// --------------------------------------------------------
// IMPORTS
// --------------------------------------------------------

import { getSubscriptionState } from "@/lib/subscription";
import { subscribeAction, unsubscribeAction } from "@/app/actions/subscription";

// --------------------------------------------------------
// SUBSCRIPTION INDICATOR
// Renders the subscribe/unsubscribe button in the header
// based on the current visitor's subscription state.
// --------------------------------------------------------

export async function SubscriptionIndicator() {
    const { status } = await getSubscriptionState();
    const subscribed = status === "active";

    // SUBSCRIBED → UNSUBSCRIBE BUTTON
    if (subscribed) {
        return (
            <form action={unsubscribeAction}>
                <button
                    type="submit"
                    className="rounded-md border border-black px-3 py-1 text-xs uppercase tracking-wider transition-colors hover:bg-black hover:text-white"
                >
                    Unsubscribe
                </button>
            </form>
        );
    }

    // ANONYMOUS → SUBSCRIBE BUTTON
    return (
        <form action={subscribeAction}>
            <button
                type="submit"
                className="rounded-md border border-black px-3 py-1 text-xs uppercase tracking-wider transition-colors hover:bg-black hover:text-white"
            >
                Subscribe
            </button>
        </form>
    );
}

// --------------------------------------------------------
// LOADING FALLBACK
// Matches the dimensions of the real button so the header
// doesn't shift when the subscription lookup resolves.
// --------------------------------------------------------

export function SubscriptionIndicatorFallback() {
    return (
        <div
            aria-hidden="true"
            className="h-7 w-24 rounded-md border border-neutral-200 bg-neutral-100"
        />
    );
}
