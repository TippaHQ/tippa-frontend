"use client"

import { ExternalLink } from "lucide-react"

const deps = [
  { name: "react-core", address: "GDLX...2KMN", pct: 2, totalForwarded: "$256.40" },
  { name: "tailwind-css", address: "GFPX...7YHN", pct: 2, totalForwarded: "$256.40" },
  { name: "next-framework", address: "GHBX...3QRS", pct: 2, totalForwarded: "$256.40" },
]

export function ProfileDependencies() {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="text-sm font-semibold text-foreground">Public Dependencies</h3>
      <p className="mt-0.5 text-xs text-muted-foreground">
        Visible to anyone viewing your Tippa profile
      </p>

      <div className="mt-4 space-y-2">
        {deps.map((dep) => (
          <div
            key={dep.name}
            className="flex items-center gap-3 rounded-lg border border-border bg-secondary/20 p-3 transition-colors hover:border-primary/20"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 font-mono text-xs font-bold text-primary">
              {dep.pct}%
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium text-foreground">{dep.name}</p>
              <p className="truncate font-mono text-xs text-muted-foreground">{dep.address}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-medium text-foreground">{dep.totalForwarded}</p>
              <p className="text-[10px] text-muted-foreground">forwarded</p>
            </div>
            <button className="shrink-0 text-muted-foreground transition-colors hover:text-primary" aria-label={`View ${dep.name} on explorer`}>
              <ExternalLink className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
