"use client"

import { Shield, Zap, Ban } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { updateCascadeRules } from "@/lib/actions"
import { useRouter } from "next/navigation"
import type { CascadeRules as CascadeRulesType } from "@/lib/types"

interface CascadeRulesProps {
  rules: CascadeRulesType | null
}

export function CascadeRules({ rules }: CascadeRulesProps) {
  const router = useRouter()

  const handleToggle = async (field: string, checked: boolean) => {
    await updateCascadeRules({ [field]: checked })
    router.refresh()
  }

  const handleMinAmount = async (value: string) => {
    const num = parseFloat(value)
    if (!isNaN(num)) {
      await updateCascadeRules({ min_hop_amount: num })
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="text-sm font-semibold text-foreground">Cascade Rules</h3>
      <p className="mt-0.5 text-xs text-muted-foreground">
        Fine-tune how payments are processed
      </p>

      <div className="mt-4 space-y-4">
        <div className="flex items-start gap-3 rounded-lg border border-border bg-secondary/20 p-3">
          <Shield className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-foreground">Atomic Execution</Label>
              <Switch
                defaultChecked={rules?.atomic_execution ?? true}
                onCheckedChange={(checked) => handleToggle("atomic_execution", checked)}
                className="data-[state=checked]:bg-primary"
              />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              All-or-nothing: everyone gets paid or no one does. Uses Stellar multi-op transactions.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-lg border border-border bg-secondary/20 p-3">
          <Ban className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--warning))]" />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-foreground">Minimum Hop Threshold</Label>
              <Switch
                defaultChecked={rules?.min_hop_enabled ?? true}
                onCheckedChange={(checked) => handleToggle("min_hop_enabled", checked)}
                className="data-[state=checked]:bg-primary"
              />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Skip forwarding when the cascaded amount is too small to be meaningful.
            </p>
            <div className="mt-2">
              <Label className="mb-1 text-xs text-muted-foreground">Min amount</Label>
              <Input
                defaultValue={rules?.min_hop_amount?.toString() ?? "0.10"}
                onBlur={(e) => handleMinAmount(e.target.value)}
                className="h-8 w-28 border-border bg-secondary/50 text-sm text-foreground focus-visible:ring-primary"
              />
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-lg border border-border bg-secondary/20 p-3">
          <Zap className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-foreground">Auto-Cascade</Label>
              <Switch
                defaultChecked={rules?.auto_cascade ?? true}
                onCheckedChange={(checked) => handleToggle("auto_cascade", checked)}
                className="data-[state=checked]:bg-primary"
              />
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
