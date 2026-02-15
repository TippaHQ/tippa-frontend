"use client"

import { useState } from "react"
import {
  ArrowDownLeft,
  ArrowUpRight,
  ExternalLink,
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

type TxType = "received" | "forwarded"
type TxStatus = "completed" | "pending" | "failed"

interface Transaction {
  id: string
  type: TxType
  from: string
  fromAddress: string
  to: string
  toAddress: string
  amount: string
  asset: string
  cascaded: string
  time: string
  date: string
  status: TxStatus
  hash: string
}

const allTransactions: Transaction[] = [
  {
    id: "tx-001",
    type: "received",
    from: "Bob",
    fromAddress: "GCXK...8FQN",
    to: "alice",
    toAddress: "GBXK...7HQF",
    amount: "+100.00",
    asset: "USDC",
    cascaded: "6.50 USDC to 3 deps",
    time: "2 min ago",
    date: "Feb 15, 2026",
    status: "completed",
    hash: "abc123...def456",
  },
  {
    id: "tx-002",
    type: "forwarded",
    from: "alice",
    fromAddress: "GBXK...7HQF",
    to: "react-core",
    toAddress: "GDLX...2KMN",
    amount: "-2.00",
    asset: "USDC",
    cascaded: "Auto-cascaded",
    time: "2 min ago",
    date: "Feb 15, 2026",
    status: "completed",
    hash: "abc123...ghi789",
  },
  {
    id: "tx-003",
    type: "forwarded",
    from: "alice",
    fromAddress: "GBXK...7HQF",
    to: "tailwind-css",
    toAddress: "GFPX...7YHN",
    amount: "-2.00",
    asset: "USDC",
    cascaded: "Auto-cascaded",
    time: "2 min ago",
    date: "Feb 15, 2026",
    status: "completed",
    hash: "abc123...jkl012",
  },
  {
    id: "tx-004",
    type: "forwarded",
    from: "alice",
    fromAddress: "GBXK...7HQF",
    to: "next-framework",
    toAddress: "GHBX...3QRS",
    amount: "-2.00",
    asset: "USDC",
    cascaded: "Auto-cascaded",
    time: "2 min ago",
    date: "Feb 15, 2026",
    status: "completed",
    hash: "abc123...mno345",
  },
  {
    id: "tx-005",
    type: "received",
    from: "Charlie",
    fromAddress: "GBMX...9PLQ",
    to: "alice",
    toAddress: "GBXK...7HQF",
    amount: "+50.00",
    asset: "XLM",
    cascaded: "3.25 XLM to 3 deps",
    time: "1 hour ago",
    date: "Feb 15, 2026",
    status: "completed",
    hash: "pqr678...stu901",
  },
  {
    id: "tx-006",
    type: "received",
    from: "DonorDAO",
    fromAddress: "GAKX...4RWT",
    to: "alice",
    toAddress: "GBXK...7HQF",
    amount: "+500.00",
    asset: "USDC",
    cascaded: "32.50 USDC to 3 deps",
    time: "3 hours ago",
    date: "Feb 15, 2026",
    status: "completed",
    hash: "vwx234...yza567",
  },
  {
    id: "tx-007",
    type: "received",
    from: "Eve",
    fromAddress: "GKLX...1PQR",
    to: "alice",
    toAddress: "GBXK...7HQF",
    amount: "+25.00",
    asset: "USDC",
    cascaded: "1.63 USDC to 3 deps",
    time: "5 hours ago",
    date: "Feb 14, 2026",
    status: "completed",
    hash: "bcd890...efg123",
  },
  {
    id: "tx-008",
    type: "received",
    from: "Frank",
    fromAddress: "GMNX...2STU",
    to: "alice",
    toAddress: "GBXK...7HQF",
    amount: "+10.00",
    asset: "XLM",
    cascaded: "Below threshold",
    time: "1 day ago",
    date: "Feb 14, 2026",
    status: "completed",
    hash: "hij456...klm789",
  },
  {
    id: "tx-009",
    type: "received",
    from: "GreenFund",
    fromAddress: "GOPX...3VWX",
    to: "alice",
    toAddress: "GBXK...7HQF",
    amount: "+200.00",
    asset: "USDC",
    cascaded: "13.00 USDC to 3 deps",
    time: "2 days ago",
    date: "Feb 13, 2026",
    status: "pending",
    hash: "nop012...qrs345",
  },
]

export default function TransactionsPage() {
  const [filter, setFilter] = useState<"all" | TxType>("all")
  const [searchQuery, setSearchQuery] = useState("")

  const filtered = allTransactions.filter((tx) => {
    if (filter !== "all" && tx.type !== filter) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return (
        tx.from.toLowerCase().includes(q) ||
        tx.to.toLowerCase().includes(q) ||
        tx.fromAddress.toLowerCase().includes(q) ||
        tx.hash.toLowerCase().includes(q)
      )
    }
    return true
  })

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Transactions
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Full history of all payments and cascade activity
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-2 border-border text-foreground hover:bg-secondary">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
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
                  filter === f
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
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

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Type
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  From / To
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Amount
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Cascade
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Status
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Time
                </th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Explorer
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((tx) => (
                <tr
                  key={tx.id}
                  className="transition-colors hover:bg-secondary/20"
                >
                  <td className="px-5 py-3.5">
                    <div
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-lg",
                        tx.type === "received"
                          ? "bg-primary/10"
                          : "bg-[hsl(var(--chart-2))]/10"
                      )}
                    >
                      {tx.type === "received" ? (
                        <ArrowDownLeft className="h-4 w-4 text-primary" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4 text-[hsl(var(--chart-2))]" />
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="text-sm font-medium text-foreground">
                      {tx.type === "received" ? tx.from : tx.to}
                    </p>
                    <p className="font-mono text-xs text-muted-foreground">
                      {tx.type === "received" ? tx.fromAddress : tx.toAddress}
                    </p>
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={cn(
                        "font-mono text-sm font-semibold",
                        tx.type === "received"
                          ? "text-[hsl(var(--success))]"
                          : "text-foreground"
                      )}
                    >
                      {tx.amount}
                    </span>
                    <span className="ml-1.5 text-xs text-muted-foreground">{tx.asset}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs text-muted-foreground">{tx.cascaded}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                        tx.status === "completed" &&
                          "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]",
                        tx.status === "pending" &&
                          "bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]",
                        tx.status === "failed" && "bg-destructive/10 text-destructive"
                      )}
                    >
                      <span
                        className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          tx.status === "completed" && "bg-[hsl(var(--success))]",
                          tx.status === "pending" && "bg-[hsl(var(--warning))]",
                          tx.status === "failed" && "bg-destructive"
                        )}
                      />
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="text-xs text-foreground">{tx.time}</p>
                    <p className="text-[10px] text-muted-foreground">{tx.date}</p>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      className="text-muted-foreground transition-colors hover:text-primary"
                      aria-label="View transaction on Stellar Explorer"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-border px-5 py-3">
          <p className="text-xs text-muted-foreground">
            Showing <span className="font-medium text-foreground">{filtered.length}</span> of{" "}
            <span className="font-medium text-foreground">{allTransactions.length}</span>{" "}
            transactions
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              disabled
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous page</span>
            </Button>
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-xs font-medium text-primary-foreground">
              1
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-md text-xs text-muted-foreground hover:bg-secondary">
              2
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next page</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
