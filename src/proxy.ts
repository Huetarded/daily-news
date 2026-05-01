// --------------------------------------------------------
// IMPORTS
// --------------------------------------------------------

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
    PROXY_OBSERVABILITY_HEADER,
    SUBSCRIPTION_COOKIE,
    SUBSCRIPTION_STATE_HEADER,
    type ProxySubscriptionState,
} from "@/lib/constants";

// --------------------------------------------------------
// PROXY
// Stamps each incoming request with the visitor's coarse
// subscription state before it reaches the route handler.
// --------------------------------------------------------

export function proxy(request: NextRequest) {
    
    // SNAPSHOT THE COOKIE PRESENCE AT REQUEST ENTRY
    const hasToken = request.cookies.has(SUBSCRIPTION_COOKIE);
    const state: ProxySubscriptionState = hasToken ? "subscribed" : "anonymous";

    // --------------------------------------------------------
    // FORWARD ACCESS-CONTROL SIGNAL
    // Server components downstream read this header to decide
    // whether to render the gated content or the paywall —
    // skipping a redundant cookie read or subscription API
    // call on every render. The header is the proxy's
    // contract with the rest of the app.
    // --------------------------------------------------------
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set(SUBSCRIPTION_STATE_HEADER, state);

    const response = NextResponse.next({
        request: { headers: requestHeaders },
    });

    // --------------------------------------------------------
    // OBSERVABILITY MARKER
    // Stamps the response so we can confirm in network logs
    // that the proxy actually ran on a given request — useful
    // when debugging matcher misses.
    // --------------------------------------------------------
    response.headers.set(PROXY_OBSERVABILITY_HEADER, "1");

    return response;
}

// --------------------------------------------------------
// PROXY CONFIG
// Articles are the only paywalled surface, so we scope the
// matcher to that segment to keep the proxy off every
// static asset and unrelated route.
// --------------------------------------------------------

export const config = {
    matcher: ["/articles/:path*"],
};
