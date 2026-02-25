# Transaction Recording Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign the transactions table from user-centric (`user_id` + `received/forwarded`) to a flat event log (`from/to` + `donate/distribute`), and wire up actual transaction recording in the donate and distribute flows (currently no code writes to the table).

**Architecture:** Flat event-log table where each row is a single transfer. Donate submissions insert one `donate` row. Distribute processing inserts one `distribute` row per recipient, calculating shares from cascade_dependencies at write time. Dashboard queries by `WHERE from_username = me OR to_username = me`.

**Tech Stack:** Supabase (PostgreSQL + RLS), Next.js API routes, Soroban contract client (tippa-client), TypeScript

---

### Task 1: Database Migration

**Files:**
- Create: `scripts/010_redesign_transactions.sql`

**Step 1: Write the migration SQL**

```sql
-- 010_redesign_transactions.sql
-- Redesign transactions table: user-centric -> flat event log

-- Drop existing RLS policies
DROP POLICY IF EXISTS "transactions_select_own" ON public.transactions;
DROP POLICY IF EXISTS "transactions_insert_own" ON public.transactions;

-- Drop user_id column and cascade_info
ALTER TABLE public.transactions
  DROP COLUMN IF EXISTS user_id,
  DROP COLUMN IF EXISTS cascade_info;

-- Change type enum: received/forwarded -> donate/distribute
ALTER TABLE public.transactions ALTER COLUMN type TYPE text;
DROP TYPE IF EXISTS public.transaction_type;
CREATE TYPE public.transaction_type AS ENUM ('donate', 'distribute');
ALTER TABLE public.transactions ALTER COLUMN type TYPE public.transaction_type USING type::public.transaction_type;

-- Rename columns: from_name -> from_username, to_name -> to_username
ALTER TABLE public.transactions RENAME COLUMN from_name TO from_username;
ALTER TABLE public.transactions RENAME COLUMN to_name TO to_username;

-- from_username is nullable (external donors without tippa accounts)
ALTER TABLE public.transactions ALTER COLUMN from_username DROP NOT NULL;

-- Drop old user_id index, add username-based indexes
DROP INDEX IF EXISTS idx_transactions_user_id;
CREATE INDEX IF NOT EXISTS idx_transactions_from_username ON public.transactions(from_username, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_to_username ON public.transactions(to_username, created_at DESC);

-- RLS: users see transactions where they are from or to
CREATE POLICY "transactions_select_own" ON public.transactions
  FOR SELECT USING (
    from_username = (SELECT username FROM public.profiles WHERE id = auth.uid())
    OR to_username = (SELECT username FROM public.profiles WHERE id = auth.uid())
  );

-- No INSERT/UPDATE/DELETE policies for regular users.
-- All inserts happen server-side via service role (admin client).
```

**Step 2: Run the migration against Supabase**

Run the migration in the Supabase SQL editor or via CLI. Verify the table schema changed:
- `user_id` column gone
- `cascade_info` column gone
- `from_name` renamed to `from_username` (nullable)
- `to_name` renamed to `to_username`
- `type` enum is now `donate | distribute`
- RLS policy uses username subquery

**Step 3: Commit**

```bash
git add scripts/010_redesign_transactions.sql
git commit -m "feat: add migration to redesign transactions table as event log"
```

---

### Task 2: Update TypeScript Types

**Files:**
- Modify: `lib/types.ts:42-59`

**Step 1: Update the Transaction type**

Replace lines 42-59 in `lib/types.ts`:

```typescript
export type TransactionType = "donate" | "distribute"
export type TransactionStatus = "completed" | "pending" | "failed"

export interface Transaction {
  id: string
  type: TransactionType
  from_address: string
  from_username: string | null
  to_address: string
  to_username: string
  amount: number
  asset: string
  status: TransactionStatus
  stellar_tx_hash: string | null
  created_at: string
}
```

**Step 2: Verify no type errors from the change**

Run: `pnpm build` (note: TS errors are currently ignored via next.config.mjs, but check console output for relevant warnings).

**Step 3: Commit**

```bash
git add lib/types.ts
git commit -m "feat: update Transaction type to event-log schema (donate/distribute)"
```

---

### Task 3: Update Server Action `getTransactions`

**Files:**
- Modify: `lib/actions.ts:159-186`

**Step 1: Rewrite getTransactions to query by username**

Replace the `getTransactions` function (lines 159-186) in `lib/actions.ts`:

```typescript
export async function getTransactions(opts?: {
  type?: "donate" | "distribute"
  search?: string
  limit?: number
  offset?: number
}): Promise<{ data: Transaction[]; count: number }> {
  const profile = await getProfile()
  if (!profile?.username) return { data: [], count: 0 }
  const supabase = await createClient()

  let query = supabase
    .from("transactions")
    .select("*", { count: "exact" })
    .or(`from_username.eq.${profile.username},to_username.eq.${profile.username}`)
    .order("created_at", { ascending: false })

  if (opts?.type) {
    query = query.eq("type", opts.type)
  }
  if (opts?.search) {
    query = query.or(
      `from_username.ilike.%${opts.search}%,to_username.ilike.%${opts.search}%,from_address.ilike.%${opts.search}%,stellar_tx_hash.ilike.%${opts.search}%`,
    )
  }
  if (opts?.limit) {
    const offset = opts.offset ?? 0
    query = query.range(offset, offset + opts.limit - 1)
  }

  const { data, count } = await query
  return { data: data ?? [], count: count ?? 0 }
}
```

Key changes:
- Uses `getProfile()` to get current user's `username` instead of `user.id`
- Queries with `.or(from_username.eq..., to_username.eq...)` instead of `.eq("user_id", ...)`
- Filter type is now `"donate" | "distribute"` instead of `"received" | "forwarded"`
- Search uses `from_username`/`to_username` instead of `from_name`/`to_name`

**Step 2: Commit**

```bash
git add lib/actions.ts
git commit -m "feat: update getTransactions to query by username (event-log schema)"
```

---

### Task 4: Record Donate Transactions

**Files:**
- Modify: `app/api/donate/submit/route.ts`
- Modify: `components/donate/donate-form.tsx:78-86`

**Step 1: Update the donate form to pass extra fields to submit**

In `components/donate/donate-form.tsx`, find the submit fetch call (around line 78-86) and add `donorAddress`, `amount`, and `assetId`:

Replace:
```typescript
body: JSON.stringify({
  signedXdr,
  username: profile.username,
  assetContractId: selectedAsset.contractId,
}),
```

With:
```typescript
body: JSON.stringify({
  signedXdr,
  username: profile.username,
  assetContractId: selectedAsset.contractId,
  donorAddress: walletAddress,
  amount,
  assetId,
}),
```

**Step 2: Update the donate submit route to record the transaction**

Replace the entire `app/api/donate/submit/route.ts` with:

```typescript
import { NextResponse, after } from "next/server"
import { TransactionBuilder, Networks } from "@stellar/stellar-sdk"
import { Server } from "@stellar/stellar-sdk/rpc"
import { createAdminClient } from "@/lib/supabase/admin"
import { processDistributionQueue } from "@/lib/distribute"

export async function POST(request: Request) {
  const body = await request.json()
  const { signedXdr, username, assetContractId, donorAddress, amount, assetId } = body as {
    signedXdr: string
    username?: string
    assetContractId?: string
    donorAddress?: string
    amount?: string
    assetId?: string
  }

  if (!signedXdr) {
    return NextResponse.json({ error: "Missing signed transaction." }, { status: 400 })
  }

  try {
    const rpcUrl = process.env.SOROBAN_RPC_URL || "https://soroban-testnet.stellar.org"
    const server = new Server(rpcUrl)

    const tx = TransactionBuilder.fromXDR(signedXdr, Networks.TESTNET)
    const sendResponse = await server.sendTransaction(tx)

    if (sendResponse.status === "ERROR") {
      return NextResponse.json({ error: "Transaction submission failed." }, { status: 400 })
    }

    // Poll for result
    let getResponse = await server.getTransaction(sendResponse.hash)
    while (getResponse.status === "NOT_FOUND") {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      getResponse = await server.getTransaction(sendResponse.hash)
    }

    if (getResponse.status === "SUCCESS") {
      const adminClient = createAdminClient()

      // Record the donate transaction
      if (username && donorAddress && amount && assetId) {
        try {
          // Look up recipient's wallet address
          const { data: recipientProfile } = await adminClient
            .from("profiles")
            .select("wallet_address")
            .eq("username", username)
            .single()

          // Look up donor's username (nullable - they may not have a tippa account)
          const { data: donorProfile } = await adminClient
            .from("profiles")
            .select("username")
            .eq("wallet_address", donorAddress)
            .single()

          await adminClient.from("transactions").insert({
            type: "donate",
            from_address: donorAddress,
            from_username: donorProfile?.username ?? null,
            to_address: recipientProfile?.wallet_address ?? "",
            to_username: username,
            amount: parseFloat(amount),
            asset: assetId,
            status: "completed",
            stellar_tx_hash: sendResponse.hash,
          })
        } catch (txRecordErr) {
          console.error("Failed to record donate transaction:", txRecordErr)
        }
      }

      // Enqueue distribution
      if (username && assetContractId) {
        try {
          await adminClient.from("distribution_queue").insert({
            username,
            asset_contract_id: assetContractId,
            depth: 0,
            source_tx: sendResponse.hash,
          })

          after(async () => {
            try {
              const results = await processDistributionQueue()
              console.log("Auto-distribution results:", results)
            } catch (err) {
              console.error("Auto-distribution failed:", err)
            }
          })
        } catch (enqueueErr) {
          console.error("Failed to enqueue distribution:", enqueueErr)
        }
      }

      return NextResponse.json({ success: true, txHash: sendResponse.hash })
    }

    return NextResponse.json({ error: "Transaction failed on-chain." }, { status: 400 })
  } catch (err) {
    console.error("Failed to submit donate tx:", err)
    return NextResponse.json({ error: "Failed to submit transaction." }, { status: 500 })
  }
}
```

**Step 3: Commit**

```bash
git add app/api/donate/submit/route.ts components/donate/donate-form.tsx
git commit -m "feat: record donate transactions in the transactions table"
```

---

### Task 5: Record Distribute Transactions

**Files:**
- Modify: `lib/distribute.ts`

**Step 1: Update processDistributionQueue to record per-recipient transactions**

Replace the entire `lib/distribute.ts` with:

```typescript
import { Keypair, TransactionBuilder, Networks } from "@stellar/stellar-sdk"
import { Server } from "@stellar/stellar-sdk/rpc"
import { Client, networks } from "tippa-client"
import { createAdminClient } from "@/lib/supabase/admin"

const MAX_ATTEMPTS = 3
const MAX_DEPTH = 10
const ASSET_DECIMALS = 7

export interface ProcessResults {
  processed: number
  succeeded: number
  failed: number
  enqueued: number
  skipped: number
}

export async function processDistributionQueue(): Promise<ProcessResults> {
  const adminClient = createAdminClient()
  const rpcUrl = process.env.SOROBAN_RPC_URL || "https://soroban-testnet.stellar.org"
  const server = new Server(rpcUrl)
  const keypair = Keypair.fromSecret(process.env.TIPPA_DISTRIBUTOR_SECRET_KEY!)

  // Pick up pending items
  const { data: items, error: fetchError } = await adminClient
    .from("distribution_queue")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: true })
    .limit(10)

  if (fetchError) {
    console.error("Failed to fetch distribution queue:", fetchError)
    throw new Error("Failed to fetch queue.")
  }

  if (!items || items.length === 0) {
    return { processed: 0, succeeded: 0, failed: 0, enqueued: 0, skipped: 0 }
  }

  const results: ProcessResults = { processed: 0, succeeded: 0, failed: 0, enqueued: 0, skipped: 0 }

  for (const item of items) {
    results.processed++

    // Mark as processing
    await adminClient
      .from("distribution_queue")
      .update({ status: "processing" })
      .eq("id", item.id)

    try {
      const client = new Client({
        ...networks.testnet,
        rpcUrl,
        publicKey: keypair.publicKey(),
      })

      // Read pool amount BEFORE distributing (for transaction recording)
      let poolAmount: bigint = BigInt(0)
      try {
        const poolResult = await client.get_pool({
          username: item.username,
          asset: item.asset_contract_id,
        })
        poolAmount = poolResult.result
      } catch {
        // Pool read failed — will still attempt distribute (contract handles NothingToDistribute)
      }

      // Build distribute tx
      const assembled = await client.distribute({
        username: item.username,
        asset: item.asset_contract_id,
        min_distribution: BigInt(0),
      })

      // Sign server-side
      const xdr = assembled.toXDR()
      const tx = TransactionBuilder.fromXDR(xdr, Networks.TESTNET)
      tx.sign(keypair)

      // Submit
      const sendResponse = await server.sendTransaction(tx)

      if (sendResponse.status === "ERROR") {
        throw new Error("Transaction submission failed")
      }

      // Poll for result
      let getResponse = await server.getTransaction(sendResponse.hash)
      while (getResponse.status === "NOT_FOUND") {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        getResponse = await server.getTransaction(sendResponse.hash)
      }

      if (getResponse.status !== "SUCCESS") {
        throw new Error("Transaction failed on-chain")
      }

      // Mark completed
      await adminClient
        .from("distribution_queue")
        .update({
          status: "completed",
          tx_hash: sendResponse.hash,
          processed_at: new Date().toISOString(),
        })
        .eq("id", item.id)

      results.succeeded++

      // Record distribute transactions per recipient
      if (poolAmount > BigInt(0)) {
        await recordDistributeTransactions(
          adminClient,
          item.username,
          item.asset_contract_id,
          poolAmount,
          sendResponse.hash,
        )
      }

      // Enqueue downstream recipients if depth allows
      if (item.depth < MAX_DEPTH) {
        await enqueueDownstream(adminClient, item.username, item.asset_contract_id, item.depth, item.source_tx, results)
      }
    } catch (err) {
      const errMsg = String(err)

      // NothingToDistribute or RulesNotSet — not errors, just nothing to do
      if (errMsg.includes("#7") || errMsg.includes("#11")) {
        await adminClient
          .from("distribution_queue")
          .update({
            status: "completed",
            error: errMsg.includes("#7") ? "NothingToDistribute" : "RulesNotSet",
            processed_at: new Date().toISOString(),
          })
          .eq("id", item.id)

        results.skipped++
        continue
      }

      // Real error — retry or fail permanently
      const newAttempts = (item.attempts || 0) + 1
      await adminClient
        .from("distribution_queue")
        .update({
          status: newAttempts >= MAX_ATTEMPTS ? "failed" : "pending",
          attempts: newAttempts,
          error: errMsg.slice(0, 500),
        })
        .eq("id", item.id)

      results.failed++
      console.error(`Distribution failed for ${item.username}:`, err)
    }
  }

  return results
}

async function recordDistributeTransactions(
  adminClient: ReturnType<typeof createAdminClient>,
  username: string,
  assetContractId: string,
  poolAmount: bigint,
  txHash: string,
) {
  try {
    // Look up distributor's profile
    const { data: distributorProfile } = await adminClient
      .from("profiles")
      .select("id, wallet_address")
      .eq("username", username)
      .single()

    if (!distributorProfile) return

    // Get cascade dependencies (rules with percentages)
    const { data: deps } = await adminClient
      .from("cascade_dependencies")
      .select("recipient_username, percentage")
      .eq("user_id", distributorProfile.id)

    if (!deps || deps.length === 0) return

    // Determine asset symbol from contract ID
    const assetSymbol = resolveAssetSymbol(assetContractId)

    // Calculate each recipient's share and insert transaction rows
    const txRows = []
    for (const dep of deps) {
      // Match contract math: pool * bps / 10000 (integer division in stroops)
      const bps = BigInt(Math.round(dep.percentage * 100))
      const shareStroops = (poolAmount * bps) / BigInt(10000)

      if (shareStroops <= BigInt(0)) continue

      // Convert stroops back to human-readable (7 decimals)
      const shareHuman = Number(shareStroops) / 10 ** ASSET_DECIMALS

      // Look up recipient's wallet address
      const { data: recipientProfile } = await adminClient
        .from("profiles")
        .select("wallet_address")
        .eq("username", dep.recipient_username)
        .single()

      txRows.push({
        type: "distribute" as const,
        from_address: distributorProfile.wallet_address,
        from_username: username,
        to_address: recipientProfile?.wallet_address ?? "",
        to_username: dep.recipient_username,
        amount: shareHuman,
        asset: assetSymbol,
        status: "completed" as const,
        stellar_tx_hash: txHash,
      })
    }

    if (txRows.length > 0) {
      await adminClient.from("transactions").insert(txRows)
    }
  } catch (err) {
    console.error("Failed to record distribute transactions:", err)
  }
}

function resolveAssetSymbol(contractId: string): string {
  // Known testnet asset contract IDs
  const assetMap: Record<string, string> = {
    CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA: "USDC",
    CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC: "XLM",
  }
  return assetMap[contractId] ?? "UNKNOWN"
}

async function enqueueDownstream(
  adminClient: ReturnType<typeof createAdminClient>,
  username: string,
  assetContractId: string,
  currentDepth: number,
  sourceTx: string | null,
  results: { enqueued: number },
) {
  // Find the user's profile ID
  const { data: profile } = await adminClient
    .from("profiles")
    .select("id")
    .eq("username", username)
    .single()

  if (!profile) return

  // Get their cascade dependencies
  const { data: deps } = await adminClient
    .from("cascade_dependencies")
    .select("recipient_username")
    .eq("user_id", profile.id)

  if (!deps || deps.length === 0) return

  for (const dep of deps) {
    // Check if recipient has their own cascade rules (dependencies)
    const { data: recipientProfile } = await adminClient
      .from("profiles")
      .select("id")
      .eq("username", dep.recipient_username)
      .single()

    if (!recipientProfile) continue

    const { count } = await adminClient
      .from("cascade_dependencies")
      .select("*", { count: "exact", head: true })
      .eq("user_id", recipientProfile.id)

    if (count && count > 0) {
      await adminClient.from("distribution_queue").insert({
        username: dep.recipient_username,
        asset_contract_id: assetContractId,
        depth: currentDepth + 1,
        source_tx: sourceTx,
      })
      results.enqueued++
    }
  }
}
```

Key changes from current code:
- Added `get_pool()` call before `distribute()` to capture pool snapshot
- Added `recordDistributeTransactions()` function that calculates per-recipient shares and inserts rows
- Added `resolveAssetSymbol()` helper to map contract IDs to symbols
- `enqueueDownstream` is unchanged

**Step 2: Commit**

```bash
git add lib/distribute.ts
git commit -m "feat: record per-recipient distribute transactions in transactions table"
```

---

### Task 6: Update Transactions Page & Dashboard Components

**Files:**
- Modify: `app/dashboard/transactions/page.tsx`
- Modify: `components/transactions/transactions-client.tsx`
- Modify: `components/dashboard/recent-transactions.tsx`
- Modify: `app/dashboard/page.tsx`

**Step 1: Pass username to TransactionsClient**

Replace `app/dashboard/transactions/page.tsx`:

```typescript
import { getTransactions, getProfile } from "@/lib/actions"
import { TransactionsClient } from "@/components/transactions/transactions-client"

export default async function TransactionsPage() {
  const [{ data, count }, profile] = await Promise.all([
    getTransactions({ limit: 20 }),
    getProfile(),
  ])

  return (
    <TransactionsClient
      initialTransactions={data}
      initialCount={count}
      currentUsername={profile?.username ?? null}
    />
  )
}
```

**Step 2: Update TransactionsClient for new schema**

Replace `components/transactions/transactions-client.tsx`:

```typescript
"use client"

import { useState } from "react"
import { ArrowDownLeft, ArrowUpRight, ExternalLink, Search, Filter, Download, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import type { Transaction, TransactionType } from "@/lib/types"

interface TransactionsClientProps {
  initialTransactions: Transaction[]
  initialCount: number
  currentUsername: string | null
}

export function TransactionsClient({ initialTransactions, initialCount, currentUsername }: TransactionsClientProps) {
  const [filter, setFilter] = useState<"all" | TransactionType>("all")
  const [searchQuery, setSearchQuery] = useState("")

  const filtered = initialTransactions.filter((tx) => {
    if (filter !== "all" && tx.type !== filter) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return (
        (tx.from_username ?? "").toLowerCase().includes(q) ||
        tx.to_username.toLowerCase().includes(q) ||
        tx.from_address.toLowerCase().includes(q) ||
        (tx.stellar_tx_hash ?? "").toLowerCase().includes(q)
      )
    }
    return true
  })

  const isEmpty = filtered.length === 0

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Transactions</h1>
          <p className="mt-1 text-sm text-muted-foreground">Full history of all payments and cascade activity</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2 border-border text-foreground hover:bg-secondary">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, address, or hash..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 border-border bg-secondary/50 pl-9 text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg border border-border bg-secondary/30 p-0.5">
            {(["all", "donate", "distribute"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors",
                  filter === f ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {f === "all" ? "All" : f === "donate" ? "Donations" : "Distributions"}
              </button>
            ))}
          </div>
          <Select defaultValue="all-time">
            <SelectTrigger className="h-9 w-32 border-border bg-secondary/50 text-sm text-foreground">
              <Filter className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-border bg-popover">
              <SelectItem value="all-time">All time</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {isEmpty ? (
          <div className="flex items-center justify-center py-20 text-sm text-muted-foreground">
            {searchQuery || filter !== "all"
              ? "No transactions match your filters."
              : "No transactions yet. Payments will appear here once they start flowing."}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-secondary/30">
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Type</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">From / To</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Amount</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Time</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Explorer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((tx) => {
                    const isIncoming = tx.to_username === currentUsername
                    const counterparty = isIncoming ? (tx.from_username ?? tx.from_address) : tx.to_username
                    const counterpartyAddress = isIncoming ? tx.from_address : tx.to_address
                    const timeAgo = formatDistanceToNow(new Date(tx.created_at), { addSuffix: true })
                    const dateStr = new Date(tx.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                    return (
                      <tr key={tx.id} className="transition-colors hover:bg-secondary/20">
                        <td className="px-5 py-3.5">
                          <div
                            className={cn(
                              "flex h-8 w-8 items-center justify-center rounded-lg",
                              isIncoming ? "bg-primary/10" : "bg-[hsl(var(--chart-2))]/10",
                            )}
                          >
                            {isIncoming ? (
                              <ArrowDownLeft className="h-4 w-4 text-primary" />
                            ) : (
                              <ArrowUpRight className="h-4 w-4 text-[hsl(var(--chart-2))]" />
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <p className="text-sm font-medium text-foreground">{counterparty}</p>
                          <p className="font-mono text-xs text-muted-foreground">
                            {counterpartyAddress.slice(0, 4) + "..." + counterpartyAddress.slice(-4)}
                          </p>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={cn("font-mono text-sm font-semibold", isIncoming ? "text-[hsl(var(--success))]" : "text-foreground")}>
                            {isIncoming ? "+" : "-"}
                            {Math.abs(Number(tx.amount)).toFixed(2)}
                          </span>
                          <span className="ml-1.5 text-xs text-muted-foreground">{tx.asset}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                              tx.status === "completed" && "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]",
                              tx.status === "pending" && "bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]",
                              tx.status === "failed" && "bg-destructive/10 text-destructive",
                            )}
                          >
                            <span
                              className={cn(
                                "h-1.5 w-1.5 rounded-full",
                                tx.status === "completed" && "bg-[hsl(var(--success))]",
                                tx.status === "pending" && "bg-[hsl(var(--warning))]",
                                tx.status === "failed" && "bg-destructive",
                              )}
                            />
                            {tx.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <p className="text-xs text-foreground">{timeAgo}</p>
                          <p className="text-[10px] text-muted-foreground">{dateStr}</p>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          {tx.stellar_tx_hash ? (
                            <a
                              href={`https://stellar.expert/explorer/testnet/tx/${tx.stellar_tx_hash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-muted-foreground transition-colors hover:text-primary"
                              aria-label="View transaction on Stellar Explorer"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          ) : (
                            <span className="text-muted-foreground/30">
                              <ExternalLink className="h-3.5 w-3.5" />
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between border-t border-border px-5 py-3">
              <p className="text-xs text-muted-foreground">
                Showing <span className="font-medium text-foreground">{filtered.length}</span> of{" "}
                <span className="font-medium text-foreground">{initialCount}</span> transactions
              </p>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" disabled>
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sr-only">Previous page</span>
                </Button>
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-xs font-medium text-primary-foreground">1</span>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" disabled={initialCount <= 20}>
                  <ChevronRight className="h-4 w-4" />
                  <span className="sr-only">Next page</span>
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
```

Key changes:
- Added `currentUsername` prop to determine direction (incoming vs outgoing)
- Filter buttons: `Donations` / `Distributions` instead of `Received` / `Forwarded`
- Direction based on `tx.to_username === currentUsername` instead of `tx.type === "received"`
- References `from_username`/`to_username` instead of `from_name`/`to_name`
- Removed Cascade column
- Explorer links point to testnet instead of public

**Step 3: Update RecentTransactions for new schema**

Replace `components/dashboard/recent-transactions.tsx`:

```typescript
"use client"

import { ArrowDownLeft, ArrowUpRight, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import type { Transaction } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"

interface RecentTransactionsProps {
  transactions: Transaction[]
  currentUsername: string | null
}

export function RecentTransactions({ transactions, currentUsername }: RecentTransactionsProps) {
  const isEmpty = transactions.length === 0

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border p-5">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Recent Transactions</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">{isEmpty ? "No transactions yet" : "Latest payment activity on your account"}</p>
        </div>
        <Link href="/dashboard/transactions" className="text-xs font-medium text-primary transition-colors hover:text-primary/80">
          View all
        </Link>
      </div>
      <div className="divide-y divide-border">
        {isEmpty ? (
          <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
            Transactions will appear here once payments start flowing.
          </div>
        ) : (
          transactions.map((tx) => {
            const isIncoming = tx.to_username === currentUsername
            const counterparty = isIncoming ? (tx.from_username ?? tx.from_address) : tx.to_username
            const counterpartyAddress = isIncoming ? tx.from_address : tx.to_address
            const timeAgo = formatDistanceToNow(new Date(tx.created_at), { addSuffix: true })
            return (
              <div key={tx.id} className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-secondary/30">
                <div
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                    isIncoming ? "bg-primary/10" : "bg-[hsl(var(--chart-2))]/10",
                  )}
                >
                  {isIncoming ? <ArrowDownLeft className="h-4 w-4 text-primary" /> : <ArrowUpRight className="h-4 w-4 text-[hsl(var(--chart-2))]" />}
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{counterparty}</span>
                    <span className="font-mono text-xs text-muted-foreground">
                      {counterpartyAddress.slice(0, 4) + "..." + counterpartyAddress.slice(-4)}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground capitalize">{tx.type}</p>
                </div>
                <div className="text-right">
                  <p className={cn("text-sm font-semibold", isIncoming ? "text-[hsl(var(--success))]" : "text-foreground")}>
                    {isIncoming ? "+" : "-"}
                    {Math.abs(Number(tx.amount)).toFixed(2)} {tx.asset}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{timeAgo}</p>
                </div>
                {tx.stellar_tx_hash && (
                  <a
                    href={`https://stellar.expert/explorer/testnet/tx/${tx.stellar_tx_hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 text-muted-foreground transition-colors hover:text-primary"
                    aria-label="View on Stellar Explorer"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
```

Key changes:
- Added `currentUsername` prop
- Direction based on `tx.to_username === currentUsername`
- Shows `tx.type` ("donate"/"distribute") instead of `cascade_info`
- Explorer links point to testnet

**Step 4: Update dashboard page to pass username**

Replace `app/dashboard/page.tsx`:

```typescript
import { StatCards } from "@/components/dashboard/stat-cards"
import { FlowChart } from "@/components/dashboard/flow-chart"
import { RecentTransactions } from "@/components/dashboard/recent-transactions"
import { CascadePreview } from "@/components/dashboard/cascade-preview"
import { getDashboardStats, getMonthlyFlowStats, getTransactions, getCascadeDependencies, getProfile } from "@/lib/actions"

export default async function DashboardPage() {
  const [stats, monthlyStats, txResult, deps, profile] = await Promise.all([
    getDashboardStats(),
    getMonthlyFlowStats(),
    getTransactions({ limit: 5 }),
    getCascadeDependencies(),
    getProfile(),
  ])

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Overview of your cascading payment activity</p>
      </div>

      <StatCards
        activeCascades={stats.activeCascades}
        depCount={stats.depCount}
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <FlowChart data={monthlyStats} />
        </div>
        <CascadePreview dependencies={deps} username={profile?.username ?? profile?.display_name ?? "you"} />
      </div>

      <RecentTransactions transactions={txResult.data} currentUsername={profile?.username ?? null} />
    </div>
  )
}
```

Only change: passes `currentUsername={profile?.username ?? null}` to `RecentTransactions`.

**Step 5: Commit**

```bash
git add app/dashboard/transactions/page.tsx components/transactions/transactions-client.tsx components/dashboard/recent-transactions.tsx app/dashboard/page.tsx
git commit -m "feat: update transaction UI for event-log schema (donate/distribute)"
```

---

### Task 7: Verification

**Step 1: Run build to verify no compilation errors**

Run: `pnpm build`

**Step 2: Run the migration on Supabase**

Execute `scripts/010_redesign_transactions.sql` in the Supabase SQL editor.

**Step 3: Test donate flow end-to-end**

1. Open `/d/[username]` for a user with cascade rules configured
2. Connect wallet, enter amount, select asset, donate
3. Verify in Supabase: one row in `transactions` with `type='donate'`
4. Verify: the auto-distribution creates `type='distribute'` rows per recipient

**Step 4: Test dashboard display**

1. Log in as the donation recipient
2. Open `/dashboard` — RecentTransactions should show the donation as incoming
3. Open `/dashboard/transactions` — should show all donations and distributions
4. Filter by "Donations" and "Distributions" — each filter should work
5. Log in as a cascade recipient — should see the distribute as incoming

**Step 5: Test edge case - external donor**

1. Donate from a wallet that has no tippa account
2. Verify: `from_username` is null, `from_address` is set
3. Dashboard should show the address instead of username
