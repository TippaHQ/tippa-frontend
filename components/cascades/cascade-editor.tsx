"use client"

import { useState, useTransition } from "react"
import { Plus, Trash2, GripVertical, AlertCircle, Save, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { saveCascadeDependencies } from "@/lib/actions"
import { useRouter } from "next/navigation"
import type { CascadeDependency } from "@/lib/types"

interface LocalDep {
  id: string
  name: string
  address: string
  percentage: number
}

const COLORS = ["bg-primary", "bg-[hsl(var(--chart-2))]", "bg-[hsl(var(--warning))]", "bg-[hsl(var(--chart-4))]", "bg-[hsl(var(--chart-5))]"]

interface CascadeEditorProps {
  initialDeps: CascadeDependency[]
}

export function CascadeEditor({ initialDeps }: CascadeEditorProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const [deps, setDeps] = useState<LocalDep[]>(
    initialDeps.map((d) => ({
      id: d.id,
      name: d.label,
      address: d.stellar_address,
      percentage: Number(d.percentage),
    })),
  )

  const totalPct = deps.reduce((s, d) => s + d.percentage, 0)
  const platformFee = 0.5
  const remaining = 100 - totalPct - platformFee

  const addDependency = () => {
    if (deps.length >= 10) return
    setDeps([...deps, { id: crypto.randomUUID(), name: "", address: "", percentage: 1 }])
  }

  const removeDependency = (id: string) => {
    setDeps(deps.filter((d) => d.id !== id))
  }

  const updateDep = (id: string, field: keyof LocalDep, value: string | number) => {
    setDeps(deps.map((d) => (d.id === id ? { ...d, [field]: value } : d)))
  }

  const handleSave = () => {
    setSaveMessage(null)
    startTransition(async () => {
      const result = await saveCascadeDependencies(
        deps.map((d, i) => ({
          label: d.name,
          stellar_address: d.address,
          percentage: d.percentage,
          sort_order: i,
        })),
      )
      if (result.error) {
        setSaveMessage({ type: "error", text: result.error })
      } else {
        setSaveMessage({ type: "success", text: "Cascade saved successfully!" })
        router.refresh()
      }
    })
  }

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border p-5">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Recipients</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">Add up to 10 Stellar addresses to receive a share of incoming payments</p>
        </div>
        <span
          className={cn(
            "rounded-full px-2.5 py-1 text-xs font-medium",
            deps.length >= 10 ? "bg-destructive/10 text-destructive" : "bg-secondary text-muted-foreground",
          )}
        >
          {deps.length}/10 slots
        </span>
      </div>

      <div className="divide-y divide-border">
        {deps.map((dep, idx) => (
          <div key={dep.id} className="group px-5 py-4 transition-colors hover:bg-secondary/20">
            <div className="flex items-start gap-3">
              <div className="mt-2.5 shrink-0 cursor-grab text-muted-foreground/50">
                <GripVertical className="h-4 w-4" />
              </div>
              <div className={cn("mt-3 h-3 w-3 shrink-0 rounded-full", COLORS[idx % COLORS.length])} />
              <div className="flex-1 space-y-3">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div>
                    <Label className="mb-1.5 text-xs text-muted-foreground">Label</Label>
                    <Input
                      value={dep.name}
                      onChange={(e) => updateDep(dep.id, "name", e.target.value)}
                      placeholder="e.g. react-core"
                      className="h-9 border-border bg-secondary/50 text-sm text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-primary"
                    />
                  </div>
                  <div>
                    <Label className="mb-1.5 text-xs text-muted-foreground">Stellar Address</Label>
                    <Input
                      value={dep.address}
                      onChange={(e) => updateDep(dep.id, "address", e.target.value)}
                      placeholder="G..."
                      className="h-9 border-border bg-secondary/50 font-mono text-sm text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-primary"
                    />
                  </div>
                  <div>
                    <Label className="mb-1.5 text-xs text-muted-foreground">Split %</Label>
                    <div className="relative">
                      <Input
                        type="number"
                        min={0.1}
                        max={50}
                        step={0.1}
                        value={dep.percentage}
                        onChange={(e) => updateDep(dep.id, "percentage", parseFloat(e.target.value) || 0)}
                        className="h-9 border-border bg-secondary/50 pr-8 text-sm text-foreground focus-visible:ring-primary"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={() => removeDependency(dep.id)}
                className="mt-7 shrink-0 rounded-lg p-1.5 text-muted-foreground/50 transition-colors hover:bg-destructive/10 hover:text-destructive"
                aria-label={`Remove ${dep.name}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {deps.length < 10 && (
        <div className="border-t border-border px-5 py-3">
          <button
            onClick={addDependency}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border py-2.5 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
          >
            <Plus className="h-4 w-4" />
            Add Recipient
          </button>
        </div>
      )}

      <div className="border-t border-border bg-secondary/20 px-5 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div>
              <span className="text-xs text-muted-foreground">Total cascade</span>
              <p className={cn("text-sm font-semibold", totalPct > 50 ? "text-destructive" : "text-primary")}>{totalPct.toFixed(1)}%</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Platform fee</span>
              <p className="text-sm font-semibold text-muted-foreground">{platformFee}%</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">You receive</span>
              <p className="text-sm font-semibold text-foreground">{remaining.toFixed(1)}%</p>
            </div>
          </div>
          <Button onClick={handleSave} disabled={isPending || totalPct > 50} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Configuration
          </Button>
        </div>

        {saveMessage && (
          <div
            className={cn(
              "mt-3 flex items-center gap-2 rounded-lg px-3 py-2",
              saveMessage.type === "error" ? "bg-destructive/10 text-destructive" : "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]",
            )}
          >
            <span className="text-xs">{saveMessage.text}</span>
          </div>
        )}

        {totalPct > 50 && (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <span className="text-xs text-destructive">Total cascade percentage exceeds 50%. Please reduce allocations.</span>
          </div>
        )}

        <div className="mt-3 flex h-2 w-full overflow-hidden rounded-full bg-secondary">
          <div className="bg-foreground transition-all" style={{ width: `${remaining}%` }} />
          {deps.map((dep, idx) => (
            <div key={dep.id} className={cn(COLORS[idx % COLORS.length], "transition-all")} style={{ width: `${dep.percentage}%` }} />
          ))}
          <div className="bg-muted-foreground transition-all" style={{ width: `${platformFee}%` }} />
        </div>
      </div>
    </div>
  )
}
