"use client"

import { Eye, Users, ArrowDownLeft } from "lucide-react"

const stats = [
  { label: "Profile Views", value: "1,284", icon: Eye, period: "Last 30 days" },
  { label: "Unique Supporters", value: "47", icon: Users, period: "All time" },
  { label: "Payments Received", value: "132", icon: ArrowDownLeft, period: "All time" },
]

export function ProfileStats() {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="text-sm font-semibold text-foreground">Profile Analytics</h3>
      <p className="mt-0.5 text-xs text-muted-foreground">
        How people interact with your Tippa page
      </p>

      <div className="mt-4 space-y-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-3 rounded-lg border border-border bg-secondary/20 p-3"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <stat.icon className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
            <span className="text-[10px] text-muted-foreground">{stat.period}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
