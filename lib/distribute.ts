import { Keypair, TransactionBuilder, Networks } from "@stellar/stellar-sdk"
import { Server } from "@stellar/stellar-sdk/rpc"
import { Client, networks } from "tippa-client"
import { createAdminClient } from "@/lib/supabase/admin"
import { TESTNET_ASSETS } from "@/lib/constants/assets"

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
  return TESTNET_ASSETS.find(a => a.contractId === contractId)?.symbol ?? "UNKNOWN"
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
