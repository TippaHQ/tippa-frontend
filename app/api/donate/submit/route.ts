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
