// --------------------------------------------------------
// IMPORTS
// --------------------------------------------------------

import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// --------------------------------------------------------
// ESLINT CONFIG
// --------------------------------------------------------

const eslintConfig = defineConfig([
    ...nextVitals,
    ...nextTs,

    // --------------------------------------------------------
    // GLOBAL IGNORES
    // We restate eslint-config-next's default ignore list
    // explicitly because passing our own globalIgnores call
    // overrides theirs entirely. Re-listing keeps build,
    // output, and the auto-generated next-env.d.ts skipped.
    // --------------------------------------------------------
    globalIgnores([
        ".next/**",
        "out/**",
        "build/**",
        "next-env.d.ts",
    ]),
]);

export default eslintConfig;
