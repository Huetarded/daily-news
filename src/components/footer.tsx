// --------------------------------------------------------
// IMPORTS
// --------------------------------------------------------

import { cacheLife } from "next/cache";

// --------------------------------------------------------
// FOOTER
// --------------------------------------------------------

export async function Footer() {

  // --------------------------------------------------------
  // CACHE DIRECTIVE
  // The footer renders the same markup for every visitor
  // until the year rolls over, so we tag it with the Next
  // 16 `"use cache"` directive and a multi-week cache life.
  // The function gets prerendered into the layout shell.
  // --------------------------------------------------------
  
  "use cache";
  cacheLife("weeks");

  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-black">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-xs uppercase tracking-wider sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>&copy; {year} Vercel Daily. All rights reserved.</p>
        <p className="text-neutral-500">A News Publication</p>
      </div>
    </footer>
  );
}
