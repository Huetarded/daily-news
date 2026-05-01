// --------------------------------------------------------
// IMPORTS
// --------------------------------------------------------

import { cookies, headers } from "next/headers";
import { getSubscription } from "./api";
import {
    SUBSCRIPTION_COOKIE,
    SUBSCRIPTION_STATE_HEADER,
} from "./constants";
import type { SubscriptionStatus } from "./types";

// --------------------------------------------------------
// RE-EXPORTS
// --------------------------------------------------------

export { SUBSCRIPTION_COOKIE };

// --------------------------------------------------------
// COOKIE LIFETIME
// Mirrors the API's token expiry. Keeping the two values
// in lockstep prevents the UI from believing a visitor is
// subscribed after the upstream token has already expired.
// --------------------------------------------------------

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24;

// --------------------------------------------------------
// COOKIE HELPERS
// --------------------------------------------------------

// READ TOKEN
export async function readSubscriptionToken(): Promise<string | undefined> {
    const store = await cookies();
    return store.get(SUBSCRIPTION_COOKIE)?.value;
}

// WRITE TOKEN
export async function writeSubscriptionToken(token: string) {
    const store = await cookies();
    store.set(SUBSCRIPTION_COOKIE, token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: COOKIE_MAX_AGE_SECONDS,
    });
}

// CLEAR TOKEN
export async function clearSubscriptionToken() {
    const store = await cookies();
    store.delete(SUBSCRIPTION_COOKIE);
}

// --------------------------------------------------------
// SUBSCRIPTION STATE
// --------------------------------------------------------

export type SubscriptionState = {
    status: SubscriptionStatus | "none";
    token: string | null;
};

// --------------------------------------------------------
// GET SUBSCRIPTION STATE
// Resolves the visitor's current subscription by reading
// the token cookie and asking the API. If the API can't
// find the token we treat it as stale and proactively
// clear the cookie so the UI doesn't keep re-asking.
// --------------------------------------------------------

export async function getSubscriptionState(): Promise<SubscriptionState> {
    const token = await readSubscriptionToken();
    if (!token) return { status: "none", token: null };

    const subscription = await getSubscription(token);
    if (!subscription) {
        await clearSubscriptionToken();
        return { status: "none", token: null };
    }
    return { status: subscription.status, token };
}

// --------------------------------------------------------
// IS SUBSCRIBED
// --------------------------------------------------------

export async function isSubscribed(): Promise<boolean> {
    // --------------------------------------------------------
    // FAST-PATH GUARD
    // The proxy stamps every request with an "anonymous" or
    // "subscribed" header up front, but that snapshot is
    // taken at request entry. A Server Action can write the
    // subscription cookie partway through the same request,
    // so we only short-circuit when the proxy AND the live
    // cookie store agree there is no token. Otherwise we
    // hit the subscription API for an authoritative answer.
    // --------------------------------------------------------
    const [h, store] = await Promise.all([headers(), cookies()]);
    const proxySaysAnonymous =
        h.get(SUBSCRIPTION_STATE_HEADER) === "anonymous";
    const hasCookie = store.has(SUBSCRIPTION_COOKIE);
    if (proxySaysAnonymous && !hasCookie) return false;

    const state = await getSubscriptionState();
    return state.status === "active";
}
