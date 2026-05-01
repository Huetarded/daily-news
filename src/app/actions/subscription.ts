"use server";

// --------------------------------------------------------
// IMPORTS
// --------------------------------------------------------

import { revalidatePath } from "next/cache";
import {
    activateSubscription,
    createSubscription,
    deactivateSubscription,
} from "@/lib/api";
import {
    clearSubscriptionToken,
    readSubscriptionToken,
    writeSubscriptionToken,
} from "@/lib/subscription";

// --------------------------------------------------------
// SUBSCRIBE ACTION
// --------------------------------------------------------

export async function subscribeAction() {
    const existing = await readSubscriptionToken();

    // --------------------------------------------------------
    // REUSE EXISTING TOKEN IF VALID
    // The visitor may already hold a token from a previous
    // session. Try to re-activate it before minting a new one
    // so we don't churn through tokens on every page load.
    // If the API rejects the token (stale, revoked, expired)
    // we clear the cookie and fall through to issue a fresh
    // subscription instead of surfacing the error to the UI.
    // --------------------------------------------------------
    if (existing) {
        try {
            await activateSubscription(existing);
            revalidatePath("/", "layout");
            return;
        } catch {
            await clearSubscriptionToken();
        }
    }

    // CREATE A FRESH SUBSCRIPTION
    const { token } = await createSubscription();
    await activateSubscription(token);
    await writeSubscriptionToken(token);
    revalidatePath("/", "layout");
}

// --------------------------------------------------------
// UNSUBSCRIBE ACTION
// --------------------------------------------------------

export async function unsubscribeAction() {
    const token = await readSubscriptionToken();
    if (token) {
        await deactivateSubscription(token);
    }
    await clearSubscriptionToken();
    revalidatePath("/", "layout");
}
