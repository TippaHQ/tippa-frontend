import { NextResponse } from "next/server"
import { Client, networks } from "tippa-client"
import { TESTNET_ASSETS } from "@/lib/constants/assets"

export async function POST(request: Request) {
  const body = await request.json()
  const { callerAddress, username, assetId, amount, donorOverride } = body as {
    callerAddress: string
    username: string
    assetId: string
    amount: string
    donorOverride?: string
  }

  if (!callerAddress || !username || !assetId || !amount) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 })
  }

  const parsedAmount = parseFloat(amount)
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    return NextResponse.json({ error: "Amount must be greater than zero." }, { status: 400 })
  }

  const asset = TESTNET_ASSETS.find((a) => a.id === assetId)
  if (!asset) {
    return NextResponse.json({ error: "Unsupported asset." }, { status: 400 })
  }

  try {
    const client = new Client({
      ...networks.testnet,
      rpcUrl: process.env.SOROBAN_RPC_URL || "https://soroban-testnet.stellar.org",
      publicKey: callerAddress,
    })

    const stroops = BigInt(Math.round(parsedAmount * 10 ** asset.decimals))

    const tx = await client.donate({
      caller: callerAddress,
      username,
      asset: asset.contractId,
      amount: stroops,
      donor_override: donorOverride ?? undefined,
    })

    return NextResponse.json({ xdr: tx.toXDR() })
  } catch (err) {
    console.error("Failed to build donate tx:", err)
    return NextResponse.json({ error: "Failed to build transaction." }, { status: 500 })
  }
}
