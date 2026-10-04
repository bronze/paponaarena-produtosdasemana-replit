# design-sync notes — Papo na Arena

Claude Design project: https://claude.ai/design/p/b993bca1-9f49-43f2-a514-cb8d3e13929d (first synced 2026-10-04).

## How this repo is synced

- This is an app, not a DS package. `.design-sync/pkg/` is a thin wrapper package (`papo-na-arena-ds`): `index.ts` re-exports the brand-core components from `client/src`. **To sync more components, add exports there**, plus a `componentSrcMap` entry, a `docs/<Name>.md` category stub and a `previews/<Name>.tsx`.
- `buildCmd` = `.design-sync/build.sh`. It emits `.d.ts` via `tsc -p .design-sync/pkg/tsconfig.json` and compiles Tailwind with `.design-sync/tailwind.config.ts` (app config + safelist) into `.design-sync/pkg/dist/styles.css`, which is gitignored. It also prepends the Plus Jakarta Sans Google Fonts `@import`. Run it before the converter on every sync.
- Scope is brand core only (user's choice): Button, Badge, Card (subparts excluded from cards via `componentSrcMap: null` but still exported), StatBand, LatestEpisode, RankRow, ShareBar, SortButtons, LoadMore, ShowAllButton. The other ~40 stock shadcn/ui parts are deliberately not synced.
- Groups come from `docs/<Name>.md` frontmatter stubs (Primitives / Ranking / Highlights).
- Cards for Button, Badge, Card, LoadMore, RankRow, StatBand, LatestEpisode use `cardMode: column`, because the multi-variant rows overflowed grid cells.
- Commands: `node .ds-sync/...` scripts need `NODE_PATH=$PWD/.ds-sync/node_modules` so playwright resolves. Use playwright **1.58.2**, which matches the cached `chromium-1208`.
- The shell is zsh: `for n in ${list}` does NOT word-split. Use explicit lists or bash.

## Known render warns

- `[TOKENS_MISSING]` 25 vars (`--radix-*`, `--sidebar-width`, `--skeleton-width`): set at runtime by Radix/shadcn components, expected.

## Re-sync risks

- Preview data (episode #136, leaderboard counts, 103/642/1.476/409 stats) is inlined in `previews/*.tsx` as of 2026-10-04 and will drift from `client/src/lib/data.ts`. It's cosmetic only; refresh it when you touch the previews.
- `latest-episode.tsx` imports `@/lib/analytics` (posthog shim). `posthog-js` is only dynamically imported in `initAnalytics`, which previews never call. If analytics starts doing work at import time, previews may break.
- The safelist in `.design-sync/tailwind.config.ts` decides which utilities the design agent can use beyond what the app uses. `conventions.md` names classes that must stay in it (`font-sans`, `antialiased`, `min-h-screen` are only `@apply`'d in the app).
- On the first sync the driver's validate stage failed once with no visible error and passed on an immediate re-run. Treat it as a flake; re-run once before digging in.
