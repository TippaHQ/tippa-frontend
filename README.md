<p align="center">
  <img src="https://img.shields.io/badge/Stellar-black?style=for-the-badge&logo=stellar&logoColor=white" alt="Stellar" />
  <img src="https://img.shields.io/badge/Next.js_16-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/React_19-black?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Soroban-black?style=for-the-badge&logo=stellar&logoColor=white" alt="Soroban" />
  <img src="https://img.shields.io/badge/Supabase-black?style=for-the-badge&logo=supabase&logoColor=3ECF8E" alt="Supabase" />
</p>

<h1 align="center">Tippa</h1>

<p align="center">
  <strong>When the root gets paid, the foundation gets funded.</strong>
  <br />
  <sub>Non-custodial cascading payments on the Stellar network.</sub>
</p>

<br />

---

Tippa lets anyone receive payments and automatically split them across configured recipients — atomically, in a single Stellar transaction. No intermediaries, no custody, no trust required.

```
Bob sends 100 USDC to trytippa.com/d/alice
  -> Alice receives          64.50 USDC
  -> Recipient A receives    15.00 USDC
  -> Recipient B receives    10.00 USDC
  -> Recipient C receives    10.00 USDC
  -> Tippa fee                0.50 USDC

  All-or-nothing. One transaction. Settled in < 5 seconds.
```

## How it works

| Step | What happens |
|------|-------------|
| **Register** | Claim a username on-chain via Soroban smart contract |
| **Configure** | Set up to 5 cascade recipients with percentage-based splits |
| **Share** | Share your `trytippa.com/d/username` link with anyone |
| **Receive** | Senders connect any Stellar wallet — no Tippa account needed |
| **Cascade** | The contract splits the payment atomically across all recipients |

<br />

## Quick start

```bash
pnpm install                       # Install dependencies
cp .env.example .env.local         # Configure environment
psql $DATABASE_URL < scripts/007_full_migration.sql  # Run migrations
pnpm dev                           # http://localhost:3000
```

### Environment variables

| Variable | Required | Description |
|----------|:--------:|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key |
| `SOROBAN_RPC_URL` | — | Defaults to `https://soroban-testnet.stellar.org` |
| `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL` | — | Email redirect URL for local dev |

### Prerequisites

Node.js 20+ &bull; [pnpm](https://pnpm.io/) 10+ &bull; [Supabase](https://supabase.com) project &bull; [Freighter](https://freighter.app/) or any Stellar wallet

<br />

## Tech stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Auth & DB | Supabase (email/password + PostgreSQL + RLS) |
| Blockchain | Stellar / Soroban, `tippa-client` contract bindings |
| Wallet | Stellar Wallets Kit (Freighter, xBull, etc.) |
| UI | Tailwind CSS, shadcn/ui, Radix primitives |
| Charts | Recharts |

<br />

## Project structure

```
app/
  api/donate/        Public endpoints — build & submit donation txs
  api/register/      Authenticated — on-chain username registration
  auth/              Login and sign-up
  d/[username]/      Public payment page (no auth required)
  dashboard/         Protected — cascades, transactions, profile, settings

components/
  donate/            Payment form (connect wallet, sign, confirm)
  cascades/          Cascade recipient management
  dashboard/         Stats, charts, overview widgets
  ui/                shadcn/ui primitives

lib/
  actions.ts         Server actions — the main data layer
  constants/         Asset contract address mappings
  supabase/          Client setup (browser, server, middleware)

packages/
  tippa-client/      Auto-generated Soroban contract bindings

providers/
  wallet-provider    Stellar wallet context (connect, sign, disconnect)
```

<br />

## Routes

**Public** — no authentication required

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/d/[username]` | Payment page — anyone can send USDC or XLM |
| `/auth/login` | Sign in |
| `/auth/sign-up` | Create account |

**Protected** — requires authentication

| Route | Description |
|-------|-------------|
| `/dashboard` | Overview with stats and charts |
| `/dashboard/cascades` | Configure cascade recipients and splits |
| `/dashboard/transactions` | Payment history |
| `/dashboard/profile` | Display name, bio, socials |
| `/dashboard/settings` | Notifications and cascade rules |

<br />

## Architecture

- **Server actions** (`lib/actions.ts`) handle all data operations — auth check, Supabase query, revalidation
- **Middleware** refreshes sessions on every request, redirects unauthenticated users from `/dashboard/*`
- **Onboarding** flow — new users register a username on-chain before accessing the dashboard
- **Payment flow** is fully public — senders only need a Stellar wallet, no Tippa account
- **All signing happens client-side** — private keys never leave the user's wallet extension

<br />

## Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server with Turbopack |
| `pnpm build` | Production build |
| `pnpm start` | Serve production build |
| `pnpm lint` | Run ESLint |
| `pnpm format` | Run Prettier |

<br />

## License

Private
