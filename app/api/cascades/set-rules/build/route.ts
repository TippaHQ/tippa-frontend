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
  const { callerAddress, username, rules } = body as {
    callerAddress: string
    username: string
    rules: Record<string, number>
  }

  if (!callerAddress || !username) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 })
  }

  try {
    // Convert percentages to basis points and build the Map
    const rulesMap = new Map<string, number>()
    for (const [recipientUsername, percentage] of Object.entries(rules)) {
      rulesMap.set(recipientUsername, Math.round(percentage * 100))
    }

    const client = new Client({
      ...networks.testnet,
      rpcUrl: process.env.SOROBAN_RPC_URL || "https://soroban-testnet.stellar.org",
      publicKey: callerAddress,
    })

    const tx = await client.set_rules({
      caller: callerAddress,
      username,
      rules: rulesMap,
    })

    return NextResponse.json({ xdr: tx.toXDR() })
  } catch (err) {
    console.error("Failed to build set_rules tx:", err)

    // Try to extract contract error for user-friendly messages
    const errMsg = String(err)
    if (errMsg.includes("#3")) {
      return NextResponse.json({ error: "Too many recipients (max 10)." }, { status: 400 })
    }
    if (errMsg.includes("#4")) {
      return NextResponse.json({ error: "Total split percentage exceeds 50%." }, { status: 400 })
    }
    if (errMsg.includes("#5")) {
      return NextResponse.json({ error: "You cannot add yourself as a recipient." }, { status: 400 })
    }
    if (errMsg.includes("#6")) {
      return NextResponse.json({ error: "Invalid percentage value." }, { status: 400 })
    }
    if (errMsg.includes("#12")) {
      return NextResponse.json({ error: "One or more recipients are not registered on Tippa." }, { status: 400 })
    }

    return NextResponse.json({ error: "Failed to build transaction." }, { status: 500 })
  }
}
