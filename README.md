# Finora

**Spend Smarter. Save More.**

A personal finance tracker and financial intelligence platform. Tracks income, expenses,
budgets and saving goals, and turns that data into rule-based (non-AI) insights, forecasts
and a financial health score — per the spec in
[`requirements/Finora — Complete Project Specification & Development Plan.md`](requirements/Finora%20—%20Complete%20Project%20Specification%20&%20Development%20Plan.md).

## Stack

- **apps/client** — Next.js 16 (App Router), TypeScript, Tailwind CSS v4, [Better Auth](https://www.better-auth.com)
  (email/password, JWT plugin), TanStack Query, React Hook Form + Zod, Recharts.
- **apps/server** — NestJS 11, TypeScript, REST, Prisma. Verifies requests via Better Auth's
  JWT/JWKS (it does not own login itself).
- **packages/database** — the shared Prisma schema (Postgres, hosted on [Neon](https://neon.tech)),
  used by both apps.
- **packages/types**, **packages/validation** — shared enums and Zod schemas, kept independent
  of `@finora/database` so the Prisma/Node runtime never ends up in a browser bundle.
- **packages/utils** — currency (৳ BDT, South Asian digit grouping) and date helpers.

## Local development

### 1. Provision Postgres

Create a free [Neon](https://neon.tech) project and copy its connection string.

### 2. Environment files

Next.js and Prisma don't read a shared root `.env`, so the same `DATABASE_URL` needs to be
copied into three places. Each folder has its own `.env.example`:

```
packages/database/.env      # DATABASE_URL
apps/server/.env             # DATABASE_URL, PORT, WEB_APP_URL, BETTER_AUTH_URL
apps/client/.env.local        # DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL,
                               #   NEXT_PUBLIC_API_URL, GOOGLE_CLIENT_ID/SECRET (optional)
```

Generate a `BETTER_AUTH_SECRET` with `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`.

Google OAuth is optional — leave `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` blank to ship with
email/password only; the sign-up/reset-password flow logs the reset link to the API console
(no email provider is wired up yet — see `apps/client/src/lib/auth.ts`).

### 3. Install, migrate, seed

```bash
pnpm install
pnpm --filter @finora/database exec prisma migrate dev
pnpm --filter @finora/database run seed   # 13 default expense + 7 default income categories
```

### 4. Run

```bash
pnpm dev   # runs apps/client (:3000) and apps/server (:4000) together via Turborepo
```

Register an account at `http://localhost:3000/register`.

## Repo layout

```
apps/
  client/          Next.js app (also owns auth — Better Auth mounted at /api/auth/*)
  server/           NestJS REST API — one module per domain (accounts, transactions,
                    budgets, goals, reports, analytics, insights, forecast, health-score,
                    subscriptions, recurring-transactions, notifications, export, receipts,
                    gamification)
packages/
  database/         Prisma schema + generated client (@finora/database)
  types/            Shared enums, mirrored from schema.prisma (not re-exported from
                     @finora/database — see note below)
  validation/       Zod schemas shared by web forms and Nest DTOs
  utils/            Currency/date/math helpers
  config/           Shared tsconfig base
requirements/       The original spec this app is built from
```

### Why `packages/types` doesn't just re-export Prisma's enums

`@finora/database`'s entry point instantiates `PrismaClient`, which needs Node's `fs` and
native bindings. If `@finora/types`/`@finora/validation` (used inside "use client" forms)
re-exported enums from `@finora/database`, bundlers would pull the whole Prisma runtime into
the browser bundle. `packages/types/src/enums.ts` hand-mirrors the Prisma schema's enums as
plain `as const` objects instead — keep them in sync by hand when `schema.prisma` changes.

### Shared packages are pre-built, not consumed as raw TypeScript

NestJS's CLI only transpiles `apps/server/src`; it can't consume a workspace package's raw
`.ts` source the way Next.js can (via `transpilePackages`). Each shared package has its own
build (`tsc` → `dist/`, CommonJS), and `packages/database`'s build also runs `prisma generate`
first. **Turborepo handles the ordering for you** — `pnpm exec turbo run build --filter=@finora/server`
(or `--filter=@finora/client`) builds every workspace dependency first, in the right order.
If you're iterating on a shared package under `pnpm dev`, rebuild it by hand after changes
(`pnpm --filter @finora/validation run build`, etc.) — the dev servers don't watch it for you.

## Deployment

Three pieces, deployed separately: **apps/client** → Vercel, **apps/server** → Render,
**Postgres** → Neon (already set up from local dev — reuse the same project, or create a
separate one for production). See `.env.production.example` (root) for the full variable
reference; `apps/client/.env.production.example` and `apps/server/.env.production.example`
have the per-app subset.

The one rule that matters most: `BETTER_AUTH_URL` (both apps) and `NEXT_PUBLIC_API_URL` must
point at your **real deployed URLs**, not localhost — Better Auth signs JWTs with
`BETTER_AUTH_URL` as both issuer and audience, and the API checks incoming tokens against that
exact value via JWKS.

### 1. Database (Neon)

Nothing to deploy — Neon is already a hosted service. Either reuse your dev project's
connection string, or create a new Neon project for production and run the migration against
it once before first deploy:

```bash
DATABASE_URL="<your-prod-connection-string>" pnpm --filter @finora/database exec prisma migrate deploy
DATABASE_URL="<your-prod-connection-string>" pnpm --filter @finora/database run seed
```

### 2. API (apps/server → Render)

Render's free tier works for this (spins down when idle; first request after idle takes ~30–60s
to wake — fine for a personal project, worth knowing before you wonder why the first login is slow).

**Fastest path**: a `render.yaml` Blueprint at the repo root already encodes steps 2–5 below (root
directory, build/start commands, health check path). Render → **New +** → **Blueprint** → connect
this repo → it reads `render.yaml` automatically and only prompts you for the three env vars in
step 6. The manual steps are spelled out below in case you'd rather set the service up by hand.

1. **New → Web Service**, connect this repo.
2. **Root Directory**: leave blank (repo root) — the build/start commands below are written to
   run from there, which sidesteps any ambiguity about how Render resolves the pnpm workspace
   from a subdirectory.
3. **Runtime**: Node.
4. **Build Command**:
   ```
   pnpm install && pnpm exec turbo run build --filter=@finora/server
   ```
5. **Start Command**:
   ```
   pnpm --filter @finora/server run start
   ```
6. **Environment variables** (Render dashboard → Environment): `DATABASE_URL`, `WEB_APP_URL`,
   `BETTER_AUTH_URL` — see `apps/server/.env.production.example`. Don't set `PORT`; Render
   injects it.
7. Deploy, then copy the resulting `https://your-api.onrender.com` URL — you'll need it for
   the client's `NEXT_PUBLIC_API_URL`.

### 3. Web app (apps/client → Vercel)

`apps/client/vercel.json` already encodes the framework preset, build command, and output
directory (steps 3–5 below) — Vercel reads it automatically once Root Directory is set. **Root
Directory is the one setting `vercel.json` can't express** (it's not part of its schema), so step 2
below is still a manual, one-time click regardless of the file.

1. **Add New → Project**, import this repo.
2. **Root Directory**: `apps/client` (Vercel needs this to detect it's a Next.js app and set
   the right output conventions; it still installs from the monorepo root automatically once
   it detects `pnpm-workspace.yaml`).
3. **Framework Preset**: Next.js (auto-detected).
4. **Build Command** (override the default, so it goes through Turborepo's dependency graph
   instead of just running `next build` in isolation):
   ```
   cd ../.. && pnpm exec turbo run build --filter=@finora/client
   ```
5. **Output Directory**: leave default (`.next`).
6. **Environment variables** (Project → Settings → Environment Variables, Production scope):
   `DATABASE_URL`, `BETTER_AUTH_SECRET` (generate a fresh one, don't reuse the dev value),
   `BETTER_AUTH_URL` (your Vercel URL — you may need to deploy once first to learn it, then
   redeploy after setting this), `NEXT_PUBLIC_API_URL` (the Render URL from step 2), and
   optionally `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`. See `apps/client/.env.production.example`.
7. Deploy. Once you have the final Vercel URL, make sure `BETTER_AUTH_URL` (client) and
   `WEB_APP_URL`/`BETTER_AUTH_URL` (server, on Render) all match it exactly, then redeploy
   both if you had to change anything.

**If Vercel's function size limit complains**: Prisma's generated client triggers a Next.js
build warning about "dynamic filesystem access" tracing the whole project into the server
function bundle. It's usually harmless (well under Vercel's 50MB limit for a project this
size), but if you hit the limit, look at `outputFileTracingExcludes` in `apps/client/next.config.ts`
or switch Prisma to a driver adapter — not needed for the app as it stands today.

### 4. Mobile app (future)

The spec calls for a React Native + Expo app later, sharing this same API — not built yet.
When it is: [Expo Application Services (EAS)](https://expo.dev/eas) has a free tier for builds
and OTA updates (the closest mobile equivalent to what Vercel gives the web app), and Expo Go
lets you run the dev build on a physical phone with zero deployment at all while iterating.

## What's implemented

Every phase in the spec's §42 development plan:

1. **Foundation** — auth (register/login/logout/forgot+reset password), JWT bridge to Nest,
   protected layout, sidebar nav.
2. **Financial Core** — accounts (with computed live balances), categories, unified
   income/expense/transfer transactions, tags.
3. **Dashboard** — summary cards, time filter, expense-by-category donut, income/expense/
   savings trend chart, recent transactions, quick add.
4. **Budgets & Goals** — category budgets (80%/100% thresholds), saving goals with
   required-monthly-saving / estimated-completion-date / current-saving-rate.
5. **Reports** — daily / monthly / yearly.
6. **Intelligence** — analytics (spending/savings/categories), a rule-based insight engine,
   expense forecast, what-if simulator, financial health score (0–100, weighted formula).
7. **Recurring & Subscriptions** — recurring transactions (auto-generate due transactions on
   fetch), subscriptions with monthly/yearly cost rollups, notifications (budget/subscription/
   recurring/goal/monthly-report reminders, respecting the user's notification settings).
8. **Export & Polish** — CSV/Excel/PDF export (transactions + monthly report), receipt
   upload/view/delete, search/filter/sort, gamification (saving streaks, no-spend streaks,
   achievements).
9. **Production hardening** — helmet, rate limiting, CORS locked to the web origin, Zod
   validation on every endpoint, per-user data isolation enforced in every service.

**Not built** (explicitly future, per the spec): the React Native mobile app, AI-based
intelligence (v1 is SQL/statistics/rules only, per spec §44), and a real transactional email
provider (password reset currently just logs the link).
