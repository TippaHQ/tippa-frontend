"use client"

import { useState } from "react"
import { ArrowUpRight, ExternalLink, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import type { Donation } from "@/lib/actions"

interface DonationsClientProps {
  initialDonations: Donation[]
  initialCount: number
}

export function DonationsClient({ initialDonations, initialCount }: DonationsClientProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const filtered = initialDonations.filter((donation) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return (
        donation.recipient_username.toLowerCase().includes(q) ||
        (donation.donor_username ?? "").toLowerCase().includes(q) ||
        donation.donor_wallet_address.toLowerCase().includes(q)
      )
    }
    return true
  })

  const isEmpty = filtered.length === 0

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Donations</h1>
          <p className="mt-1 text-sm text-muted-foreground">Your donation history and impact records</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by recipient..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 border-border bg-secondary/50 pl-9 text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {isEmpty ? (
          <div className="flex items-center justify-center py-20 text-sm text-muted-foreground">
            {searchQuery ? "No donations match your search." : "No donations yet. Your donations will appear here."}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-secondary/30">
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Recipient</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Amount</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Donation ID</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Explorer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((donation) => {
                    const timeAgo = formatDistanceToNow(new Date(donation.created_at), { addSuffix: true })
                    const dateStr = new Date(donation.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                    return (
                      <tr key={donation.id} className="transition-colors hover:bg-secondary/20">
                        <td className="px-5 py-3.5">
                          <p className="text-xs text-foreground">{timeAgo}</p>
                          <p className="text-[10px] text-muted-foreground">{dateStr}</p>
                        </td>
                        <td className="px-5 py-3.5">
                          <Link href={`/d/${donation.recipient_username}`} className="text-sm font-medium text-primary hover:underline">
                            @{donation.recipient_username}
                          </Link>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="font-mono text-sm font-semibold text-foreground">-{Number(donation.amount).toFixed(2)}</span>
                          <span className="ml-1.5 text-xs text-muted-foreground">{donation.asset}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <Link href={`/donation/${donation.id}`} className="font-mono text-xs text-muted-foreground hover:text-primary">
                            {donation.id.slice(0, 8)}...
                          </Link>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          {donation.stellar_tx_hash ? (
                            <a
                              href={`https://stellar.expert/explorer/testnet/tx/${donation.stellar_tx_hash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-muted-foreground transition-colors hover:text-primary"
                              aria-label="View transaction on Stellar Explorer"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          ) : (
                            <span className="text-muted-foreground/30">
                              <ExternalLink className="h-3.5 w-3.5" />
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between border-t border-border px-5 py-3">
              <p className="text-xs text-muted-foreground">
                Showing <span className="font-medium text-foreground">{filtered.length}</span> of{" "}
                <span className="font-medium text-foreground">{initialCount}</span> donations
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
