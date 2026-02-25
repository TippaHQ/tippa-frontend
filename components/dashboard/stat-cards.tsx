"use client"

import { useState, useEffect } from "react"
import { ArrowDownLeft, ArrowUpRight, TrendingUp, Wallet } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface StatCardProps {
  label: string
  value: string
  change: string
  changeType: "positive" | "negative" | "neutral"
  icon: React.ReactNode
  accent?: string
}

function StatCard({ label, value, change, changeType, icon, accent }: StatCardProps) {
  return (
    <div className="group rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/30">
      <div className="flex items-start justify-between">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", accent || "bg-primary/10")}>{icon}</div>
        <span
          className={cn(
            "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
            changeType === "positive" && "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]",
            changeType === "negative" && "bg-destructive/10 text-destructive",
            changeType === "neutral" && "bg-secondary text-muted-foreground",
          )}
        >
          {changeType === "positive" && <TrendingUp className="h-3 w-3" />}
          {change}
        </span>
      </div>
      <p className="mt-4 text-2xl font-semibold tracking-tight text-foreground">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </div>
  )
}

interface AssetBalance {
  assetId: string
  symbol: string
  unclaimed: string
  totalReceived: string
  totalForwarded: string
}

interface StatCardsProps {
  activeCascades: number
  depCount: number
}

export function StatCards({ activeCascades, depCount }: StatCardsProps) {
  const [balances, setBalances] = useState<AssetBalance[]>([])
  const [unclaimedLoading, setUnclaimedLoading] = useState(true)

  useEffect(() => {
    async function fetchBalances() {
      try {
        const res = await fetch("/api/funds/balances")
        if (!res.ok) return
        const data = await res.json()
        setBalances(data.balances)
      } catch {
        // keep default
      } finally {
        setUnclaimedLoading(false)
      }
    }
    fetchBalances()
  }, [])

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {/* Total Received — on-chain data, per-asset rows */}
      <div className="group rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/30">
        <div className="flex items-start justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <ArrowDownLeft className="h-5 w-5 text-primary" />
          </div>
          <span className="flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground">
            On-chain
          </span>
        </div>
        <div className="mt-4 flex items-baseline gap-3">
          {unclaimedLoading ? (
            <span className="text-2xl font-semibold tracking-tight text-muted-foreground">--</span>
          ) : balances.length > 0 ? (
            balances.map((b) => (
              <div key={b.assetId} className="flex items-baseline gap-1">
                <span className="text-2xl font-semibold tracking-tight text-foreground">{b.totalReceived}</span>
                <span className="text-xs font-medium text-muted-foreground">{b.symbol}</span>
              </div>
            ))
          ) : (
            <p className="text-2xl font-semibold tracking-tight text-foreground">0.00</p>
          )}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">Total Received</p>
      </div>

      {/* Total Forwarded — on-chain data, per-asset rows */}
      <div className="group rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/30">
        <div className="flex items-start justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--chart-2))]/10">
            <ArrowUpRight className="h-5 w-5 text-[hsl(var(--chart-2))]" />
          </div>
          <span className="flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground">
            On-chain
          </span>
        </div>
        <div className="mt-4 flex items-baseline gap-3">
          {unclaimedLoading ? (
            <span className="text-2xl font-semibold tracking-tight text-muted-foreground">--</span>
          ) : balances.length > 0 ? (
            balances.map((b) => (
              <div key={b.assetId} className="flex items-baseline gap-1">
                <span className="text-2xl font-semibold tracking-tight text-foreground">{b.totalForwarded}</span>
                <span className="text-xs font-medium text-muted-foreground">{b.symbol}</span>
              </div>
            ))
          ) : (
            <p className="text-2xl font-semibold tracking-tight text-foreground">0.00</p>
          )}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">Total Forwarded</p>
      </div>

      {/* Unclaimed Balance — custom card with per-asset rows */}
      <Link href="/dashboard/funds">
        <div className="group rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/30 cursor-pointer">
          <div className="flex items-start justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--warning))]/10">
              <Wallet className="h-5 w-5 text-[hsl(var(--warning))]" />
            </div>
            <span className="flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground">
              View Funds
            </span>
          </div>
          <div className="mt-4 flex items-baseline gap-3">
            {unclaimedLoading ? (
              <span className="text-2xl font-semibold tracking-tight text-muted-foreground">--</span>
            ) : balances.length > 0 ? (
              balances.map((b) => (
                <div key={b.assetId} className="flex items-baseline gap-1">
                  <span className="text-2xl font-semibold tracking-tight text-foreground">{b.unclaimed}</span>
                  <span className="text-xs font-medium text-muted-foreground">{b.symbol}</span>
                </div>
              ))
            ) : (
              <p className="text-2xl font-semibold tracking-tight text-foreground">0.00</p>
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">Unclaimed Balance</p>
        </div>
      </Link>

      <StatCard
        label="Active Cascades"
        value={String(activeCascades)}
        change={`${depCount} recipient${depCount !== 1 ? "s" : ""}`}
        changeType="neutral"
        icon={<TrendingUp className="h-5 w-5 text-primary" />}
      />
    </div>
  )
}
