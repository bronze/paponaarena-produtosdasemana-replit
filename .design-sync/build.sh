#!/usr/bin/env bash
# Builds the inputs the design-sync converter reads: .d.ts contracts and the compiled Tailwind CSS.
set -euo pipefail
cd "$(dirname "$0")/.."
rm -rf .design-sync/pkg/dist
npx tsc -p .design-sync/pkg/tsconfig.json
npx tailwindcss -c .design-sync/tailwind.config.ts -i client/src/index.css -o .design-sync/pkg/dist/styles.css --minify
# Plus Jakarta Sans is served by Google Fonts in client/index.html; carry the same import into the synced CSS.
{ echo '@import url("https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&display=swap");'; cat .design-sync/pkg/dist/styles.css; } > .design-sync/pkg/dist/styles.tmp && mv .design-sync/pkg/dist/styles.tmp .design-sync/pkg/dist/styles.css
