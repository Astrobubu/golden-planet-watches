# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Maison du Temps (Timeless AI)** — E-commerce catalog for authenticated pre-owned luxury watches. Built with Lovable Cloud integration.

## Commands

```bash
npm run dev          # Dev server at http://localhost:8080
npm run build        # Production build
npm run build:dev    # Development mode build
npm run lint         # ESLint
npm run test         # Run tests once (vitest run)
npm run test:watch   # Tests in watch mode (vitest)
npx vitest run src/path/to/file.test.ts   # Run a single test file
```

## Tech Stack

- **Framework:** React 18 + TypeScript (strict mode off) + Vite 5 (SWC)
- **Styling:** Tailwind CSS 3 with CSS variables (HSL) defined in `src/index.css`
- **UI Components:** shadcn/ui (Radix-based), located in `src/components/ui/`
- **Routing:** React Router DOM 6 — routes defined in `src/App.tsx`
- **Server State:** TanStack React Query
- **Animations:** Framer Motion
- **Backend:** Supabase (client at `src/integrations/supabase/client.ts`)
- **Forms:** react-hook-form + zod (validation)
- **Charts:** recharts
- **Icons:** lucide-react
- **Utilities:** date-fns, next-themes
- **Testing:** Vitest + Testing Library (jsdom env, globals enabled)

## Architecture

### Routing (`src/App.tsx`)
- `/` → `pages/Index.tsx` (home with hero, featured watches)
- `/catalog` → `pages/Catalog.tsx` (filterable watch grid)
- `/watch/:id` → `pages/WatchDetail.tsx` (specs, pricing, WhatsApp inquiry)
- `*` → `pages/NotFound.tsx`

### Data Layer
- **Current:** Mock data in `src/lib/mock-watches.ts` (`MOCK_WATCHES` array, `Watch` interface)
- **Future:** Supabase `watches` table with matching schema (types in `src/integrations/supabase/types.ts`)
- **Pricing:** `getDisplayPrice()` applies margin: `basePrice * (1 + marginPercent / 100)`
- **Conditions:** Rating system (A+, A, A-, B+, B) defined in `src/lib/conditions.ts`

### Import Alias
All internal imports use `@/` which maps to `./src/` (configured in `tsconfig.app.json` and `vite.config.ts`).

## Database Schema

Supabase `watches` table (migration: `supabase/migrations/`):
- Columns: `id` (UUID PK), `brand`, `model`, `reference_number`, `description`, `base_price`, `margin_percent` (default 10), `condition_rating` (default 'A'), `year`, `dial_color`, `case_material`, `case_size_mm`, `movement_type`, `original_image_url`, `ai_generated_images` (JSONB), `is_featured`, `is_hero`, `created_at`, `updated_at`
- **RLS:** Public read (`SELECT`) for everyone — this is a public showcase site
- **Storage:** `watch-images` bucket (public read)
- **Trigger:** `update_watches_updated_at` auto-updates `updated_at` on row changes

## Design System

- **Theme:** Dark luxury aesthetic — dark background, gold accents, warm off-white text
- **Fonts:** Playfair Display (serif) for headings/prices, Inter (sans) for body text
- **Custom colors:** `gold`, `gold-light`, `gold-dark`, `surface`, `surface-elevated` (all via CSS variables)
- **Animation pattern:** Framer Motion with `initial`/`animate`/`whileInView`, staggered children via `delay: index * 0.1`

## Environment Variables

Prefixed with `VITE_` for client exposure:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`

## Testing

- jsdom env with `globals: true` — no imports needed for `describe`/`it`/`expect`
- `src/test/setup.ts` mocks `window.matchMedia` (required by `useIsMobile` hook)
- Test file pattern: `src/**/*.{test,spec}.{ts,tsx}`
- Config: `vitest.config.ts` (separate from `vite.config.ts`)

## Key Utilities

- `cn()` in `src/lib/utils.ts` — Tailwind class merger (clsx + twMerge)
- `useIsMobile()` in `src/hooks/use-mobile.tsx` — breakpoint at 768px
- Custom CSS utilities in `src/index.css`: `.text-gold-gradient`, `.bg-luxury-gradient`, `.shadow-gold`, `.border-gold`

## Conventions

- shadcn/ui components are lowercase files (`button.tsx`, `card.tsx`) in `components/ui/`
- Feature components are PascalCase in `components/`
- Local storage keys prefixed with `mdt_`
- No barrel exports — use direct file imports
- Typography: serif (`font-serif`) for headings/brand, sans (`font-sans`) for body/labels
- Label style: `text-[10px] tracking-[0.2em] uppercase text-gold/60`
- Animation durations: fast=0.3s, medium=0.6s, slow=0.8s
- Scroll animations use `whileInView` with `viewport={{ once: true, margin: "-50px" }}`
- WhatsApp inquiry links: `https://wa.me/?text={encoded}` (no phone number hardcoded)
- ExitIntentPopup: localStorage `mdt_visits` for visit count, sessionStorage `mdt_exit_dismissed` for dismissal
