"use client"

import { useState, useEffect, useCallback } from "react"
import { Loader2, Wallet, ExternalLink, ChevronDown, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { useWallet } from "@/providers/wallet-provider"

interface AssetBalance {
  assetId: string
  assetName: string
  symbol: string
  contractId: string
  pool: string
  unclaimed: string
}

type ClaimState = "idle" | "signing" | "submitting" | "success" | "error"

interface FundsClientProps {
  username: string
  walletAddress: string
}

export function FundsClient({ username, walletAddress }: FundsClientProps) {
  const { signTransaction } = useWallet()
  const [balances, setBalances] = useState<AssetBalance[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  // Per-asset claim state
  const [claimingAsset, setClaimingAsset] = useState<string | null>(null)
  const [claimState, setClaimState] = useState<ClaimState>("idle")
  const [claimError, setClaimError] = useState<string | null>(null)
  const [claimTxHash, setClaimTxHash] = useState<string | null>(null)

  // Advanced: custom destination
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [customAddress, setCustomAddress] = useState("")

  const fetchBalances = useCallback(async () => {
    setLoading(true)
    setFetchError(null)
    try {
      const res = await fetch("/api/funds/balances")
      if (!res.ok) {
        const data = await res.json()
        setFetchError(data.error || "Failed to fetch balances.")
        return
      }
      const data = await res.json()
      setBalances(data.balances)
    } catch {
      setFetchError("Failed to fetch balances.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBalances()
  }, [fetchBalances])

  const handleClaim = async (asset: AssetBalance) => {
    setClaimingAsset(asset.assetId)
    setClaimState("signing")
    setClaimError(null)
    setClaimTxHash(null)

    try {
      const destination = customAddress.trim() || undefined

      // Step 1: Build
      const buildRes = await fetch("/api/funds/claim/build", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          callerAddress: walletAddress,
          username,
          asset: asset.contractId,
          to: destination,
        }),
      })

      const buildData = await buildRes.json()
      if (!buildRes.ok) {
        setClaimState("error")
        setClaimError(buildData.error || "Failed to build claim transaction.")
        return
      }

      // Step 2: Sign
      let signedXdr: string
      try {
        signedXdr = await signTransaction(buildData.xdr, walletAddress)
      } catch {
        setClaimState("error")
        setClaimError("Transaction signing cancelled.")
        return
      }

      // Step 3: Submit
      setClaimState("submitting")
      const submitRes = await fetch("/api/funds/claim/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signedXdr }),
      })

      const submitData = await submitRes.json()
      if (!submitRes.ok) {
        setClaimState("error")
        setClaimError(submitData.error || "Failed to submit transaction.")
        return
      }

      setClaimTxHash(submitData.txHash)
      setClaimState("success")

      // Refresh balances after successful claim
      await fetchBalances()

      // Reset after 5 seconds
      setTimeout(() => {
        setClaimState("idle")
        setClaimingAsset(null)
        setClaimTxHash(null)
      }, 5000)
    } catch (err) {
      setClaimState("error")
      setClaimError("An unexpected error occurred.")
      console.error("Claim error:", err)
    }
  }

  const isClaiming = claimState === "signing" || claimState === "submitting"

  if (loading) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-10">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <span className="text-sm text-muted-foreground">Loading on-chain balances...</span>
      </div>
    )
  }

  if (fetchError) {
    return (
      <div className="rounded-xl border border-border bg-card p-10">
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          {fetchError}
        </div>
        <Button variant="outline" onClick={fetchBalances} className="mt-4">
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Unclaimed Balances */}
      <div className="rounded-xl border border-border bg-card">
        <div className="border-b border-border p-5">
          <h3 className="text-sm font-semibold text-foreground">Unclaimed Balance</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">Funds ready to withdraw to your wallet</p>
        </div>
        <div className="p-5">
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {balances!.map((b) => {
                const isThisAssetClaiming = claimingAsset === b.assetId
                const hasBalance = parseFloat(b.unclaimed) > 0
                return (
                  <div key={b.assetId} className="rounded-lg border border-border bg-secondary/30 p-4">
                    <p className="text-xs font-medium text-muted-foreground">{b.assetName}</p>
                    <div className="mt-1 flex items-baseline gap-1.5">
                      <span className="text-2xl font-semibold tracking-tight text-foreground">{b.unclaimed}</span>
                      <span className="text-sm text-muted-foreground">{b.symbol}</span>
                    </div>
                    <Button
                      onClick={() => handleClaim(b)}
                      disabled={isClaiming || !hasBalance}
                      className={cn(
                        "mt-3 w-full gap-2",
                        isThisAssetClaiming && claimState === "success"
                          ? "bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))] hover:bg-[hsl(var(--success))]"
                          : "bg-primary text-primary-foreground hover:bg-primary/90",
                      )}
                    >
                      {isThisAssetClaiming && claimState === "signing" && (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Sign in your wallet...
                        </>
                      )}
                      {isThisAssetClaiming && claimState === "submitting" && (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      )}
                      {isThisAssetClaiming && claimState === "success" && "Claimed!"}
                      {(!isThisAssetClaiming || claimState === "idle" || claimState === "error") && (
                        <>
                          <Wallet className="h-4 w-4" />
                          Claim {b.symbol}
                        </>
                      )}
                    </Button>
                  </div>
                )
              })}
            </div>

            {/* Destination info */}
            <div className="flex items-center gap-2 rounded-lg bg-secondary/30 px-3 py-2 text-xs text-muted-foreground">
              <Wallet className="h-3.5 w-3.5 shrink-0" />
              <span>
                Funds will be sent to{" "}
                <span className="font-mono">{customAddress.trim() || `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`}</span>
              </span>
            </div>

            {/* Advanced: custom destination */}
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <ChevronDown className={cn("h-3 w-3 transition-transform", showAdvanced && "rotate-180")} />
              Advanced: Send to different address
            </button>

            {showAdvanced && (
              <div>
                <Label className="mb-1.5 text-xs text-muted-foreground">Destination address</Label>
                <Input
                  value={customAddress}
                  onChange={(e) => setCustomAddress(e.target.value)}
                  placeholder={walletAddress}
                  className="h-9 border-border bg-secondary/50 font-mono text-sm text-foreground placeholder:text-muted-foreground/40 focus-visible:ring-primary"
                />
                <p className="mt-1 text-[10px] text-muted-foreground">Leave empty to use your registered wallet address.</p>
              </div>
            )}
          </div>

          {/* Claim error */}
          {claimError && (
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
              <span className="text-xs text-destructive">{claimError}</span>
            </div>
          )}

          {/* Success tx link */}
          {claimTxHash && claimState === "success" && (
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-[hsl(var(--success))]/10 px-3 py-2">
              <a
                href={`https://stellar.expert/explorer/testnet/tx/${claimTxHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs font-medium text-[hsl(var(--success))] transition-colors hover:text-[hsl(var(--success))]/80"
              >
                View transaction on StellarExpert
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Pool Balances */}
      <div className="rounded-xl border border-border bg-card">
        <div className="border-b border-border p-5">
          <h3 className="text-sm font-semibold text-foreground">Pool Balance</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">Funds waiting to be distributed to your dependencies</p>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {balances!.map((b) => (
              <div key={b.assetId} className="rounded-lg border border-border bg-secondary/30 p-4">
                <p className="text-xs font-medium text-muted-foreground">{b.assetName}</p>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className="text-2xl font-semibold tracking-tight text-foreground">{b.pool}</span>
                  <span className="text-sm text-muted-foreground">{b.symbol}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
