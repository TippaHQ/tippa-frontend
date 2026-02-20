"use client"

import { useState } from "react"
import { ArrowDownLeft, ArrowUpRight, ExternalLink, Search, Filter, Download, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import type { Transaction, TransactionType } from "@/lib/types"

interface TransactionsClientProps {
  initialTransactions: Transaction[]
  initialCount: number
}

export function TransactionsClient({ initialTransactions, initialCount }: TransactionsClientProps) {
  const [filter, setFilter] = useState<"all" | TransactionType>("all")
  const [searchQuery, setSearchQuery] = useState("")

  const filtered = initialTransactions.filter((tx) => {
    if (filter !== "all" && tx.type !== filter) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return (
        tx.from_name.toLowerCase().includes(q) ||
        tx.to_name.toLowerCase().includes(q) ||
        tx.from_address.toLowerCase().includes(q) ||
        (tx.stellar_tx_hash ?? "").toLowerCase().includes(q)
      )
    }
    return true
  })

  const isEmpty = filtered.length === 0

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Transactions</h1>
          <p className="mt-1 text-sm text-muted-foreground">Full history of all payments and cascade activity</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2 border-border text-foreground hover:bg-secondary">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, address, or hash..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 border-border bg-secondary/50 pl-9 text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg border border-border bg-secondary/30 p-0.5">
            {(["all", "received", "forwarded"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors",
                  filter === f ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {f}
              </button>
            ))}
          </div>
          <Select defaultValue="all-time">
            <SelectTrigger className="h-9 w-32 border-border bg-secondary/50 text-sm text-foreground">
              <Filter className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-border bg-popover">
              <SelectItem value="all-time">All time</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {isEmpty ? (
          <div className="flex items-center justify-center py-20 text-sm text-muted-foreground">
            {searchQuery || filter !== "all"
              ? "No transactions match your filters."
              : "No transactions yet. Payments will appear here once they start flowing."}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-secondary/30">
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Type</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">From / To</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Amount</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Cascade</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Time</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Explorer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((tx) => {
                    const isReceived = tx.type === "received"
                    const timeAgo = formatDistanceToNow(new Date(tx.created_at), { addSuffix: true })
                    const dateStr = new Date(tx.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                    return (
                      <tr key={tx.id} className="transition-colors hover:bg-secondary/20">
                        <td className="px-5 py-3.5">
                          <div
                            className={cn(
                              "flex h-8 w-8 items-center justify-center rounded-lg",
                              isReceived ? "bg-primary/10" : "bg-[hsl(var(--chart-2))]/10",
                            )}
                          >
                            {isReceived ? (
                              <ArrowDownLeft className="h-4 w-4 text-primary" />
                            ) : (
                              <ArrowUpRight className="h-4 w-4 text-[hsl(var(--chart-2))]" />
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <p className="text-sm font-medium text-foreground">{isReceived ? tx.from_name : tx.to_name}</p>
                          <p className="font-mono text-xs text-muted-foreground">
                            {isReceived
                              ? tx.from_address.slice(0, 4) + "..." + tx.from_address.slice(-4)
                              : tx.to_address.slice(0, 4) + "..." + tx.to_address.slice(-4)}
                          </p>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={cn("font-mono text-sm font-semibold", isReceived ? "text-[hsl(var(--success))]" : "text-foreground")}>
                            {isReceived ? "+" : "-"}
                            {Math.abs(Number(tx.amount)).toFixed(2)}
                          </span>
                          <span className="ml-1.5 text-xs text-muted-foreground">{tx.asset}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-xs text-muted-foreground">{tx.cascade_info ?? "Direct"}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                              tx.status === "completed" && "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]",
                              tx.status === "pending" && "bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]",
                              tx.status === "failed" && "bg-destructive/10 text-destructive",
                            )}
                          >
                            <span
                              className={cn(
                                "h-1.5 w-1.5 rounded-full",
                                tx.status === "completed" && "bg-[hsl(var(--success))]",
                                tx.status === "pending" && "bg-[hsl(var(--warning))]",
                                tx.status === "failed" && "bg-destructive",
                              )}
                            />
                            {tx.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <p className="text-xs text-foreground">{timeAgo}</p>
                          <p className="text-[10px] text-muted-foreground">{dateStr}</p>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          {tx.stellar_tx_hash ? (
                            <a
                              href={`https://stellar.expert/explorer/public/tx/${tx.stellar_tx_hash}`}
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
                <span className="font-medium text-foreground">{initialCount}</span> transactions
              </p>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" disabled>
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sr-only">Previous page</span>
                </Button>
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-xs font-medium text-primary-foreground">1</span>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" disabled={initialCount <= 20}>
                  <ChevronRight className="h-4 w-4" />
                  <span className="sr-only">Next page</span>
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
