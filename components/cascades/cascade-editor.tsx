"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Plus, Trash2, GripVertical, AlertCircle, Save, Loader2, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { saveCascadeDependencies, checkUsernameExists } from "@/lib/actions"
import { useRouter } from "next/navigation"
import { useWallet } from "@/providers/wallet-provider"
import type { CascadeDependency } from "@/lib/types"

interface LocalDep {
  id: string
  name: string
  username: string
  percentage: number
  usernameValid?: boolean | null // null = not checked, true = valid, false = invalid
}

const COLORS = ["bg-primary", "bg-[hsl(var(--chart-2))]", "bg-[hsl(var(--warning))]", "bg-[hsl(var(--chart-4))]", "bg-[hsl(var(--chart-5))]"]

type SaveState = "idle" | "saving" | "signing" | "publishing" | "success" | "error"

interface CascadeEditorProps {
  initialDeps: CascadeDependency[]
  ownerUsername: string | null
  ownerWalletAddress: string | null
}

export function CascadeEditor({ initialDeps, ownerUsername, ownerWalletAddress }: CascadeEditorProps) {
  const router = useRouter()
  const { signTransaction } = useWallet()
  const [saveState, setSaveState] = useState<SaveState>("idle")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [deps, setDeps] = useState<LocalDep[]>(
    initialDeps.map((d) => ({
      id: d.id,
      name: d.label,
      username: d.recipient_username,
      percentage: Number(d.percentage),
      usernameValid: true, // existing deps are assumed valid
    })),
  )

  const totalPct = deps.reduce((s, d) => s + d.percentage, 0)
  const platformFee = 0.5
  const remaining = 100 - totalPct - platformFee

  const addDependency = () => {
    if (deps.length >= 10) return
    setDeps([...deps, { id: crypto.randomUUID(), name: "", username: "", percentage: 1, usernameValid: null }])
  }

  const removeDependency = (id: string) => {
    setDeps(deps.filter((d) => d.id !== id))
  }

  const updateDep = (id: string, field: keyof LocalDep, value: string | number) => {
    setDeps(deps.map((d) => (d.id === id ? { ...d, [field]: value } : d)))
  }

  // Debounced username validation
  const validationTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  const validateUsername = useCallback((depId: string, username: string) => {
    // Clear previous timer for this dep
    if (validationTimers.current[depId]) {
      clearTimeout(validationTimers.current[depId])
    }

    if (!username.trim()) {
      setDeps((prev) => prev.map((d) => (d.id === depId ? { ...d, usernameValid: null } : d)))
      return
    }

    // Set loading state
    setDeps((prev) => prev.map((d) => (d.id === depId ? { ...d, usernameValid: null } : d)))

    validationTimers.current[depId] = setTimeout(async () => {
      const exists = await checkUsernameExists(username.trim())
      setDeps((prev) => prev.map((d) => (d.id === depId ? { ...d, usernameValid: exists } : d)))
    }, 300)
  }, [])

  const handleUsernameChange = (depId: string, value: string) => {
    updateDep(depId, "username", value)
    validateUsername(depId, value)
  }

  const handleSave = async () => {
    setErrorMessage(null)

    // Validate all usernames are filled
    const emptyUsernames = deps.filter((d) => !d.username.trim())
    if (emptyUsernames.length > 0) {
      setErrorMessage("All recipients must have a Tippa username.")
      return
    }

    // Validate all usernames are confirmed valid
    const invalidUsernames = deps.filter((d) => d.usernameValid === false)
    if (invalidUsernames.length > 0) {
      setErrorMessage(`Username "${invalidUsernames[0].username}" is not registered on Tippa.`)
      return
    }

    if (!ownerUsername || !ownerWalletAddress) {
      setErrorMessage("You must register a username and wallet before publishing cascade rules.")
      return
    }

    try {
      // Check if on-chain-relevant fields changed (usernames or percentages)
      const currentRules = deps
        .map((d) => `${d.username}:${d.percentage}`)
        .sort()
        .join(",")
      const initialRules = initialDeps
        .map((d) => `${d.recipient_username}:${Number(d.percentage)}`)
        .sort()
        .join(",")
      const rulesChanged = currentRules !== initialRules

      if (rulesChanged) {
        // Step 1: Build on-chain transaction
        setSaveState("signing")
        const rules: Record<string, number> = {}
        for (const dep of deps) {
          rules[dep.username] = dep.percentage
        }

        const buildRes = await fetch("/api/cascades/set-rules/build", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            callerAddress: ownerWalletAddress,
            username: ownerUsername,
            rules,
          }),
        })

        const buildData = await buildRes.json()
        if (!buildRes.ok) {
          setSaveState("error")
          setErrorMessage(buildData.error || "Failed to build transaction.")
          return
        }

        // Step 2: Sign with wallet
        let signedXdr: string
        try {
          signedXdr = await signTransaction(buildData.xdr, ownerWalletAddress!)
        } catch {
          setSaveState("error")
          setErrorMessage("Transaction cancelled.")
          return
        }

        // Step 3: Submit on-chain
        setSaveState("publishing")
        const submitRes = await fetch("/api/cascades/set-rules/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ signedXdr }),
        })

        const submitData = await submitRes.json()
        if (!submitRes.ok) {
          setSaveState("error")
          setErrorMessage(submitData.error || "Failed to submit transaction.")
          return
        }
      }

      // Save to Supabase (always — labels may have changed)
      setSaveState("saving")
      const result = await saveCascadeDependencies(
        deps.map((d, i) => ({
          label: d.name,
          recipient_username: d.username,
          percentage: d.percentage,
          sort_order: i,
        })),
      )

      if (result.error) {
        setSaveState("error")
        setErrorMessage("Published on-chain but failed to save locally: " + result.error)
        return
      }

      // Success
      setSaveState("success")
      router.refresh()
      setTimeout(() => setSaveState("idle"), 3000)
    } catch (err) {
      setSaveState("error")
      setErrorMessage("An unexpected error occurred.")
      console.error("Save cascade error:", err)
    }
  }

  const isBusy = saveState === "saving" || saveState === "signing" || saveState === "publishing"

  const saveButtonContent = () => {
    switch (saveState) {
      case "saving":
        return (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Saving...
          </>
        )
      case "signing":
        return (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Sign in your wallet...
          </>
        )
      case "publishing":
        return (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Publishing...
          </>
        )
      case "success":
        return (
          <>
            <Check className="h-4 w-4" />
            Published!
          </>
        )
      default:
        return (
          <>
            <Save className="h-4 w-4" />
            Save Configuration
          </>
        )
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border p-5">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Recipients</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">Add up to 10 Tippa usernames to receive a share of incoming payments</p>
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
                    <Label className="mb-1.5 text-xs text-muted-foreground">Tippa Username</Label>
                    <div className="relative">
                      <Input
                        value={dep.username}
                        onChange={(e) => handleUsernameChange(dep.id, e.target.value)}
                        placeholder="username"
                        className="h-9 border-border bg-secondary/50 pr-8 text-sm text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-primary"
                      />
                      {dep.username.trim() && dep.usernameValid === true && (
                        <Check className="absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--success))]" />
                      )}
                      {dep.username.trim() && dep.usernameValid === false && (
                        <X className="absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-destructive" />
                      )}
                    </div>
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
          <Button
            onClick={handleSave}
            disabled={isBusy || totalPct > 50 || saveState === "success"}
            className={cn(
              "gap-2",
              saveState === "success"
                ? "bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))] hover:bg-[hsl(var(--success))]"
                : "bg-primary text-primary-foreground hover:bg-primary/90",
            )}
          >
            {saveButtonContent()}
          </Button>
        </div>

        {errorMessage && (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
            <span className="text-xs text-destructive">{errorMessage}</span>
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
