"use client"

import { Shield, Zap, Ban } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

export function CascadeRules() {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="text-sm font-semibold text-foreground">Cascade Rules</h3>
      <p className="mt-0.5 text-xs text-muted-foreground">
        Fine-tune how payments are processed
      </p>

      <div className="mt-4 space-y-4">
        {/* Atomic execution */}
        <div className="flex items-start gap-3 rounded-lg border border-border bg-secondary/20 p-3">
          <Shield className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-foreground">
                Atomic Execution
              </Label>
              <Switch defaultChecked className="data-[state=checked]:bg-primary" />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              All-or-nothing: everyone gets paid or no one does. Uses Stellar multi-op
              transactions.
            </p>
          </div>
        </div>

        {/* Minimum threshold */}
        <div className="flex items-start gap-3 rounded-lg border border-border bg-secondary/20 p-3">
          <Ban className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--warning))]" />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-foreground">
                Minimum Hop Threshold
              </Label>
              <Switch defaultChecked className="data-[state=checked]:bg-primary" />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Skip forwarding when the cascaded amount is too small to be meaningful.
            </p>
            <div className="mt-2">
              <Label className="mb-1 text-xs text-muted-foreground">Min amount</Label>
              <Input
                defaultValue="0.10"
                className="h-8 w-28 border-border bg-secondary/50 text-sm text-foreground focus-visible:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* Auto-cascade */}
        <div className="flex items-start gap-3 rounded-lg border border-border bg-secondary/20 p-3">
          <Zap className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-foreground">
                Auto-Cascade
              </Label>
              <Switch defaultChecked className="data-[state=checked]:bg-primary" />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Automatically cascade incoming payments without manual approval.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
