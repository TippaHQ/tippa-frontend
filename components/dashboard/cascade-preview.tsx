"use client"

import { GitFork } from "lucide-react"
import Link from "next/link"
import type { CascadeDependency } from "@/lib/types"

const COLORS = ["bg-primary", "bg-[hsl(var(--chart-2))]", "bg-[hsl(var(--warning))]", "bg-[hsl(var(--chart-4))]", "bg-[hsl(var(--chart-5))]"]

interface CascadePreviewProps {
  dependencies: CascadeDependency[]
  username: string
}

export function CascadePreview({ dependencies, username }: CascadePreviewProps) {
  const totalPct = dependencies.reduce((s, d) => s + Number(d.percentage), 0)
  const platformFee = 0.5
  const isEmpty = dependencies.length === 0

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Active Cascade</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">{isEmpty ? "No cascade configured yet" : "How incoming payments are distributed"}</p>
        </div>
        <Link href="/dashboard/cascades" className="text-xs font-medium text-primary transition-colors hover:text-primary/80">
          Edit
        </Link>
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
          <GitFork className="h-8 w-8 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">Add recipients to start cascading payments.</p>
          <Link href="/dashboard/cascades" className="text-xs font-medium text-primary hover:text-primary/80">
            Configure now
          </Link>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2 rounded-lg border border-dashed border-primary/30 bg-primary/5 px-4 py-2.5">
            <span className="text-xs text-muted-foreground">Incoming payment</span>
            <span className="font-mono text-sm font-semibold text-primary">100 USDC</span>
          </div>
          <div className="my-2 h-6 w-px bg-border" />
          <GitFork className="h-5 w-5 rotate-180 text-primary" />
          <div className="my-2 h-4 w-px bg-border" />

          <div className="w-full space-y-2">
            <div className="flex items-center gap-3 rounded-lg border border-border bg-secondary/30 px-4 py-3">
              <div className="h-2.5 w-2.5 rounded-full bg-foreground" />
              <div className="flex-1">
                <span className="text-sm font-medium text-foreground">You ({username})</span>
              </div>
              <span className="font-mono text-sm font-semibold text-foreground">{(100 - totalPct - platformFee).toFixed(1)}%</span>
            </div>

            {dependencies.map((dep, idx) => (
              <div key={dep.id} className="flex items-center gap-3 rounded-lg border border-border bg-secondary/30 px-4 py-3">
                <div className={`h-2.5 w-2.5 rounded-full ${COLORS[idx % COLORS.length]}`} />
                <div className="flex-1 overflow-hidden">
                  <span className="text-sm font-medium text-foreground">{dep.label}</span>
                  <span className="ml-2 font-mono text-xs text-muted-foreground">
                    {dep.stellar_address.slice(0, 4)}...{dep.stellar_address.slice(-4)}
                  </span>
                </div>
                <span className="font-mono text-sm font-semibold text-primary">{Number(dep.percentage)}%</span>
              </div>
            ))}

            <div className="flex items-center gap-3 rounded-lg border border-dashed border-border px-4 py-3">
              <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground" />
              <div className="flex-1">
                <span className="text-sm text-muted-foreground">Tippa Platform Fee</span>
              </div>
              <span className="font-mono text-sm text-muted-foreground">{platformFee}%</span>
            </div>
          </div>

          <div className="mt-4 w-full">
            <div className="flex h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div className="bg-foreground" style={{ width: `${100 - totalPct - platformFee}%` }} />
              {dependencies.map((dep, idx) => (
                <div key={dep.id} className={COLORS[idx % COLORS.length]} style={{ width: `${Number(dep.percentage)}%` }} />
              ))}
              <div className="bg-muted-foreground" style={{ width: `${platformFee}%` }} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
