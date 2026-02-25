import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { Client, networks } from "tippa-client"
import { TESTNET_ASSETS } from "@/lib/constants/assets"

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: profile } = await supabase.from("profiles").select("username, wallet_address").eq("id", user.id).single()

  if (!profile?.username || !profile?.wallet_address) {
    return NextResponse.json({ error: "Profile not complete. Register a username first." }, { status: 400 })
  }

  try {
    const client = new Client({
      ...networks.testnet,
      rpcUrl: process.env.SOROBAN_RPC_URL || "https://soroban-testnet.stellar.org",
      publicKey: profile.wallet_address,
    })

    const balances = await Promise.all(
      TESTNET_ASSETS.map(async (asset) => {
        let pool = "0"
        let unclaimed = "0"
        let totalReceived = "0"
        let totalForwarded = "0"

        try {
          const poolTx = await client.get_pool({ username: profile.username!, asset: asset.contractId })
          pool = formatBalance(poolTx.result, asset.decimals)
        } catch {
          // User may not have pool for this asset yet
        }

        try {
          const unclaimedTx = await client.get_unclaimed({ username: profile.username!, asset: asset.contractId })
          unclaimed = formatBalance(unclaimedTx.result, asset.decimals)
        } catch {
          // User may not have unclaimed for this asset yet
        }

        try {
          const totalReceivedTx = await client.get_total_received({ username: profile.username!, asset: asset.contractId })
          totalReceived = formatBalance(totalReceivedTx.result, asset.decimals)
        } catch {
          // User may not have received for this asset yet
        }

        try {
          const totalForwardedTx = await client.get_total_forwarded({ username: profile.username!, asset: asset.contractId })
          totalForwarded = formatBalance(totalForwardedTx.result, asset.decimals)
        } catch {
          // User may not have forwarded for this asset yet
        }

        return {
          assetId: asset.id,
          assetName: asset.name,
          symbol: asset.symbol,
          contractId: asset.contractId,
          pool,
          unclaimed,
          totalReceived,
          totalForwarded,
        }
      }),
    )

    return NextResponse.json({ balances })
  } catch (err) {
    console.error("Failed to fetch balances:", err)
    return NextResponse.json({ error: "Failed to fetch balances." }, { status: 500 })
  }
}

function formatBalance(raw: bigint, decimals: number): string {
  const divisor = 10 ** decimals
  const num = Number(raw) / divisor
  return num.toFixed(decimals > 2 ? 2 : decimals)
}
