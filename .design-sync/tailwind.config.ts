// Sync-only Tailwind config: the app's config plus a safelist, so the design
// agent in Claude Design has the token-backed utilities beyond what the app
// currently happens to use.
import base from "../tailwind.config";

const colors = "background|foreground|border|card|card-foreground|primary|primary-foreground|secondary|secondary-foreground|muted|muted-foreground|accent|accent-foreground|destructive|destructive-foreground|highlight|sidebar|sidebar-foreground|sidebar-border|sidebar-primary|sidebar-accent|brand-tint|ring|chart-[1-8]";

export default {
  ...base,
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}", "./.design-sync/previews/**/*.tsx"],
  safelist: [
    { pattern: new RegExp(`^(bg|text|border)-(${colors})(\\/(10|50|70))?$`) },
    { pattern: /^(p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|gap|gap-x|gap-y|space-y|space-x)-(0|1|2|3|4|5|6|8|10|12|16|20|24)$/ },
    { pattern: /^text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl)$/ },
    { pattern: /^font-(normal|medium|semibold|bold|extrabold)$/ },
    { pattern: /^rounded(-(sm|md|lg|xl|full))?$/ },
    { pattern: new RegExp(`^ring-(${colors})$`) },
    { pattern: /^(grid-cols|col-span)-(1|2|3|4|6|12)$/ },
    "font-sans", "antialiased", "min-h-screen", "page-title", "page-lead", "detail-title", "hover-elevate", "active-elevate-2", "tabular-nums", "uppercase",
  ],
};
