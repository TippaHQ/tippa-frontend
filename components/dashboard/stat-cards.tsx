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
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg",
            accent || "bg-primary/10"
          )}
        >
          {icon}
        </div>
        <span
          className={cn(
            "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
            changeType === "positive" && "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]",
            changeType === "negative" && "bg-destructive/10 text-destructive",
            changeType === "neutral" && "bg-secondary text-muted-foreground"
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

export function StatCards() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Total Received"
        value="$12,845.60"
        change="+18.2%"
        changeType="positive"
        icon={<ArrowDownLeft className="h-5 w-5 text-primary" />}
      />
      <StatCard
        label="Total Forwarded"
        value="$3,412.90"
        change="+12.5%"
        changeType="positive"
        icon={<ArrowUpRight className="h-5 w-5 text-[hsl(var(--chart-2))]" />}
        accent="bg-[hsl(var(--chart-2))]/10"
      />
      <StatCard
        label="Impact Multiplier"
        value="3.76x"
        change="+0.4x"
        changeType="positive"
        icon={<Zap className="h-5 w-5 text-[hsl(var(--warning))]" />}
        accent="bg-[hsl(var(--warning))]/10"
      />
      <StatCard
        label="Active Cascades"
        value="5"
        change="3 recipients"
        changeType="neutral"
        icon={<TrendingUp className="h-5 w-5 text-primary" />}
      />
    </div>
  )
}
