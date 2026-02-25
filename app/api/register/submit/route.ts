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
  const { signedXdr, username, walletAddress } = body as {
    signedXdr: string
    username: string
    walletAddress: string
  }

  if (!signedXdr || !username || !walletAddress) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 })
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
      const { error: updateError } = await supabase.from("profiles").update({ username, wallet_address: walletAddress }).eq("id", user.id)

      if (updateError) {
        console.error("Failed to update profile:", updateError)
        return NextResponse.json({ error: "On-chain registration succeeded but profile update failed." }, { status: 500 })
      }

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: "Transaction failed on-chain." }, { status: 400 })
  } catch (err) {
    console.error("Failed to submit transaction:", err)
    return NextResponse.json({ error: "Failed to submit transaction." }, { status: 500 })
  }
}
