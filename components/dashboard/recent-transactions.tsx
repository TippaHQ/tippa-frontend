"use client"

import { ArrowDownLeft, ArrowUpRight, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import type { Transaction } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"

interface RecentTransactionsProps {
  transactions: Transaction[]
  currentUsername: string | null
}

export function RecentTransactions({ transactions, currentUsername }: RecentTransactionsProps) {
  const isEmpty = transactions.length === 0

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border p-5">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Recent Transactions</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">{isEmpty ? "No transactions yet" : "Latest payment activity on your account"}</p>
        </div>
        <Link href="/dashboard/transactions" className="text-xs font-medium text-primary transition-colors hover:text-primary/80">
          View all
        </Link>
      </div>
      <div className="divide-y divide-border">
        {isEmpty ? (
          <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
            Transactions will appear here once payments start flowing.
          </div>
        ) : (
          transactions.map((tx) => {
            const isIncoming = tx.to_username === currentUsername
            const counterparty = isIncoming ? (tx.from_username ?? tx.from_address) : tx.to_username
            const counterpartyAddress = isIncoming ? tx.from_address : tx.to_address
            const timeAgo = formatDistanceToNow(new Date(tx.created_at), { addSuffix: true })
            return (
              <div key={tx.id} className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-secondary/30">
                <div
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                    isIncoming ? "bg-primary/10" : "bg-[hsl(var(--chart-2))]/10",
                  )}
                >
                  {isIncoming ? <ArrowDownLeft className="h-4 w-4 text-primary" /> : <ArrowUpRight className="h-4 w-4 text-[hsl(var(--chart-2))]" />}
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{counterparty}</span>
                    <span className="font-mono text-xs text-muted-foreground">
                      {counterpartyAddress ? counterpartyAddress.slice(0, 4) + "..." + counterpartyAddress.slice(-4) : "N/A"}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground capitalize">{tx.type}</p>
                </div>
                <div className="text-right">
                  <p className={cn("text-sm font-semibold", isIncoming ? "text-[hsl(var(--success))]" : "text-foreground")}>
                    {isIncoming ? "+" : "-"}
                    {Math.abs(Number(tx.amount)).toFixed(2)} {tx.asset}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{timeAgo}</p>
                </div>
                {tx.stellar_tx_hash && (
                  <a
                    href={`https://stellar.expert/explorer/testnet/tx/${tx.stellar_tx_hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 text-muted-foreground transition-colors hover:text-primary"
                    aria-label="View on Stellar Explorer"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
