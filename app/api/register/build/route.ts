import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { Client, networks } from "tippa-client"

const USERNAME_REGEX = /^[a-z0-9_-]{1,32}$/

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { username, walletAddress } = body as { username: string; walletAddress: string }

  if (!username || !USERNAME_REGEX.test(username)) {
    return NextResponse.json({ error: "Invalid username. Use lowercase letters, numbers, underscores, or dashes (1-32 chars)." }, { status: 400 })
  }

  if (!walletAddress) {
    return NextResponse.json({ error: "Wallet address is required." }, { status: 400 })
  }

  // Check username uniqueness in DB
  const { data: existing } = await supabase.from("profiles").select("id").eq("username", username).maybeSingle()

  if (existing) {
    return NextResponse.json({ error: "Username is already taken." }, { status: 409 })
  }

  try {
    const client = new Client({
      ...networks.testnet,
      rpcUrl: process.env.SOROBAN_RPC_URL || "https://soroban-testnet.stellar.org",
      publicKey: walletAddress,
    })

    const tx = await client.register({
      caller: walletAddress,
      username,
    })

    return NextResponse.json({ xdr: tx.toXDR() })
  } catch (err) {
    console.error("Failed to build register tx:", err)
    return NextResponse.json({ error: "Failed to build transaction." }, { status: 500 })
  }
}
