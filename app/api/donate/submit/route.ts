import { NextResponse, after } from "next/server"
import { TransactionBuilder, Networks } from "@stellar/stellar-sdk"
import { Server } from "@stellar/stellar-sdk/rpc"
import { createAdminClient } from "@/lib/supabase/admin"
import { processDistributionQueue } from "@/lib/distribute"

export async function POST(request: Request) {
  const body = await request.json()
  const { signedXdr, username, assetContractId } = body as {
    signedXdr: string
    username?: string
    assetContractId?: string
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
      // Enqueue distribution if username and asset are provided
      if (username && assetContractId) {
        try {
          const adminClient = createAdminClient()
          await adminClient.from("distribution_queue").insert({
            username,
            asset_contract_id: assetContractId,
            depth: 0,
            source_tx: sendResponse.hash,
          })

          // Process the queue in the background after the response is sent
          after(async () => {
            try {
              const results = await processDistributionQueue()
              console.log("Auto-distribution results:", results)
            } catch (err) {
              console.error("Auto-distribution failed:", err)
            }
          })
        } catch (enqueueErr) {
          // Log but don't fail the donation — distribution can be retried via cron
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
