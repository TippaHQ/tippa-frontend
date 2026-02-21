# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
pnpm dev          # Start dev server with Turbo (http://localhost:3000)
pnpm build        # Production build (note: TS errors are ignored via next.config.mjs)
pnpm start        # Start production server
pnpm lint         # Run ESLint
```

No test framework is configured yet.

## Environment Variables

Required (Supabase):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Optional:
- `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL` — email redirect URL for local dev

## Architecture

**Tippa** is a non-custodial cascading payment platform on the Stellar network. Users configure payment split rules so that incoming payments automatically distribute to configured dependencies.

### Tech Stack

- **Next.js 16** (App Router) with **React 19** and **TypeScript** (strict mode)
- **Supabase** for auth (email/password) and PostgreSQL database
- **Tailwind CSS 3.4** with **shadcn/ui** components (Radix primitives)
- **React Hook Form** + **Zod** for form validation
- **Recharts** for data visualization
- Path alias: `@/*` maps to project root

### Data Flow

All backend operations use **server actions** in `lib/actions.ts` with the `"use server"` directive. The pattern is: authenticate via `getCurrentUser()` → create Supabase client → query → `revalidatePath()` after mutations.

Client components use `"use client"` only when interactivity is required; prefer server components by default.

### Auth & Middleware

`middleware.ts` runs on every request to refresh Supabase sessions and redirect unauthenticated users from `/dashboard/*` to `/auth/login`. Supabase SSR cookies are managed via `lib/supabase/middleware.ts`, `lib/supabase/client.ts` (browser), and `lib/supabase/server.ts` (server).

### Routing

**Public routes:** `/` (redirects to `/connect`), `/connect` (landing), `/auth/login`, `/auth/sign-up`

**Protected routes (require auth):** `/dashboard`, `/dashboard/cascades`, `/dashboard/transactions`, `/dashboard/profile`, `/dashboard/settings`, `/dashboard/help`

### Key Files

| File | Purpose |
|------|---------|
| `lib/actions.ts` | All server actions — the main data layer |
| `lib/types.ts` | TypeScript interfaces for all entities |
| `lib/supabase/` | Supabase client setup (browser, server, middleware) |
| `middleware.ts` | Auth route protection and session refresh |
| `components/ui/` | shadcn/ui component library (50+ components) |
| `components/app-sidebar.tsx` | Main navigation sidebar |
| `components/top-bar.tsx` | Header with search and network status |
| `scripts/007_full_migration.sql` | Full idempotent database migration |

### Database Tables

Core tables in Supabase PostgreSQL: `profiles`, `cascade_dependencies` (payment split targets, up to 5 per user), `cascade_rules` (execution settings like atomic mode), `transactions` (received/forwarded payments), `monthly_flow_stats`, `notification_preferences`, `profile_analytics`.

### Styling

Dark-first theme with teal primary (`hsl(168 80% 50%)`). Uses `cn()` utility from `lib/utils.ts` (clsx + tailwind-merge) for conditional class composition. Fonts: Geist Sans and Geist Mono.
