# Papo na Arena Radar — replit.md

## Overview

**Papo na Arena Radar** is a dashboard/analytics app that tracks which products, services, and tools are mentioned in each episode of the "Papo na Arena" podcast (available on YouTube and Spotify). It provides leaderboards, charts, and detail pages for episodes, products, categories, and people.

All data (episodes, products, people, mentions) is **hardcoded in the frontend** — there is no live database backing the main app data. The server exists mostly as a shell (Express + static file serving), with a PostgreSQL schema defined for user authentication that is not yet wired up to any app features.

Key capabilities:
- Dashboard with stats, bar/pie/line charts
- Episodes list + detail (participants, mentions per person)
- Products leaderboard + detail (mention history, child variants, combos)
- Categories leaderboard + detail
- People list + detail (all products a person has mentioned)
- Dark/light theme toggle
- Sidebar navigation
- Smart mention aggregation: child products roll up to parent; combo products credit multiple products simultaneously

---

## User Preferences

Preferred communication style: Simple, everyday language.

---

## System Architecture

### Frontend

- **Framework:** React 18 (via Vite, not RSC)
- **Language:** TypeScript
- **Routing:** `wouter` — lightweight client-side routing with routes for `/`, `/episodes/:id`, `/products/:id`, `/categories/:name`, `/people/:id`
- **UI Components:** shadcn/ui (New York style) built on Radix UI primitives
- **Styling:** Tailwind CSS with CSS variables for theming; custom light and dark mode tokens in `client/src/index.css`
- **Charts:** Recharts (BarChart, PieChart, LineChart via ResponsiveContainer)
- **State/Data Fetching:** TanStack React Query is installed, but all app data is currently served from in-memory static arrays in `client/src/lib/data.ts` — no API calls are made for podcast data
- **Theme:** Custom `ThemeProvider` context persists dark/light preference to `localStorage`; defaults to dark mode

### Data Model (Frontend, Hardcoded)

All core data lives in `client/src/lib/data.ts` as typed arrays:

| Entity | Key Fields |
|--------|-----------|
| `Episode` | `id`, `title`, `date`, `description`, `youtubeLink`, `spotifyLink` |
| `Product` | `id`, `name`, `category`, `url?`, `parentId?`, `alsoCredits?` |
| `Person` | `id`, `name`, `linkedinUrl?`, `avatarUrl?` |
| `Mention` | `id`, `episodeId`, `personId`, `productId`, `context?` |

**Aggregation rules** (enforced in `client/src/lib/data-utils.ts`):
- Products with `parentId` → mentions roll up to the root parent (recursive); child products are hidden from leaderboards
- Products with `alsoCredits` (combo products) → a single mention credits all listed product IDs simultaneously
- Category totals and leaderboards only count root-level (non-child) products

### Backend

- **Runtime:** Node.js with Express 5
- **Dev server:** Vite middleware mode (HMR via `/vite-hmr`)
- **Production build:** esbuild bundles the server; Vite builds the client to `dist/public/`
- **Routes:** Currently only a placeholder — `server/routes.ts` registers no API endpoints
- **Storage:** `MemStorage` class in `server/storage.ts` stores users in-memory (for future auth use)

### Database

- **ORM:** Drizzle ORM configured for PostgreSQL (`drizzle.config.ts`)
- **Schema:** `shared/schema.ts` defines a `users` table (id, username, password) with UUID primary key
- **Migrations:** Output to `./migrations/`
- **Status:** Database is provisioned (requires `DATABASE_URL` env var) but not yet used by any active feature — it's scaffolding for future authentication

### Authentication

- Not yet implemented. Scaffolding exists: `connect-pg-simple`, `express-session`, `passport`, `passport-local` are listed as dependencies, and the user schema/storage interface is defined. No routes or middleware are wired up.

### Path Aliases

| Alias | Resolves To |
|-------|-------------|
| `@/*` | `client/src/*` |
| `@shared/*` | `shared/*` |
| `@assets/*` | `attached_assets/*` |

---

## External Dependencies

### UI & Styling
- **shadcn/ui** — component library (New York style, all components in `client/src/components/ui/`)
- **Radix UI** — headless primitives underlying shadcn components
- **Tailwind CSS** — utility-first styling
- **Lucide React** — icon library
- **class-variance-authority + clsx + tailwind-merge** — class composition utilities

### Charts
- **Recharts** — used for BarChart, PieChart, LineChart on dashboard and detail pages

### Data / Forms
- **TanStack React Query** — installed and configured (`queryClient.ts`), ready for API calls if backend data endpoints are added
- **React Hook Form + @hookform/resolvers** — form handling (available, not yet used in main flows)
- **Zod + drizzle-zod** — schema validation

### Backend / Database
- **Express 5** — HTTP server
- **Drizzle ORM** — PostgreSQL ORM
- **pg** — PostgreSQL client
- **connect-pg-simple** — session store (unused, scaffolded)
- **express-session + passport + passport-local** — auth stack (unused, scaffolded)

### Routing
- **wouter** — client-side routing (replaces React Router)

### Dev / Build
- **Vite + @vitejs/plugin-react** — frontend dev server and build
- **tsx** — TypeScript execution for server dev
- **esbuild** — server production bundling
- **@replit/vite-plugin-runtime-error-modal** — Replit-specific dev overlay
- **@replit/vite-plugin-cartographer + vite-plugin-dev-banner** — Replit dev tools (conditionally loaded)

### Fonts (Google Fonts, loaded via CDN in `index.html`)
- DM Sans, Geist Mono, Fira Code, Architects Daughter