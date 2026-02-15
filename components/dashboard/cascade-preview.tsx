"use client"

import { GitFork } from "lucide-react"

const dependencies = [
  { name: "react-core", address: "GDLX...2KMN", pct: 2, color: "bg-primary" },
  { name: "tailwind-css", address: "GFPX...7YHN", pct: 2, color: "bg-[hsl(var(--chart-2))]" },
  { name: "next-framework", address: "GHBX...3QRS", pct: 2, color: "bg-[hsl(var(--warning))]" },
]

export function CascadePreview() {
  const totalPct = dependencies.reduce((s, d) => s + d.pct, 0)
  const platformFee = 0.5

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Active Cascade</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            How incoming payments are distributed
          </p>
        </div>
        <button className="text-xs font-medium text-primary transition-colors hover:text-primary/80">
          Edit
        </button>
      </div>

      {/* Visual flow */}
      <div className="flex flex-col items-center">
        {/* Incoming */}
        <div className="flex items-center gap-2 rounded-lg border border-dashed border-primary/30 bg-primary/5 px-4 py-2.5">
          <span className="text-xs text-muted-foreground">Incoming payment</span>
          <span className="font-mono text-sm font-semibold text-primary">100 USDC</span>
        </div>

        {/* Connector */}
        <div className="my-2 h-6 w-px bg-border" />
        <GitFork className="h-5 w-5 rotate-180 text-primary" />
        <div className="my-2 h-4 w-px bg-border" />

        {/* Split visualization */}
        <div className="w-full space-y-2">
          {/* You receive */}
          <div className="flex items-center gap-3 rounded-lg border border-border bg-secondary/30 px-4 py-3">
            <div className="h-2.5 w-2.5 rounded-full bg-foreground" />
            <div className="flex-1">
              <span className="text-sm font-medium text-foreground">You (alice)</span>
            </div>
            <span className="font-mono text-sm font-semibold text-foreground">
              {(100 - totalPct - platformFee).toFixed(1)}%
            </span>
          </div>

          {/* Dependencies */}
          {dependencies.map((dep) => (
            <div
              key={dep.name}
              className="flex items-center gap-3 rounded-lg border border-border bg-secondary/30 px-4 py-3"
            >
              <div className={`h-2.5 w-2.5 rounded-full ${dep.color}`} />
              <div className="flex-1 overflow-hidden">
                <span className="text-sm font-medium text-foreground">{dep.name}</span>
                <span className="ml-2 font-mono text-xs text-muted-foreground">
                  {dep.address}
                </span>
              </div>
              <span className="font-mono text-sm font-semibold text-primary">{dep.pct}%</span>
            </div>
          ))}

          {/* Platform fee */}
          <div className="flex items-center gap-3 rounded-lg border border-dashed border-border px-4 py-3">
            <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground" />
            <div className="flex-1">
              <span className="text-sm text-muted-foreground">Tippa Platform Fee</span>
            </div>
            <span className="font-mono text-sm text-muted-foreground">{platformFee}%</span>
          </div>
        </div>

        {/* Total bar */}
        <div className="mt-4 w-full">
          <div className="flex h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="bg-foreground"
              style={{ width: `${100 - totalPct - platformFee}%` }}
            />
            {dependencies.map((dep) => (
              <div
                key={dep.name}
                className={dep.color}
                style={{ width: `${dep.pct}%` }}
              />
            ))}
            <div className="bg-muted-foreground" style={{ width: `${platformFee}%` }} />
          </div>
        </div>
      </div>
    </div>
  )
}
