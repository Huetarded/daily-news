// --------------------------------------------------------
// IMPORTS
// --------------------------------------------------------

import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { getPublicationConfig } from "@/lib/api";
import type { PublicationConfig } from "@/lib/types";

// --------------------------------------------------------
// FONTS
// --------------------------------------------------------

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

// --------------------------------------------------------
// SITE CONFIG
// --------------------------------------------------------

const SITE_URL = process.env.SITE_URL ?? "http://localhost:3000";

// --------------------------------------------------------
// FALLBACK PUBLICATION CONFIG
// Used only when the publication-config endpoint is
// unreachable. We'd rather render the site with sensible
// defaults than fail the entire layout because a config
// API is having a bad day.
// --------------------------------------------------------

const FALLBACK_CONFIG: PublicationConfig = {
    publicationName: "Vercel Daily",
    language: "en",
    features: {
        newsletter: false,
        bookmarks: false,
        comments: false,
        darkMode: false,
        searchSuggestions: false,
    },
    socialLinks: {},
    seo: {
        defaultTitle: "Vercel Daily — News for modern web developers",
        titleTemplate: "%s | Vercel Daily",
        defaultDescription:
            "The latest changelog, engineering, and community news from across the Vercel ecosystem.",
    },
};

// SAFE WRAPPER AROUND THE PUBLICATION CONFIG FETCH
async function safeGetConfig(): Promise<PublicationConfig> {
    try {
        return await getPublicationConfig();
    } catch {
        return FALLBACK_CONFIG;
    }
}

// --------------------------------------------------------
// METADATA & VIEWPORT
// --------------------------------------------------------

export async function generateMetadata(): Promise<Metadata> {
    const config = await safeGetConfig();
    return {
        metadataBase: new URL(SITE_URL),
        title: {
            default: config.seo.defaultTitle,
            template: config.seo.titleTemplate,
        },
        description: config.seo.defaultDescription,
        applicationName: config.publicationName,
        openGraph: {
            type: "website",
            siteName: config.publicationName,
            title: config.seo.defaultTitle,
            description: config.seo.defaultDescription,
            locale: "en_US",
            url: SITE_URL,
        },
        twitter: {
            card: "summary_large_image",
            title: config.publicationName,
            description: config.seo.defaultDescription,
        },
    };
}

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
};

// --------------------------------------------------------
// ROOT LAYOUT
// --------------------------------------------------------

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const config = await safeGetConfig();
    return (
        <html
            lang={config.language}
            className={`${geistSans.variable} h-full antialiased`}
        >
            <body className="flex min-h-full flex-col bg-white text-black">
                <Header />
                <main className="flex-1">{children}</main>
                <Footer />
            </body>
        </html>
    );
}
