import { notFound } from "next/navigation"
import { getDonationById, getProfileByUsername, getPublicCascadeDependencies } from "@/lib/actions"
import type { Metadata } from "next"
import { ExternalLink, Wallet, ArrowRight, Calendar, GitFork, ArrowDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { CascadeDependency } from "@/lib/types"

type Props = {
  params: Promise<{ donationId: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { donationId } = await params
  return {
    title: `Donation ${donationId.slice(0, 8)}... — Tippa`,
  }
}

export default async function DonationPage({ params }: Props) {
  const { donationId } = await params
  const donation = await getDonationById(donationId)

  if (!donation) {
    notFound()
  }

  const recipientProfile = await getProfileByUsername(donation.recipient_username)
  const cascadeDependencies: CascadeDependency[] = recipientProfile ? await getPublicCascadeDependencies(recipientProfile.id) : []

  const totalCascadePercentage = cascadeDependencies.reduce((sum, d) => sum + d.percentage, 0)
  const directAmount = donation.amount * (1 - totalCascadePercentage / 100)

  const formattedDate = new Date(donation.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <div className="rounded-2xl border border-border bg-card/80 p-6 backdrop-blur-sm sm:p-8">
      <div className="flex flex-col items-center text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(var(--success))]/10">
          <ArrowRight className="h-8 w-8 text-[hsl(var(--success))]" />
        </div>
        <h1 className="text-xl font-bold text-foreground">Impact Summary</h1>
        <p className="mt-2 text-sm text-muted-foreground">Thank you for your support!</p>
      </div>

      <div className="mt-8 space-y-4 rounded-xl border border-border bg-secondary/20 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">From</span>
          <div className="flex items-center gap-2">
            <Wallet className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="font-mono text-sm text-foreground">
              {donation.donor_username ? (
                <span className="text-primary">@{donation.donor_username}</span>
              ) : (
                <span className="text-muted-foreground">
                  {donation.donor_wallet_address.slice(0, 6)}...{donation.donor_wallet_address.slice(-4)}
                </span>
              )}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">To</span>
          <a href={`/d/${donation.recipient_username}`} className="font-mono text-sm text-primary hover:underline">
            @{donation.recipient_username}
          </a>
        </div>

        <div className="flex items-center justify-between border-t border-border pt-4">
          <span className="text-sm text-muted-foreground">Amount</span>
          <span className="font-mono text-lg font-bold text-foreground">
            {donation.amount} {donation.asset}
          </span>
        </div>

        <div className="flex items-center justify-between border-t border-border pt-4">
          <span className="text-sm text-muted-foreground">Date</span>
          <div className="flex items-center gap-2 text-sm text-foreground">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            {formattedDate}
          </div>
        </div>

        {donation.stellar_tx_hash && (
          <div className="flex items-center justify-between border-t border-border pt-4">
            <span className="text-sm text-muted-foreground">Transaction</span>
            <a
              href={`https://stellar.expert/explorer/testnet/tx/${donation.stellar_tx_hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-primary transition-colors hover:text-primary/80"
            >
              View on StellarExpert
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        )}
      </div>

      {cascadeDependencies.length > 0 && (
        <div className="mt-6 rounded-xl border border-dashed border-border/60 bg-secondary/20 p-4">
          <div className="mb-3 flex items-center gap-2">
            <GitFork className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Your donation impact</span>
          </div>
          <p className="mb-4 text-xs text-muted-foreground">Your donation is automatically distributed to these recipients through cascade.</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between rounded-lg bg-secondary/40 px-3 py-2">
              <span className="text-sm text-foreground">@{donation.recipient_username}</span>
              <span className="font-mono text-sm font-medium text-foreground">
                {directAmount.toFixed(2)} {donation.asset} ({100 - totalCascadePercentage}%)
              </span>
            </div>
            {cascadeDependencies.map((dep) => {
              const cascadeAmount = donation.amount * (dep.percentage / 100)
              return (
                <div key={dep.id} className="flex items-center gap-2">
                  <ArrowDown className="h-3 w-3 shrink-0 text-primary/50" />
                  <div className="flex flex-1 items-center justify-between rounded-lg bg-secondary/20 px-3 py-2">
                    <a href={`/d/${dep.recipient_username}`} className="text-sm text-primary hover:underline">
                      @{dep.recipient_username}
                    </a>
                    <span className="font-mono text-sm text-muted-foreground">
                      {cascadeAmount.toFixed(2)} {donation.asset} ({dep.percentage}%)
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="mt-6 flex justify-center">
        <Button asChild>
          <a href={`/d/${donation.recipient_username}`}>View @{donation.recipient_username}'s profile</a>
        </Button>
      </div>
    </div>
  )
}
