// --------------------------------------------------------
// POSTCSS CONFIG
// Wires Tailwind v4's PostCSS plugin into the build. The
// rest of Tailwind's configuration lives in globals.css
// via the `@import "tailwindcss"` directive and the
// `@theme inline` block.
// --------------------------------------------------------

const config = {
    plugins: {
        "@tailwindcss/postcss": {},
    },
};

export default config;