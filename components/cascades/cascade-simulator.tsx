"use client"

import { useState } from "react"
import { Play, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function CascadeSimulator() {
  const [amount, setAmount] = useState("100")
  const [asset, setAsset] = useState("USDC")
  const [simulated, setSimulated] = useState(false)

  const numAmount = parseFloat(amount) || 0
  const platformFee = numAmount * 0.005
  const depA = numAmount * 0.02
  const depB = numAmount * 0.02
  const depC = numAmount * 0.02
  const youReceive = numAmount - platformFee - depA - depB - depC

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="text-sm font-semibold text-foreground">Payment Simulator</h3>
      <p className="mt-0.5 text-xs text-muted-foreground">
        Preview how a payment will be distributed
      </p>

      <div className="mt-4 space-y-3">
        <div>
          <Label className="mb-1.5 text-xs text-muted-foreground">Amount</Label>
          <div className="flex gap-2">
            <Input
              type="number"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value)
                setSimulated(false)
              }}
              className="h-9 flex-1 border-border bg-secondary/50 text-sm text-foreground focus-visible:ring-primary"
            />
            <Select value={asset} onValueChange={setAsset}>
              <SelectTrigger className="h-9 w-24 border-border bg-secondary/50 text-sm text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-border bg-popover">
                <SelectItem value="USDC">USDC</SelectItem>
                <SelectItem value="XLM">XLM</SelectItem>
                <SelectItem value="ARS">ARS</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          onClick={() => setSimulated(true)}
          className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Play className="h-4 w-4" />
          Simulate
        </Button>
      </div>

      {simulated && numAmount > 0 && (
        <div className="mt-4 space-y-2.5 rounded-lg border border-border bg-secondary/20 p-3">
          <p className="text-xs font-medium text-muted-foreground">Distribution Preview</p>

          <div className="flex items-center justify-between">
            <span className="text-sm text-foreground">You (alice)</span>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-sm font-semibold text-foreground">
                {youReceive.toFixed(2)}
              </span>
              <span className="text-xs text-muted-foreground">{asset}</span>
            </div>
          </div>

          <div className="h-px bg-border" />

          {[
            { name: "react-core", amount: depA },
            { name: "tailwind-css", amount: depB },
            { name: "next-framework", amount: depC },
          ].map((d) => (
            <div key={d.name} className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <ArrowRight className="h-3 w-3 text-primary" />
                <span className="text-sm text-muted-foreground">{d.name}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-sm text-primary">{d.amount.toFixed(2)}</span>
                <span className="text-xs text-muted-foreground">{asset}</span>
              </div>
            </div>
          ))}

          <div className="h-px bg-border" />

          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Tippa fee (0.5%)</span>
            <span className="font-mono text-xs text-muted-foreground">
              {platformFee.toFixed(2)} {asset}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
