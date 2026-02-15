"use client"

import { ArrowDownLeft, ArrowUpRight, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"

const transactions = [
  {
    id: "tx-001",
    type: "received" as const,
    from: "Bob",
    fromAddress: "GCXK...8FQN",
    amount: "+100.00 USDC",
    cascaded: "6.50 USDC to 3 deps",
    time: "2 min ago",
    status: "completed" as const,
  },
  {
    id: "tx-002",
    type: "forwarded" as const,
    from: "react-core",
    fromAddress: "GDLX...2KMN",
    amount: "-2.00 USDC",
    cascaded: "Via cascade from alice",
    time: "2 min ago",
    status: "completed" as const,
  },
  {
    id: "tx-003",
    type: "received" as const,
    from: "Charlie",
    fromAddress: "GBMX...9PLQ",
    amount: "+50.00 XLM",
    cascaded: "3.25 XLM to 3 deps",
    time: "1 hour ago",
    status: "completed" as const,
  },
  {
    id: "tx-004",
    type: "received" as const,
    from: "DonorDAO",
    fromAddress: "GAKX...4RWT",
    amount: "+500.00 USDC",
    cascaded: "32.50 USDC to 3 deps",
    time: "3 hours ago",
    status: "completed" as const,
  },
  {
    id: "tx-005",
    type: "forwarded" as const,
    from: "tailwind-css",
    fromAddress: "GFPX...7YHN",
    amount: "-10.00 USDC",
    cascaded: "Via cascade from alice",
    time: "3 hours ago",
    status: "completed" as const,
  },
]

export function RecentTransactions() {
  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border p-5">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Recent Transactions</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Latest payment activity on your account
          </p>
        </div>
        <button className="text-xs font-medium text-primary transition-colors hover:text-primary/80">
          View all
        </button>
      </div>
      <div className="divide-y divide-border">
        {transactions.map((tx) => (
          <div
            key={tx.id}
            className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-secondary/30"
          >
            {/* Icon */}
            <div
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                tx.type === "received" ? "bg-primary/10" : "bg-[hsl(var(--chart-2))]/10"
              )}
            >
              {tx.type === "received" ? (
                <ArrowDownLeft className="h-4 w-4 text-primary" />
              ) : (
                <ArrowUpRight className="h-4 w-4 text-[hsl(var(--chart-2))]" />
              )}
            </div>

            {/* Details */}
            <div className="flex-1 overflow-hidden">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">{tx.from}</span>
                <span className="font-mono text-xs text-muted-foreground">{tx.fromAddress}</span>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">{tx.cascaded}</p>
            </div>

            {/* Amount */}
            <div className="text-right">
              <p
                className={cn(
                  "text-sm font-semibold",
                  tx.type === "received" ? "text-[hsl(var(--success))]" : "text-foreground"
                )}
              >
                {tx.amount}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">{tx.time}</p>
            </div>

            {/* Explorer link */}
            <button
              className="shrink-0 text-muted-foreground transition-colors hover:text-primary"
              aria-label="View on Stellar Explorer"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
