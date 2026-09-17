# Finora

**Spend Smarter. Save More.**

A personal finance tracker and financial intelligence platform. Tracks income, expenses,
budgets and saving goals, and turns that data into rule-based (non-AI) insights, forecasts
and a financial health score — per the spec in
[`requirements/Finora — Complete Project Specification & Development Plan.md`](requirements/Finora%20—%20Complete%20Project%20Specification%20&%20Development%20Plan.md).

This README is written so a new developer can go from a fresh clone to a fully running app,
end to end, without asking anyone anything. Follow it top to bottom the first time; use the
table of contents to jump back in later.

## Table of contents

1. [Tech stack](#tech-stack)
2. [Prerequisites](#prerequisites)
3. [Quick start](#quick-start-tldr)
4. [Step-by-step setup](#step-by-step-setup)
5. [Seeded accounts](#seeded-accounts)
6. [Project structure](#project-structure)
7. [Available scripts](#available-scripts)
8. [Why some things are built this way](#why-some-things-are-built-this-way)
9. [The admin dashboard](#the-admin-dashboard)
10. [Deployment](#deployment)
11. [What's implemented](#whats-implemented)
12. [Troubleshooting](#troubleshooting)

## Tech stack

- **apps/client** — Next.js 16 (App Router), TypeScript, Tailwind CSS v4, [Better Auth](https://www.better-auth.com)
  (email/password + Google OAuth, JWT plugin, admin plugin), TanStack Query, React Hook Form + Zod, Recharts.
- **apps/server** — NestJS 11, TypeScript, REST, Prisma. Verifies requests via Better Auth's
  JWT/JWKS (it does not own login itself); exposes an admin-only module for site
  health/traffic stats.
- **apps/mobile** — Expo (React Native + Expo Router), TypeScript. Foundation phase: auth
  (email/password + Google, via `@better-auth/expo`) and a dashboard summary screen, sharing
  the same backend as the web app. See [`apps/mobile`](apps/mobile) — more screens are being
  added incrementally.
- **packages/database** — the shared Prisma schema (Postgres, hosted on [Neon](https://neon.tech)),
  used by both `apps/client` and `apps/server`.
- **packages/types**, **packages/validation** — shared enums and Zod schemas, kept independent
  of `@finora/database` so the Prisma/Node runtime never ends up in a browser (or Expo) bundle.
- **packages/utils** — currency (৳ BDT, South Asian digit grouping) and date helpers, shared by
  all three apps.

## Prerequisites

Install these before touching the repo:

- **Node.js ≥ 20** (developed and tested on 22.x — `node -v` to check).
- **pnpm 10.x**, via [Corepack](https://pnpm.io/installation#using-corepack) (bundled with Node):
  ```bash
  corepack enable
  corepack prepare pnpm@10.34.5 --activate
  ```
- **Git**.
- A free **[Neon](https://neon.tech)** account (hosted Postgres — no local Postgres install needed).
- *(Optional, for Google sign-in)* a **[Google Cloud Console](https://console.cloud.google.com)**
  project with an OAuth client — see [step 8](#8-optional-enable-google-sign-in) below.
- *(Optional, for the mobile app)* the **[Expo Go](https://expo.dev/go)** app on your phone, or
  an Android/iOS emulator set up via Android Studio / Xcode.

No local Postgres, no Docker, no global CLI installs beyond pnpm — everything else is a
workspace dependency.

## Quick start (tl;dr)

For someone who's done this before and just wants the commands:

```bash
git clone <this-repo-url> finora && cd finora
corepack enable && corepack prepare pnpm@10.34.5 --activate
pnpm install

# create packages/database/.env, apps/server/.env, apps/client/.env.local
# (see "Environment files" below for exact contents)

pnpm --filter @finora/database exec prisma migrate dev
pnpm --filter @finora/database run seed
pnpm dev
```

Then open `http://localhost:3000` and log in as `admin@finora.com` / `Pa$$w0rd` (seeded), or
register your own account. If any of that is unclear, read the full walkthrough below.

## Step-by-step setup

### 1. Clone and install tooling

```bash
git clone <this-repo-url> finora
cd finora
corepack enable
corepack prepare pnpm@10.34.5 --activate
```

This repo pins `packageManager: pnpm@10.34.5` in `package.json` — Corepack reads that and makes
sure everyone on the team uses the exact same pnpm version, so `pnpm install` produces the same
lockfile result for everyone.

### 2. Provision Postgres

Create a free [Neon](https://neon.tech) project and copy its connection string (Neon shows it
on the project dashboard, looks like `postgresql://user:password@host/db?sslmode=require`).
This is the **only** external service you need an account for to run the app locally.

### 3. Environment files

Next.js, Prisma, and Expo each read their **own** env file — there's no shared root `.env`
that all three consume automatically. Copy each `.env.example` below and fill in real values:

```bash
cp packages/database/.env.example packages/database/.env
cp apps/server/.env.example apps/server/.env
cp apps/client/.env.example apps/client/.env.local
cp apps/mobile/.env.example apps/mobile/.env      # only needed if you're running the mobile app
```

| File | Variables | Notes |
|---|---|---|
| `packages/database/.env` | `DATABASE_URL` | Same Neon connection string everywhere. |
| `apps/server/.env` | `DATABASE_URL`, `PORT`, `WEB_APP_URL`, `BETTER_AUTH_URL` | `PORT` defaults to `4000` locally. |
| `apps/client/.env.local` | `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `NEXT_PUBLIC_API_URL`, `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` | The last two are optional — see step 8. |
| `apps/mobile/.env` | `EXPO_PUBLIC_AUTH_URL`, `EXPO_PUBLIC_API_URL` | Only needed to run the mobile app (step 9). |

Generate a `BETTER_AUTH_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Paste the result into `apps/client/.env.local`. Leave `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`
blank for now — the app runs fully on email/password without them, and step 8 covers turning
Google sign-in on later.

### 4. Install dependencies

```bash
pnpm install
```

This installs every workspace package (`apps/*`, `packages/*`) in one pass. If you only just
added `apps/mobile` to your checkout, this is also the step that would pull in its Expo/React
Native dependencies.

### 5. Run the database migration and seed

```bash
pnpm --filter @finora/database exec prisma migrate dev
pnpm --filter @finora/database run seed
```

The first command creates every table (`User`, `Session`, `Transaction`, `Budget`, ... — the
full schema in `packages/database/prisma/schema.prisma`) in your Neon database. The second
seeds:

- 13 default expense categories + 7 default income categories (available to every user).
- One admin account — see [Seeded accounts](#seeded-accounts) below.

Both commands are safe to re-run; the seed script upserts by a fixed ID, so running it twice
never duplicates data.

### 6. Run the app

```bash
pnpm dev
```

This runs `apps/client` (`http://localhost:3000`) and `apps/server` (`http://localhost:4000`)
together via Turborepo, with hot reload on both. The **first** page load after starting can
take several seconds — Next.js/Turbopack and Nest both compile routes lazily on first request,
not up front — this is expected, not a hang.

### 7. Verify it's working

Open `http://localhost:3000`. You should land on `/login`. Either:

- Log in with the seeded admin (`admin@finora.com` / `Pa$$w0rd`) — you'll see an extra
  **Admin** item in the sidebar (see [The admin dashboard](#the-admin-dashboard)), or
- Click **Create one** and register your own account with any email/password.

Once logged in you should see the Dashboard with empty-state cards ("No transactions yet",
etc.) — that's correct for a brand-new database. Add a transaction to confirm the full
client → API → Postgres round trip works.

### 8. (Optional) Enable Google sign-in

Skip this if email/password is enough for what you're doing.

1. In [Google Cloud Console](https://console.cloud.google.com), create an OAuth 2.0 Client ID
   (type: Web application).
2. **Authorized JavaScript origins**: `http://localhost:3000`.
3. **Authorized redirect URIs**: `http://localhost:3000/api/auth/callback/google` — note the
   port. Better Auth's routes live in `apps/client` (port 3000), **not** `apps/server` (4000);
   pointing this at 4000 is the most common setup mistake here.
4. Copy the generated Client ID and Client Secret into `apps/client/.env.local`'s
   `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`.
5. Restart `pnpm dev`. A "Continue with Google" button now appears on `/login` and `/register`.

The mobile app reuses this same Google client — no separate Google Cloud setup needed for it,
since the OAuth flow still round-trips through `apps/client`'s web callback URL even when
launched from the phone.

### 9. (Optional) Run the mobile app

The mobile app is in its foundation phase (login/register + a dashboard summary screen) — see
[apps/mobile](apps/mobile) for what's there and the [Tech stack](#tech-stack) section above for
what's still to come.

```bash
cd apps/mobile
pnpm start
```

This opens Expo's dev tools. Scan the QR code with the **Expo Go** app on your phone (same
Wi-Fi network as your computer), or press `a`/`i` to launch an Android/iOS emulator.

**Before it can reach your API**, edit `apps/mobile/.env`: `localhost` only resolves to "this
computer," which a phone isn't. Replace it with your computer's LAN IP (find it with
`ipconfig` on Windows / `ifconfig` or `ip addr` on macOS/Linux — something like
`192.168.1.20`):

```
EXPO_PUBLIC_AUTH_URL="http://192.168.1.20:3000"
EXPO_PUBLIC_API_URL="http://192.168.1.20:4000"
```

The Android emulator specifically can instead use `http://10.0.2.2:3000` /
`http://10.0.2.2:4000`, which it maps back to your computer's actual localhost.

## Seeded accounts

Running `pnpm --filter @finora/database run seed` creates one account:

| Email | Password | Role |
|---|---|---|
| `admin@finora.com` | `Pa$$w0rd` | `admin` |

Use it to see the [admin dashboard](#the-admin-dashboard) without having to manually promote a
user. **Change or remove this account before a real production deploy** — it's meant for local
development and demos, not shipped as-is with a real user base. To promote any other account to
admin instead, either use the admin dashboard's own role toggle (once logged in as this seeded
admin), or set it directly: `UPDATE "user" SET role = 'admin' WHERE email = '...'`.

## Project structure

```
apps/
  client/            Next.js app — also owns auth (Better Auth mounted at /api/auth/*)
  server/            NestJS REST API — one module per domain (accounts, transactions,
                     budgets, goals, reports, analytics, insights, forecast, health-score,
                     subscriptions, recurring-transactions, notifications, export, receipts,
                     gamification, admin)
  mobile/            Expo app (React Native + Expo Router) — foundation phase
packages/
  database/          Prisma schema + generated client (@finora/database)
  types/             Shared enums, mirrored from schema.prisma (not re-exported from
                     @finora/database — see below)
  validation/        Zod schemas shared by web/mobile forms and Nest DTOs
  utils/             Currency/date/math helpers, shared by all three apps
  config/            Shared tsconfig base
requirements/        The original spec this app is built from
render.yaml           Render Blueprint for apps/server (see Deployment)
apps/client/vercel.json  Vercel build config for apps/client (see Deployment)
```

## Available scripts

Run from the repo root unless noted. Most are Turborepo wrappers that build workspace
dependencies in the right order automatically.

| Command | What it does |
|---|---|
| `pnpm dev` | Runs `apps/client` + `apps/server` together, hot-reloading. |
| `pnpm build` | Production build of every app/package, in dependency order. |
| `pnpm lint` | ESLint across every workspace package. |
| `pnpm typecheck` | `tsc --noEmit` across every workspace package. |
| `pnpm db:generate` | Regenerate the Prisma client after editing `schema.prisma`. |
| `pnpm db:migrate` | `prisma migrate dev` — create + apply a new migration locally. |
| `pnpm db:seed` | Re-run the seed script (idempotent). |
| `pnpm db:studio` | Open Prisma Studio (a GUI for browsing/editing your Neon data). |
| `pnpm exec turbo run build --filter=@finora/client` | Build just the web app (+ its dependencies). |
| `pnpm exec turbo run build --filter=@finora/server` | Build just the API (+ its dependencies). |
| `pnpm --filter @finora/mobile run start` | Start the Expo dev server (see step 9). |

**Iterating on a shared package** (`packages/types`, `packages/validation`, `packages/utils`,
`packages/database`) while `pnpm dev` is running: the dev servers don't watch those packages
for you. Rebuild the one you changed by hand — e.g. `pnpm --filter @finora/validation run build`
— then the running `apps/client`/`apps/server` pick up the change.

## Why some things are built this way

A few decisions here aren't obvious from reading the code alone:

**`packages/types` doesn't just re-export Prisma's enums.** `@finora/database`'s entry point
instantiates `PrismaClient`, which needs Node's `fs` and native bindings. If
`@finora/types`/`@finora/validation` (used inside "use client" forms, and inside the mobile
app) re-exported enums from `@finora/database`, bundlers would pull the whole Prisma runtime
into the browser/Expo bundle. `packages/types/src/enums.ts` hand-mirrors the Prisma schema's
enums as plain `as const` objects instead — keep them in sync by hand when `schema.prisma`
changes.

**Shared packages are pre-built, not consumed as raw TypeScript.** NestJS's CLI only
transpiles `apps/server/src`; it can't consume a workspace package's raw `.ts` source the way
Next.js can (via `transpilePackages`). Each shared package has its own build (`tsc` → `dist/`,
CommonJS), and `packages/database`'s build also runs `prisma generate` first. Turborepo handles
the ordering for you — see [Available scripts](#available-scripts).

**Better Auth (not NestJS) owns login, and lives in `apps/client`.** NestJS only *verifies*
bearer JWTs against Better Auth's JWKS endpoint (`apps/server/src/auth/jwt-verifier.service.ts`)
— it never issues them. This is why `apps/server` has no `/api/auth/*` routes of its own, and
why enabling Google sign-in (step 8) only ever touches `apps/client`.

**The mobile app reuses the exact same Better Auth backend**, via `@better-auth/expo` (a
SecureStore-backed session + deep-link OAuth handling on top of the same email/password +
Google config apps/client already runs). There is no separate mobile auth system, and
`packages/database` is deliberately never a mobile dependency — the mobile app only ever talks
HTTP to `apps/server`'s REST API and `apps/client`'s `/api/auth/*` routes, same as the web app.

## The admin dashboard

Logging in as a user with `role: "admin"` (the seeded account, or one you promote — see
[Seeded accounts](#seeded-accounts)) adds an **Admin** item to the sidebar, at `/admin`:

- **Overview** (`/admin`) — DB health/latency/uptime, aggregate usage stats (users,
  transactions, budgets, ...), and a real API-traffic chart (requests/day, top routes, status
  codes), backed by request logging middleware in `apps/server`.
- **Users** (`/admin/users`) — search/list every user.
- **User detail** (`/admin/users/:id`) — view profile fields, **reset that user's password**,
  and **change their role** between `user`/`admin`.

User list/detail/password-reset/role-change all go through Better Auth's own `admin` plugin
APIs directly from the browser (`authClient.admin.*`) rather than through `apps/server` — see
the `RolesGuard`/`@Roles("admin")` pattern in `apps/server/src/auth/` for how the *site
health/traffic* endpoints are protected instead.

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
8. **If you enabled Google sign-in locally**, add the production callback URL
   (`https://<your-vercel-domain>/api/auth/callback/google`) as an *additional* Authorized
   redirect URI in Google Cloud Console — it doesn't replace the localhost one, both coexist.

**If Vercel's function size limit complains**: Prisma's generated client triggers a Next.js
build warning about "dynamic filesystem access" tracing the whole project into the server
function bundle. It's usually harmless (well under Vercel's 50MB limit for a project this
size), but if you hit the limit, look at `outputFileTracingExcludes` in `apps/client/next.config.ts`
or switch Prisma to a driver adapter — not needed for the app as it stands today.

### 4. Mobile app (apps/mobile)

The foundation is built (see [Tech stack](#tech-stack)), but it isn't deployed anywhere yet —
today it only runs via `pnpm --filter @finora/mobile run start` + Expo Go/an emulator (step 9
above). When it's ready to ship: [Expo Application Services (EAS)](https://expo.dev/eas) has a
free tier for builds and OTA updates (the closest mobile equivalent to what Vercel gives the
web app) — `apps/mobile/app.json` already has `android.package`/`ios.bundleIdentifier` set
(`com.finora.app`) as a starting point for that.

## What's implemented

Every phase in the spec's §42 development plan, plus work that came after it:

1. **Foundation** — auth (register/login/logout/forgot+reset password, Google OAuth, admin
   role/dashboard), JWT bridge to Nest, protected layout, sidebar nav.
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
   validation on every endpoint, per-user data isolation enforced in every service, mobile
   responsiveness pass across the whole web app.
10. **Admin & mobile (post-spec additions)** — Google sign-in, an admin role with a dashboard
    (user management, password reset, site health/traffic monitoring), and the first phase of
    a React Native/Expo mobile app (auth + dashboard summary).

**Still ahead**: the rest of the mobile app's screens (transactions, budgets, goals, accounts,
subscriptions, recurring, reports, analytics, insights, notifications, settings — tracked
incrementally), an Android EAS build, AI-based intelligence (v1 is deliberately SQL/statistics/
rules only, per spec §44), and a real transactional email provider (password reset currently
just logs the link to the API console — see `apps/client/src/lib/auth.ts`).

## Troubleshooting

- **First page load after `pnpm dev` looks stuck on "Loading…".** Expected — Next.js/Turbopack
  and Nest both compile routes lazily on first request, not up front. Give it 10–15 seconds
  (longer right after a fresh install or a big dependency change) before assuming something's
  broken; subsequent loads are fast.
- **`EADDRINUSE` / port 3000 or 4000 already in use.** Something else (an old `pnpm dev`, an
  orphaned `node` process) is still bound to that port. On Windows:
  `Get-NetTCPConnection -LocalPort 3000,4000 -State Listen` to find the PID, then
  `Stop-Process -Id <pid>`.
- **`prisma migrate`/`generate` fails with a file-lock error on Windows.** Stop any running dev
  server first (it may be holding a lock on generated files), then retry.
- **Can't log in with `admin@finora.com`.** Make sure you actually ran
  `pnpm --filter @finora/database run seed` after migrating — it's a separate step, not part of
  `migrate dev`.
- **Google sign-in redirects to an error page.** Almost always the redirect URI mismatch
  described in [step 8](#8-optional-enable-google-sign-in) — check it's pointed at port `3000`,
  not `4000`.
- **Mobile app can't reach the API ("Network request failed").** `localhost` in
  `apps/mobile/.env` only works if you're running in a web browser preview — a physical phone
  or the Android emulator needs your computer's real LAN IP (or `10.0.2.2` for the Android
  emulator specifically). See [step 9](#9-optional-run-the-mobile-app).
- **`expo-doctor` warns about duplicate `react`/`react-native`/`expo` installs.** This is a
  known pnpm + Expo monorepo interaction (Next.js and Expo pin different, both-correct React
  versions) — already worked around via `.npmrc`'s `node-linker=hoisted` and
  `apps/mobile/metro.config.js`'s explicit `nodeModulesPaths`/`disableHierarchicalLookup`.
  Don't "fix" this by trying to unify the React version across apps; verify instead that
  `pnpm --filter @finora/mobile exec expo export --platform android` actually bundles cleanly
  (that's the check that matters — it exercises Metro's real module resolution).
