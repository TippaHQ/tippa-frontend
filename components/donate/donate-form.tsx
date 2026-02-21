"use client"

import { useState } from "react"
import { GitFork, Loader2, CheckCircle2, ExternalLink, Wallet, ArrowDown, User } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useWallet } from "@/providers/wallet-provider"
import { TESTNET_ASSETS, DEFAULT_ASSET_ID } from "@/lib/constants/assets"
import type { Profile, CascadeDependency } from "@/lib/types"

type Step = "form" | "submitting" | "success"

interface DonateFormProps {
  profile: Profile
  dependencies: CascadeDependency[]
}

export function DonateForm({ profile, dependencies }: DonateFormProps) {
  const { walletAddress, isConnected, connectWallet, signTransaction } = useWallet()

  const [step, setStep] = useState<Step>("form")
  const [amount, setAmount] = useState("")
  const [assetId, setAssetId] = useState(DEFAULT_ASSET_ID)
  const [donorName, setDonorName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [txHash, setTxHash] = useState<string | null>(null)

  const selectedAsset = TESTNET_ASSETS.find((a) => a.id === assetId)!
  const displayName = profile.display_name || profile.username || "Anonymous"
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  const totalDependencyPercentage = dependencies.reduce((sum, d) => sum + d.percentage, 0)

  async function handleDonate() {
    setError(null)

    const parsedAmount = parseFloat(amount)
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Enter a valid amount greater than zero.")
      return
    }

    if (!isConnected) {
      await connectWallet()
      return
    }

    setStep("submitting")

    try {
      // Build unsigned tx
      const buildRes = await fetch("/api/donate/build", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          callerAddress: walletAddress,
          username: profile.username,
          assetId,
          amount,
          donorOverride: donorName || undefined,
        }),
      })

      const buildData = await buildRes.json()
      if (!buildRes.ok) {
        throw new Error(buildData.error || "Failed to build transaction.")
      }

      // Sign with wallet
      const signedXdr = await signTransaction(buildData.xdr)

      // Submit signed tx
      const submitRes = await fetch("/api/donate/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signedXdr }),
      })

      const submitData = await submitRes.json()
      if (!submitRes.ok) {
        throw new Error(submitData.error || "Failed to submit transaction.")
      }

      setTxHash(submitData.txHash)
      setStep("success")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.")
      setStep("form")
    }
  }

  function handleDonateAgain() {
    setStep("form")
    setAmount("")
    setDonorName("")
    setTxHash(null)
    setError(null)
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4 py-12">
      {/* Atmospheric background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-primary/[0.04] blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[400px] w-[500px] translate-x-1/4 translate-y-1/4 rounded-full bg-[hsl(200_70%_50%/0.03)] blur-[100px]" />
      </div>

      {/* Branding */}
      <div className="relative mb-8 flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <GitFork className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="text-sm font-semibold tracking-tight text-foreground">Tippa</span>
      </div>

      {/* Main card */}
      <div className="relative w-full max-w-md">
        <div className="rounded-2xl border border-border bg-card/80 shadow-2xl shadow-black/20 backdrop-blur-sm">
          {/* Recipient header */}
          <div className="border-b border-border px-6 py-5">
            <div className="flex items-center gap-3.5">
              <Avatar className="h-12 w-12 border-2 border-primary/20">
                <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <h1 className="truncate text-lg font-semibold text-foreground">{displayName}</h1>
                {profile.bio && (
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">{profile.bio}</p>
                )}
              </div>
            </div>
          </div>

          {/* Content area */}
          <div className="px-6 py-5">
            {step === "form" && (
              <div className="space-y-4">
                {/* Amount + Asset */}
                <div>
                  <Label className="mb-1.5 text-xs text-muted-foreground">Amount</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      min="0"
                      step="any"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="h-11 flex-1 border-border bg-secondary/50 font-mono text-base text-foreground placeholder:text-muted-foreground/40 focus-visible:ring-primary"
                    />
                    <Select value={assetId} onValueChange={setAssetId}>
                      <SelectTrigger className="h-11 w-[110px] border-border bg-secondary/50 text-sm text-foreground focus:ring-primary">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TESTNET_ASSETS.map((asset) => (
                          <SelectItem key={asset.id} value={asset.id}>
                            {asset.symbol}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Donor name (optional) */}
                <div>
                  <Label className="mb-1.5 text-xs text-muted-foreground">
                    Your name <span className="text-muted-foreground/50">(optional)</span>
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/50" />
                    <Input
                      value={donorName}
                      onChange={(e) => setDonorName(e.target.value)}
                      placeholder="Anonymous"
                      className="h-10 border-border bg-secondary/50 pl-9 text-sm text-foreground placeholder:text-muted-foreground/40 focus-visible:ring-primary"
                    />
                  </div>
                </div>

                {/* Connected wallet indicator */}
                {isConnected && walletAddress && (
                  <div className="flex items-center gap-2 rounded-lg bg-primary/5 px-3 py-2 text-xs text-muted-foreground">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    <span className="font-mono">
                      {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                    </span>
                  </div>
                )}

                {/* Error */}
                {error && (
                  <div className="rounded-lg bg-destructive/10 px-3 py-2.5 text-xs text-destructive">
                    {error}
                  </div>
                )}

                {/* CTA */}
                <Button
                  onClick={handleDonate}
                  className="h-11 w-full gap-2 bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  <Wallet className="h-4 w-4" />
                  {!isConnected
                    ? "Connect Wallet & Donate"
                    : amount && parseFloat(amount) > 0
                      ? `Donate ${amount} ${selectedAsset.symbol}`
                      : "Donate"}
                </Button>
              </div>
            )}

            {step === "submitting" && (
              <div className="flex flex-col items-center py-8">
                <Loader2 className="mb-4 h-8 w-8 animate-spin text-primary" />
                <p className="text-sm font-medium text-foreground">Processing donation...</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Please confirm in your wallet and wait for settlement.
                </p>
              </div>
            )}

            {step === "success" && (
              <div className="flex flex-col items-center py-6">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[hsl(var(--success))]/10">
                  <CheckCircle2 className="h-7 w-7 text-[hsl(var(--success))]" />
                </div>
                <h2 className="text-lg font-semibold text-foreground">Donation sent!</h2>
                <p className="mt-1 text-center text-xs text-muted-foreground">
                  Your donation of {amount} {selectedAsset.symbol} to {displayName} has been confirmed on the Stellar network.
                </p>
                {txHash && (
                  <a
                    href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-primary transition-colors hover:text-primary/80"
                  >
                    View on StellarExpert
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                <Button
                  variant="outline"
                  onClick={handleDonateAgain}
                  className="mt-5 h-9 border-border text-sm text-foreground hover:bg-secondary"
                >
                  Donate Again
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Cascade flow preview */}
        {dependencies.length > 0 && step === "form" && (
          <div className="mt-4 rounded-xl border border-dashed border-border/60 bg-card/40 px-5 py-4 backdrop-blur-sm">
            <div className="mb-3 flex items-center gap-2">
              <GitFork className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-medium text-muted-foreground">Cascade distribution</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-foreground">{displayName}</span>
                <span className="font-mono text-xs text-muted-foreground">
                  {100 - totalDependencyPercentage}%
                </span>
              </div>
              {dependencies.map((dep) => (
                <div key={dep.id} className="flex items-center gap-2">
                  <ArrowDown className="h-3 w-3 shrink-0 text-primary/40" />
                  <div className="flex flex-1 items-center justify-between">
                    <span className="truncate text-xs text-muted-foreground">{dep.label}</span>
                    <span className="ml-2 font-mono text-xs text-muted-foreground">{dep.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <p className="relative mt-8 text-center text-[10px] text-muted-foreground/50">
        Non-custodial. All signing happens client-side via your Stellar wallet.
      </p>
    </div>
  )
}
