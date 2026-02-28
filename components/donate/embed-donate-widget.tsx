"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { GitFork, Loader2, CheckCircle2, ExternalLink, Wallet } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TESTNET_ASSETS, DEFAULT_ASSET_ID } from "@/lib/constants/assets"
import type { Profile } from "@/lib/types"
import { useWallet } from "@/providers/wallet-provider"
import { cn } from "@/lib/utils"

type Step = "form" | "submitting" | "success"

interface EmbedDonateWidgetProps {
  profile: Profile
}

export function EmbedDonateWidget({ profile }: EmbedDonateWidgetProps) {
  const searchParams = useSearchParams()
  const { walletAddress, isConnected, connectWallet, signTransaction } = useWallet()

  const theme = searchParams.get("theme") === "light" ? "light" : "dark"
  const initialAsset = searchParams.get("asset") || DEFAULT_ASSET_ID
  const initialAmount = searchParams.get("amount") || ""

  const [step, setStep] = useState<Step>("form")
  const [amount, setAmount] = useState(initialAmount)
  const [assetId, setAssetId] = useState(TESTNET_ASSETS.some((a) => a.id === initialAsset) ? initialAsset : DEFAULT_ASSET_ID)
  const [error, setError] = useState<string | null>(null)
  const [txHash, setTxHash] = useState<string | null>(null)

  const selectedAsset = TESTNET_ASSETS.find((a) => a.id === assetId)!
  const displayName = profile.display_name || profile.username || "Anonymous"

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
      const buildRes = await fetch("/api/donate/build", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          callerAddress: walletAddress,
          username: profile.username,
          assetId,
          amount,
        }),
      })

      const buildData = await buildRes.json()
      if (!buildRes.ok) {
        throw new Error(buildData.error || "Failed to build transaction.")
      }

      const signedXdr = await signTransaction(buildData.xdr, walletAddress!)

      const submitRes = await fetch("/api/donate/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signedXdr,
          username: profile.username,
          assetContractId: selectedAsset.contractId,
          donorAddress: walletAddress,
          amount,
          assetId,
        }),
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
    setTxHash(null)
    setError(null)
  }

  const isDark = theme === "dark"

  return (
    <div
      className={cn("flex min-h-screen flex-col items-center justify-center p-4", isDark ? "bg-[#0a0a0a] text-[#fafafa]" : "bg-white text-[#0a0a0a]")}
    >
      <div className="w-full max-w-[350px]">
        {/* Header */}
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[hsl(168_80%_50%)]">
            <GitFork className="h-3 w-3 text-[#042f2e]" />
          </div>
          <span className={cn("text-xs font-semibold", isDark ? "text-[#fafafa]" : "text-[#0a0a0a]")}>Tippa</span>
        </div>

        <h2 className={cn("mb-4 text-base font-semibold", isDark ? "text-[#fafafa]" : "text-[#0a0a0a]")}>Support {displayName}</h2>

        {step === "form" && (
          <div className="space-y-3">
            {/* Amount + Asset */}
            <div className="flex gap-2">
              <Input
                type="number"
                min="0"
                step="any"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={cn(
                  "h-11 flex-1 font-mono text-base",
                  isDark
                    ? "border-[#333] bg-[#1a1a1a] text-[#fafafa] placeholder:text-[#666]"
                    : "border-[#e5e5e5] bg-[#f5f5f5] text-[#0a0a0a] placeholder:text-[#999]",
                )}
              />
              <Select value={assetId} onValueChange={setAssetId}>
                <SelectTrigger
                  className={cn(
                    "h-11 w-[90px] text-sm",
                    isDark ? "border-[#333] bg-[#1a1a1a] text-[#fafafa]" : "border-[#e5e5e5] bg-[#f5f5f5] text-[#0a0a0a]",
                  )}
                >
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

            {/* Quick amounts */}
            <div className="flex gap-2">
              {["5", "10", "25", "50"].map((preset) => (
                <button
                  key={preset}
                  onClick={() => setAmount(preset)}
                  className={cn(
                    "flex-1 rounded-lg border py-2 text-xs font-medium transition-colors",
                    amount === preset
                      ? "border-[hsl(168_80%_50%)] bg-[hsl(168_80%_50%/0.1)] text-[hsl(168_80%_50%)]"
                      : isDark
                        ? "border-[#333] bg-[#1a1a1a] text-[#aaa] hover:border-[#555] hover:text-[#fafafa]"
                        : "border-[#e5e5e5] bg-[#f5f5f5] text-[#666] hover:border-[#ccc] hover:text-[#0a0a0a]",
                  )}
                >
                  {preset}
                </button>
              ))}
            </div>

            {/* Connected wallet */}
            {isConnected && walletAddress && (
              <div
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-xs",
                  isDark ? "bg-[hsl(168_80%_50%/0.05)] text-[#ccc]" : "bg-[hsl(168_80%_50%/0.05)] text-[#555]",
                )}
              >
                <Wallet className="h-3.5 w-3.5" />
                <span className="font-mono">
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </span>
              </div>
            )}

            {/* Error */}
            {error && <div className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400">{error}</div>}

            {/* CTA */}
            <Button
              onClick={handleDonate}
              className="h-11 w-full gap-2 bg-[hsl(168_80%_50%)] text-sm font-semibold text-[#042f2e] hover:bg-[hsl(168_80%_45%)]"
            >
              <Wallet className="h-4 w-4" />
              {!isConnected ? "Connect Wallet & Donate" : amount && parseFloat(amount) > 0 ? `Donate ${amount} ${selectedAsset.symbol}` : "Donate"}
            </Button>

            {/* Trust line */}
            <p className={cn("text-center text-[10px]", isDark ? "text-[#555]" : "text-[#bbb]")}>
              Non-custodial. Settled on Stellar in under 5 seconds.
            </p>
          </div>
        )}

        {step === "submitting" && (
          <div className="flex flex-col items-center py-10">
            <Loader2 className="mb-4 h-8 w-8 animate-spin text-[hsl(168_80%_50%)]" />
            <p className={cn("text-sm font-medium", isDark ? "text-[#fafafa]" : "text-[#0a0a0a]")}>Processing donation...</p>
            <p className={cn("mt-1 text-xs", isDark ? "text-[#888]" : "text-[#666]")}>Confirm in your wallet and wait for settlement.</p>
          </div>
        )}

        {step === "success" && (
          <div className="flex flex-col items-center py-8">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[hsl(168_80%_50%/0.1)]">
              <CheckCircle2 className="h-7 w-7 text-[hsl(168_80%_50%)]" />
            </div>
            <h2 className={cn("text-lg font-bold", isDark ? "text-[#fafafa]" : "text-[#0a0a0a]")}>Thank you!</h2>
            <p className={cn("mt-2 text-center text-sm", isDark ? "text-[#888]" : "text-[#666]")}>
              {amount} {selectedAsset.symbol} sent to {displayName}
            </p>
            {txHash && (
              <a
                href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-[hsl(168_80%_50%)] transition-colors hover:text-[hsl(168_80%_45%)]"
              >
                View on StellarExpert
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
            <button
              onClick={handleDonateAgain}
              className={cn(
                "mt-5 rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
                isDark ? "border-[#333] text-[#fafafa] hover:bg-[#1a1a1a]" : "border-[#e5e5e5] text-[#0a0a0a] hover:bg-[#f5f5f5]",
              )}
            >
              Donate Again
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
