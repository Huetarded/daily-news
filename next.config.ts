// --------------------------------------------------------
// IMPORTS
// --------------------------------------------------------

import type { NextConfig } from "next";

// --------------------------------------------------------
// NEXT CONFIG
// --------------------------------------------------------

const nextConfig: NextConfig = {
    
    // --------------------------------------------------------
    // CACHE COMPONENTS
    // Opts the project into Next 16's Cache Components model
    // so the `"use cache"` directive and cacheLife/cacheTag
    // primitives used in lib/api.ts and the footer take
    // effect at build and request time.
    // --------------------------------------------------------
    cacheComponents: true,

    // TURBOPACK ROOT
    turbopack: {
        root: __dirname,
    },

    // --------------------------------------------------------
    // REMOTE IMAGE PATTERNS
    // Article hero and inline images live in a Vercel Blob
    // store. Next/Image refuses to optimise remote sources
    // unless the host is whitelisted here.
    // --------------------------------------------------------
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "i8qy5y6gxkdgdcv9.public.blob.vercel-storage.com",
                pathname: "/**",
            },
        ],
    },
};

export default nextConfig;
