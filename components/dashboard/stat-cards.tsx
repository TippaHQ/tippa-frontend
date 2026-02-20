"use client"

import { ArrowDownLeft, ArrowUpRight, TrendingUp, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

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

interface StatCardsProps {
  totalReceived: number
  totalForwarded: number
  activeCascades: number
  depCount: number
}

export function StatCards({ totalReceived, totalForwarded, activeCascades, depCount }: StatCardsProps) {
  const multiplier = totalForwarded > 0 && totalReceived > 0 ? (totalReceived / totalForwarded).toFixed(2) : "0.00"

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Total Received"
        value={`$${totalReceived.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        change={totalReceived > 0 ? "Live" : "No data yet"}
        changeType={totalReceived > 0 ? "positive" : "neutral"}
        icon={<ArrowDownLeft className="h-5 w-5 text-primary" />}
      />
      <StatCard
        label="Total Forwarded"
        value={`$${totalForwarded.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        change={totalForwarded > 0 ? "Live" : "No data yet"}
        changeType={totalForwarded > 0 ? "positive" : "neutral"}
        icon={<ArrowUpRight className="h-5 w-5 text-[hsl(var(--chart-2))]" />}
        accent="bg-[hsl(var(--chart-2))]/10"
      />
      <StatCard
        label="Impact Multiplier"
        value={`${multiplier}x`}
        change={Number(multiplier) > 1 ? "Active" : "N/A"}
        changeType={Number(multiplier) > 1 ? "positive" : "neutral"}
        icon={<Zap className="h-5 w-5 text-[hsl(var(--warning))]" />}
        accent="bg-[hsl(var(--warning))]/10"
      />
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
