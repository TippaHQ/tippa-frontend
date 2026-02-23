"use client"

import { ExternalLink } from "lucide-react"
import type { CascadeDependency } from "@/lib/types"

interface ProfileDependenciesProps {
  dependencies: CascadeDependency[]
}

export function ProfileDependencies({ dependencies }: ProfileDependenciesProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="text-sm font-semibold text-foreground">Cascade Recipients</h3>
      <p className="mt-0.5 text-xs text-muted-foreground">Visible to anyone viewing your Tippa profile</p>

      <div className="mt-4 space-y-2">
        {dependencies.length === 0 ? (
          <div className="py-6 text-center text-sm text-muted-foreground">No recipients configured yet.</div>
        ) : (
          dependencies.map((dep) => (
            <div
              key={dep.id}
              className="flex items-center gap-3 rounded-lg border border-border bg-secondary/20 p-3 transition-colors hover:border-primary/20"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 font-mono text-xs font-bold text-primary">
                {Number(dep.percentage)}%
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium text-foreground">{dep.label}</p>
                <p className="text-xs text-muted-foreground">@{dep.recipient_username}</p>
              </div>
              <a
                href={`/d/${dep.recipient_username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 text-muted-foreground transition-colors hover:text-primary"
                aria-label={`View ${dep.label} profile`}
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
