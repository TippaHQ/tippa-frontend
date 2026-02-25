import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { Client, networks } from "tippa-client"

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { callerAddress, username, asset, to } = body as {
    callerAddress: string
    username: string
    asset: string
    to?: string
  }

  if (!callerAddress || !username || !asset) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 })
  }

  try {
    const client = new Client({
      ...networks.testnet,
      rpcUrl: process.env.SOROBAN_RPC_URL || "https://soroban-testnet.stellar.org",
      publicKey: callerAddress,
    })

    const tx = await client.claim({
      caller: callerAddress,
      username,
      asset,
      to: to || undefined,
    })

    return NextResponse.json({ xdr: tx.toXDR() })
  } catch (err) {
    console.error("Failed to build claim tx:", err)

    const errMsg = String(err)
    if (errMsg.includes("#1")) {
      return NextResponse.json({ error: "User not found on-chain." }, { status: 400 })
    }
    if (errMsg.includes("#2")) {
      return NextResponse.json({ error: "You are not the owner of this username." }, { status: 400 })
    }
    if (errMsg.includes("#7")) {
      return NextResponse.json({ error: "Nothing to claim — balance is zero." }, { status: 400 })
    }

    return NextResponse.json({ error: "Failed to build claim transaction." }, { status: 500 })
  }
}
