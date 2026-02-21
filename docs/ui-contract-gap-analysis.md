# UI vs Contract Gap Analysis

Audit of existing frontend pages/components against the Tippa smart contract functions.

---

## Contract Function Coverage

| Contract Function | Has UI? | On-chain call? | Status |
|---|---|---|---|
| `register(caller, username)` | Partial — username collected at sign-up | No | Needs contract integration |
| `set_rules(caller, username, rules)` | Yes — cascade editor page | No | Needs contract integration |
| `donate(caller, username, asset, amount, donor_override)` | No | No | **Missing entirely** |
| `distribute(username, asset, min_distribution)` | N/A | N/A | Backend-only (Tippa calls this automatically after donations) |
| `claim(caller, username, asset, to)` | No | No | **Missing entirely** |
| `distribute_and_claim(caller, username, asset, to, min_distribution)` | N/A | N/A | Backend-only (Tippa calls this automatically after donations) |
| `transfer_ownership(caller, username, new_owner)` | No | No | **Missing entirely** |

---

## What Already Exists

### Pages that partially support contract functions

**Sign-up page** (`app/auth/sign-up/page.tsx`)
- Collects username, display name, email, password.
- Stores everything in Supabase only — never calls `register()` on-chain.

**Cascades page** (`app/dashboard/cascades/page.tsx`)
- `CascadeEditor` — add/remove/edit up to 5 dependencies (label, Stellar address, split %).
- `CascadeSimulator` — preview distribution given an amount.
- `CascadeRules` — toggle atomic execution, min hop threshold, auto-cascade.
- All changes saved to Supabase only — never calls `set_rules()` on-chain.

**Dashboard page** (`app/dashboard/page.tsx`)
- `StatCards` — total received, total forwarded, impact multiplier, active cascades.
- `FlowChart` — monthly received vs forwarded (Recharts).
- `CascadePreview` — visual breakdown of current cascade.
- `RecentTransactions` — last 5 transactions.
- Read-only. No action to claim unclaimed balance.

**Transactions page** (`app/dashboard/transactions/page.tsx`)
- Table with type/from/to/amount/status/time columns.
- Filter by type (received/forwarded), time period (7d/30d/90d).
- Search by name, address, or TX hash.
- Link to Stellar Expert for each transaction.
- CSV export button exists but is not implemented.

**Profile page** (`app/dashboard/profile/page.tsx`)
- Edit display name, username, bio, social links.
- Shows `tippa.io/username` discovery link with copy button.
- Profile analytics (views, supporters, payments received).
- Public dependency list.

**Settings page** (`app/dashboard/settings/page.tsx`)
- Shows connected wallet address, disconnect button.
- Notification toggles, network selection (mainnet/testnet).
- Delete account button (non-functional stub).

**Wallet provider** (`providers/wallet-provider.tsx`)
- Connect/disconnect via StellarWalletsKit.
- Persists wallet address and name in localStorage.
- Does NOT sign transactions or invoke contracts.

### Pages with no contract relevance (no gaps)

- Landing page (`app/connect/page.tsx`) — marketing/informational.
- Login page (`app/auth/login/page.tsx`) — off-chain auth.
- Help page (`app/dashboard/help/page.tsx`) — FAQ and resources.

---

## What's Missing

### 1. Public Donate Page — `donate()`

**The problem:** There is no page where a donor can send tokens to a user. The entire donation flow is absent.

**Proposal:** Create a public page at `app/[username]/page.tsx` (or `app/donate/[username]/page.tsx`).

This page should:
- Be accessible without authentication (public route).
- Fetch the recipient's public profile (display name, avatar, bio, dependencies).
- Show a donation form: amount input, asset selector (USDC, XLM), optional donor display name override.
- Require the donor to connect their wallet (reuse `WalletProvider`).
- Build and sign the `donate()` contract transaction.
- Show a confirmation screen with transaction hash and Stellar Explorer link.

**Components needed:**
- `components/donate/donate-form.tsx` — amount, asset selector, donor override field, submit button.
- `components/donate/recipient-profile.tsx` — read-only display of the recipient's public info and cascade breakdown.
- `components/donate/donation-success.tsx` — confirmation with TX hash, explorer link, and "donate again" option.

**Data flow:**
1. Load recipient profile from Supabase by username.
2. Donor connects wallet.
3. Donor fills amount + asset.
4. Frontend builds `donate(caller, username, asset, amount, donor_override)` transaction.
5. Wallet signs.
6. Submit to Stellar network.
7. Show success/failure.

---

### 2. On-chain Registration — `register()`

**The problem:** Username is stored in Supabase at sign-up but never registered on-chain.

**Proposal:** Add a registration step to the post-signup or dashboard onboarding flow.

Option A — **Post-signup prompt:** After email verification and first login, show a modal/banner on the dashboard: "Register your username on Stellar to start receiving donations." User connects wallet, signs, and the frontend calls `register(caller, username)`.

Option B — **Settings page integration:** Add a "Register on-chain" button in the wallet section of `app/dashboard/settings/page.tsx`. Show registration status (registered / not registered).

**Recommended: Option A** — Catch users early in their journey with a guided flow.

**Components needed:**
- `components/onboarding/register-username-modal.tsx` — explains what on-chain registration means, shows the username, connect wallet button, sign & submit button, success state.

**Data flow:**
1. User logs in for the first time (or wallet connects and username is not registered on-chain).
2. Modal appears prompting registration.
3. User connects wallet if not already connected.
4. Frontend builds `register(caller, username)` transaction.
5. Wallet signs.
6. Submit to Stellar.
7. Mark profile as on-chain registered in Supabase.

---

### 3. On-chain Rule Sync — `set_rules()`

**The problem:** The cascade editor saves rules to Supabase but never pushes them on-chain.

**Proposal:** Extend the existing cascade editor save flow. When the user clicks "Save Configuration" in `components/cascades/cascade-editor.tsx`, after the Supabase write, prompt the user to sign a transaction that calls `set_rules()`.

**Changes needed:**
- Add a "Publish to Stellar" step after saving to Supabase.
- Show a signing dialog explaining the transaction.
- Map the dependency list to the contract format: `{ recipient_username: bps }` (note: the UI currently uses Stellar addresses, but the contract uses usernames — this needs reconciliation).
- Show on-chain sync status on the cascade page (synced / out of sync).

**Important constraint from the contract:** Recipients must already be registered on-chain. The UI should validate this before allowing the user to publish rules.

---

### 4. Claim Funds — `claim()`

**The problem:** There is no way for users to withdraw their unclaimed balance. Distribution (`distribute()` and `distribute_and_claim()`) is handled automatically by Tippa's backend when a donation comes in, so no UI is needed for that. But the owner still needs to claim their accumulated share.

**Proposal:** Add a **"Funds" section** to the dashboard page or create a dedicated `app/dashboard/funds/page.tsx`.

This section/page should show:
- **Unclaimed balance** — tokens already distributed to the user (their owner share), ready to withdraw, broken down per asset.
- **"Claim" button** — triggers `claim(caller, username, asset, to)`. Lets user specify destination address (defaults to connected wallet).
- **Claim history** — list of past withdrawals with TX hashes.

**Components needed:**
- `components/funds/unclaimed-balance.tsx` — displays claimable amount per asset with claim button.
- `components/funds/claim-dialog.tsx` — set destination address, confirm & sign.

**Navigation:** Add "Funds" to the sidebar between "Dashboard" and "Cascades".

---

### 5. Transfer Ownership — `transfer_ownership()`

**The problem:** No UI for transferring username ownership.

**Proposal:** Add to the **Settings page** under the existing "Danger Zone" section (which already has a non-functional delete account button).

**Changes needed in `components/settings/settings-client.tsx`:**
- Add a "Transfer Ownership" card in the danger zone.
- Input field for the new owner's Stellar address.
- Confirmation dialog with a warning that this is irreversible.
- Builds and signs `transfer_ownership(caller, username, new_owner)`.

This is a rarely used, high-risk action — keeping it in the danger zone is appropriate.

---

### 6. Contract Interaction Layer

**The problem:** The wallet provider connects wallets but has no infrastructure for building, signing, or submitting contract transactions.

**Proposal:** Create a contract interaction module.

**Files needed:**
- `lib/contract.ts` — Contract client that wraps the user-facing contract functions (`register`, `set_rules`, `donate`, `claim`, `transfer_ownership`). Handles transaction building, simulation, and submission via Stellar SDK. (`distribute` and `distribute_and_claim` are called by Tippa's backend only.)
- Extend `providers/wallet-provider.tsx` — Add a `signTransaction()` method that takes a built transaction XDR and returns the signed XDR.

This is a prerequisite for all the items above.

---

## Summary: Priority Order

| Priority | Item | Effort | Depends On |
|---|---|---|---|
| **P0** | Contract interaction layer (`lib/contract.ts` + wallet signing) | Medium | — |
| **P0** | On-chain registration flow | Small | Contract layer |
| **P0** | On-chain rule sync for cascades | Small | Contract layer, registration |
| **P1** | Public donate page | Large | Contract layer |
| **P1** | Claim funds page | Small | Contract layer, registration |
| **P2** | Transfer ownership in settings | Small | Contract layer |

**Note:** `distribute()` and `distribute_and_claim()` are not listed here — they are called by Tippa's backend automatically after each donation and do not need a user-facing UI.
