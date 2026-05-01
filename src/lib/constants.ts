// --------------------------------------------------------
// SHARED CONSTANTS
// --------------------------------------------------------

// COOKIE & HEADER NAMES

export const SUBSCRIPTION_COOKIE = "vd_subscription_token";
export const SUBSCRIPTION_STATE_HEADER = "x-subscription-state";
export const PROXY_OBSERVABILITY_HEADER = "x-vd-proxy";

// --------------------------------------------------------
// PROXY SUBSCRIPTION STATE
// The proxy stamps each request with one of these two
// values via the SUBSCRIPTION_STATE_HEADER. Server
// components downstream read the header instead of
// re-checking the cookie or calling the subscription API.
// --------------------------------------------------------

export type ProxySubscriptionState = "subscribed" | "anonymous";
