import { getProfile } from "@/lib/actions"
import { FundsClient } from "@/components/funds/funds-client"
import { redirect } from "next/navigation"

export default async function FundsPage() {
  const profile = await getProfile()

  if (!profile?.username || !profile?.wallet_address) {
    redirect("/dashboard")
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Funds</h1>
        <p className="mt-1 text-sm text-muted-foreground">View your on-chain balances and withdraw unclaimed funds</p>
      </div>

      <FundsClient username={profile.username} walletAddress={profile.wallet_address} />
    </div>
  )
}
