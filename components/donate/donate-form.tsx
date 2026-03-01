"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { GitFork, Loader2, CheckCircle2, ExternalLink, Wallet, ArrowDown, User, Github, Twitter, Globe, Copy, Check } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { ProfileAvatar, ProfileBanner } from "@/components/shared/user-profile"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { TESTNET_ASSETS, DEFAULT_ASSET_ID } from "@/lib/constants/assets"
import type { Profile, CascadeDependency } from "@/lib/types"
import { useWallet } from "@/providers/wallet-provider"
import { useUserStore } from "@/lib/store/user-store"
import { getInitials, getWalletShort } from "@/lib/utils"
import { AppLogo } from "@/components/shared/app-logo"
import { ThemeToggle } from "@/components/theme-toggle"

type Step = "form" | "submitting" | "success"

interface DonateFormProps {
  profile: Profile
  dependencies: CascadeDependency[]
}

export function DonateForm({ profile, dependencies }: DonateFormProps) {
  const { walletAddress, isConnected, connectWallet, signTransaction } = useWallet()
  const currentUserProfile = useUserStore((state) => state.profile)

  const [step, setStep] = useState<Step>("form")
  const [amount, setAmount] = useState("")
  const [assetId, setAssetId] = useState(DEFAULT_ASSET_ID)
  const [donorName, setDonorName] = useState(currentUserProfile?.display_name || "")
  const [error, setError] = useState<string | null>(null)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [donationId, setDonationId] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const selectedAsset = TESTNET_ASSETS.find((a) => a.id === assetId)!
  const displayName = profile.display_name || profile.username || "Anonymous"
  const initials = getInitials(displayName)

  const totalDependencyPercentage = dependencies.reduce((sum, d) => sum + d.percentage, 0)
  const hasSocials = profile.github || profile.twitter || profile.website

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
      setDonationId(submitData.donationId || null)
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
    setDonationId(null)
    setError(null)
  }

  async function copyDonationLink() {
    if (!donationId) return
    const link = `${window.location.origin}/donation/${donationId}`
    await navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  useEffect(() => {
    if (currentUserProfile) {
      setDonorName(currentUserProfile.display_name || "")
    }
  }, [currentUserProfile])

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Atmospheric background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[1200px] w-[1200px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#15C19F]/10 blur-[100px]" />
        <div className="absolute left-0 bottom-0 h-[600px] w-[600px] -translate-x-1/2 translate-y-1/2 rounded-full bg-[#15C19F]/10 blur-[100px]" />
        <div className="absolute right-0 bottom-0 h-[600px] w-[600px] translate-x-1/2 translate-y-1/2 rounded-full bg-[#15C19F]/10 blur-[100px]" />
      </div>

      {/* Top bar */}
      <header className="relative flex items-center justify-between p-4">
        <a href={currentUserProfile ? "/dashboard" : "/"} className="flex items-center gap-2.5">
          <AppLogo />
        </a>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          {!currentUserProfile && (
            <Button asChild>
              <Link href="/">Create Your Tippa</Link>
            </Button>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="relative mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:py-16">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5 lg:gap-12">
          {/* Left: Profile showcase */}
          <div className="lg:col-span-3">
            {/* Profile hero */}
            <div className="rounded-2xl border border-border bg-card/80 backdrop-blur-sm">
              {/* Banner gradient */}
              <ProfileBanner bannerUrl={profile?.banner_url} />

              <div className="relative px-6 pb-6">
                {/* Avatar */}
                <div className="-mt-14 mb-2">
                  <ProfileAvatar initials={initials} avatarUrl={profile?.avatar_url} />
                </div>

                {/* Name + username */}
                <h1 className="text-2xl font-bold tracking-tight text-foreground">{displayName}</h1>
                {profile.username && <p className="mt-0.5 font-mono text-sm text-primary">@{profile.username}</p>}

                {/* Bio */}
                {profile.bio && <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{profile.bio}</p>}

                {/* Social links */}
                {hasSocials && (
                  <div className="mt-5 flex flex-wrap items-center gap-2">
                    {profile.github && (
                      <a
                        href={`https://github.com/${profile.github}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/40 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
                      >
                        <Github className="h-3 w-3" />
                        {profile.github}
                      </a>
                    )}
                    {profile.twitter && (
                      <a
                        href={`https://x.com/${profile.twitter}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/40 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
                      >
                        <Twitter className="h-3 w-3" />
                        {profile.twitter}
                      </a>
                    )}
                    {profile.website && (
                      <a
                        href={profile.website.startsWith("http") ? profile.website : `https://${profile.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/40 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
                      >
                        <Globe className="h-3 w-3" />
                        {profile.website.replace(/^https?:\/\//, "")}
                      </a>
                    )}
                  </div>
                )}

                {/* Wallet address */}
                {profile.wallet_address && (
                  <div className="mt-5 flex items-center gap-2">
                    <Wallet className="h-3.5 w-3.5 text-muted-foreground/50" />
                    <span className="font-mono text-xs text-muted-foreground">{getWalletShort(profile.wallet_address)}</span>
                    <a
                      href={`https://stellar.expert/explorer/testnet/account/${profile.wallet_address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground/40 transition-colors hover:text-primary"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Cascade flow preview */}
            {dependencies.length > 0 && (
              <div className="mt-4 rounded-2xl border border-dashed border-border/60 bg-card/40 px-6 py-5 backdrop-blur-sm">
                <div className="mb-4 flex items-center gap-2">
                  <GitFork className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">Cascade distribution</span>
                </div>
                <p className="mb-4 text-xs text-muted-foreground">
                  Your donation is automatically split across these recipients in a single atomic transaction.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between rounded-lg bg-secondary/30 px-3 py-2">
                    <span className="text-sm text-foreground">{displayName}</span>
                    <span className="font-mono text-sm font-medium text-foreground">{100 - totalDependencyPercentage}%</span>
                  </div>
                  {dependencies.map((dep) => (
                    <div key={dep.id} className="flex items-center gap-2">
                      <ArrowDown className="h-3 w-3 shrink-0 text-primary/50" />
                      <div className="flex flex-1 items-center justify-between rounded-lg bg-secondary/20 px-3 py-2">
                        <span className="text-sm text-muted-foreground">{dep.label}</span>
                        <span className="font-mono text-sm text-muted-foreground">{dep.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Donation form */}
          <div className="lg:col-span-2">
            <div className="sticky top-8 rounded-2xl border border-border bg-card/80 shadow-2xl shadow-black/20 backdrop-blur-sm">
              <div className="border-b border-border px-6 py-4">
                <h2 className="text-sm font-semibold text-foreground">Support {profile.display_name || profile.username}</h2>
              </div>

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
                          className="h-12 flex-1 border-border bg-secondary/50 font-mono text-lg text-foreground placeholder:text-muted-foreground/40 focus-visible:ring-primary"
                        />
                        <Select value={assetId} onValueChange={setAssetId}>
                          <SelectTrigger className="h-12 w-[100px] border-border bg-secondary/50 text-sm text-foreground focus:ring-primary">
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

                    {/* Quick amounts */}
                    <div className="flex gap-2">
                      {["5", "10", "25", "50"].map((preset) => (
                        <button
                          key={preset}
                          onClick={() => setAmount(preset)}
                          className={`flex-1 rounded-lg border py-2 text-xs font-medium transition-colors ${
                            amount === preset
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border bg-secondary/30 text-muted-foreground hover:border-primary/30 hover:text-foreground"
                          }`}
                        >
                          {preset}
                        </button>
                      ))}
                    </div>

                    {/* Donor name */}
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

                    {/* Connected wallet */}
                    {isConnected && walletAddress && (
                      <div className="flex items-center gap-2 w-fit rounded-lg bg-primary/5 px-3 py-2 text-xs text-foreground/80">
                        Sending from:
                        <br />
                        <Wallet className="h-3.5 w-3.5" />
                        <span className="font-mono">
                          {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                        </span>
                      </div>
                    )}

                    {/* Error */}
                    {error && <div className="rounded-lg bg-destructive/10 px-3 py-2.5 text-xs text-destructive">{error}</div>}

                    {/* CTA */}
                    <Button
                      onClick={handleDonate}
                      className="h-12 w-full gap-2 bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                    >
                      <Wallet className="h-4 w-4" />
                      {!isConnected
                        ? "Connect Wallet & Donate"
                        : amount && parseFloat(amount) > 0
                          ? `Donate ${amount} ${selectedAsset.symbol}`
                          : "Donate"}
                    </Button>

                    {/* Trust line */}
                    <p className="text-center text-[10px] text-muted-foreground/40">Non-custodial. Settled on Stellar in under 5 seconds.</p>
                  </div>
                )}

                {step === "submitting" && (
                  <div className="flex flex-col items-center py-10">
                    <Loader2 className="mb-4 h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm font-medium text-foreground">Processing donation...</p>
                    <p className="mt-1 text-xs text-muted-foreground">Confirm in your wallet and wait for settlement.</p>
                  </div>
                )}

                {step === "success" && (
                  <div className="flex flex-col items-center py-8">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(var(--success))]/10">
                      <CheckCircle2 className="h-8 w-8 text-[hsl(var(--success))]" />
                    </div>
                    <h2 className="text-lg font-bold text-foreground">Thank you!</h2>
                    <p className="mt-2 text-center text-sm text-muted-foreground">
                      {amount} {selectedAsset.symbol} sent to {displayName}
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
                    {donationId && (
                      <div className="mt-4 flex flex-col items-center gap-2 rounded-lg border border-border bg-secondary/30 px-4 py-3">
                        <p className="text-xs text-muted-foreground">Share your impact</p>
                        <div className="flex items-center gap-2">
                          <a href={`/donation/${donationId}`} className="text-xs font-medium text-primary hover:underline">
                            /donation/{donationId.slice(0, 8)}...
                          </a>
                          <button
                            onClick={copyDonationLink}
                            className="text-muted-foreground transition-colors hover:text-foreground"
                            title="Copy link"
                          >
                            {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                      </div>
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
          </div>
        </div>
      </main>
    </div>
  )
}
