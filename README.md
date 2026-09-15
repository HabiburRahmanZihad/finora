# Finora

**Spend Smarter. Save More.**

A personal finance tracker and financial intelligence platform. Tracks income, expenses,
budgets and saving goals, and turns that data into rule-based (non-AI) insights, forecasts
and a financial health score — per the spec in
[`requirements/Finora — Complete Project Specification & Development Plan.md`](requirements/Finora%20—%20Complete%20Project%20Specification%20&%20Development%20Plan.md).

## Stack

- **apps/web** — Next.js 16 (App Router), TypeScript, Tailwind CSS v4, [Better Auth](https://www.better-auth.com)
  (email/password, JWT plugin), TanStack Query, React Hook Form + Zod, Recharts.
- **apps/api** — NestJS 11, TypeScript, REST, Prisma. Verifies requests via Better Auth's
  JWT/JWKS (it does not own login itself).
- **packages/database** — the shared Prisma schema (Postgres, hosted on [Neon](https://neon.tech)),
  used by both apps.
- **packages/types**, **packages/validation** — shared enums and Zod schemas, kept independent
  of `@finora/database` so the Prisma/Node runtime never ends up in a browser bundle.
- **packages/utils** — currency (৳ BDT, South Asian digit grouping) and date helpers.

## Getting started

### 1. Provision Postgres

Create a free [Neon](https://neon.tech) project and copy its connection string.

### 2. Environment files

Next.js and Prisma don't read a shared root `.env`, so the same `DATABASE_URL` needs to be
copied into three places. Each folder has its own `.env.example`:

```
packages/database/.env      # DATABASE_URL
apps/api/.env                # DATABASE_URL, PORT, WEB_APP_URL, BETTER_AUTH_URL
apps/web/.env.local           # DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL,
                               #   NEXT_PUBLIC_API_URL, GOOGLE_CLIENT_ID/SECRET (optional)
```

Generate a `BETTER_AUTH_SECRET` with `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`.

Google OAuth is optional — leave `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` blank to ship with
email/password only; the sign-up/reset-password flow logs the reset link to the API console
(no email provider is wired up yet — see `apps/web/src/lib/auth.ts`).

### 3. Install, migrate, seed

```bash
pnpm install
pnpm --filter @finora/database exec prisma migrate dev
pnpm --filter @finora/database run seed   # 13 default expense + 7 default income categories
```

### 4. Run

```bash
pnpm dev   # runs apps/web (:3000) and apps/api (:4000) together via Turborepo
```

Register an account at `http://localhost:3000/register`.

## Repo layout

```
apps/
  web/            Next.js app (also owns auth — Better Auth mounted at /api/auth/*)
  api/             NestJS REST API — one module per domain (accounts, transactions,
                    budgets, goals, reports, analytics, insights, forecast, health-score,
                    subscriptions, recurring-transactions, notifications, export, receipts,
                    gamification)
packages/
  database/        Prisma schema + generated client (@finora/database)
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

NestJS's CLI only transpiles `apps/api/src`; it can't consume a workspace package's raw `.ts`
source the way Next.js can (via `transpilePackages`). Each shared package has its own `pnpm
run build` (`tsc` → `dist/`, CommonJS). **After changing a shared package, rebuild it** (or the
API's dev server will still be running the old compiled output):

```bash
pnpm --filter @finora/validation run build   # or database / types / utils
```

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
