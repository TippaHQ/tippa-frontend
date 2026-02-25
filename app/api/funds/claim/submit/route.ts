import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { TransactionBuilder, Networks } from "@stellar/stellar-sdk"
import { Server } from "@stellar/stellar-sdk/rpc"

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { signedXdr } = body as { signedXdr: string }

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
      return NextResponse.json({ success: true, txHash: sendResponse.hash })
    }

    return NextResponse.json({ error: "Claim transaction failed on-chain." }, { status: 400 })
  } catch (err) {
    console.error("Failed to submit claim tx:", err)
    return NextResponse.json({ error: "Failed to submit transaction." }, { status: 500 })
  }
}
