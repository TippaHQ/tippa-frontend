"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useWallet } from "@/providers/wallet-provider"
import { GitFork, Loader2, CheckCircle2, Wallet, ArrowRight, User, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type Step = "username" | "wallet" | "register" | "success"

const USERNAME_REGEX = /^[a-z0-9_-]{1,32}$/

export default function OnboardingPage() {
  const router = useRouter()
  const { walletAddress, isConnected, connectWallet, signTransaction } = useWallet()

  const [step, setStep] = useState<Step>("username")
  const [username, setUsername] = useState("")
  const [usernameError, setUsernameError] = useState("")
  const [checkingUsername, setCheckingUsername] = useState(false)
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  // Debounced username availability check
  useEffect(() => {
    setUsernameAvailable(null)
    setUsernameError("")

    if (!username) return

    if (!USERNAME_REGEX.test(username)) {
      setUsernameError("Use lowercase letters, numbers, underscores, or dashes.")
      return
    }

    const timeout = setTimeout(async () => {
      setCheckingUsername(true)
      try {
        const supabase = createClient()
        const { data } = await supabase.from("profiles").select("id").eq("username", username).maybeSingle()
        setUsernameAvailable(!data)
        if (data) setUsernameError("Username is already taken.")
      } catch {
        // Ignore check failures
      } finally {
        setCheckingUsername(false)
      }
    }, 400)

    return () => clearTimeout(timeout)
  }, [username])

  const handleContinueToWallet = () => {
    if (!username || !usernameAvailable) return
    setStep("wallet")
  }

  const handleConnectWallet = useCallback(async () => {
    setError("")
    try {
      await connectWallet()
    } catch {
      setError("Failed to connect wallet. Please try again.")
    }
  }, [connectWallet])

  // Auto-advance if wallet is already connected
  useEffect(() => {
    if (step === "wallet" && isConnected) {
      setStep("register")
    }
  }, [step, isConnected])

  const handleRegister = async () => {
    if (!walletAddress || !username) return
    setError("")
    setLoading(true)

    try {
      // Build the unsigned transaction
      const buildRes = await fetch("/api/register/build", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, walletAddress }),
      })

      const buildData = await buildRes.json()
      if (!buildRes.ok) {
        setError(buildData.error || "Failed to build transaction.")
        setLoading(false)
        return
      }

      // Sign with wallet
      let signedXdr: string
      try {
        signedXdr = await signTransaction(buildData.xdr)
      } catch {
        setError("Transaction signing was rejected.")
        setLoading(false)
        return
      }

      // Submit the signed transaction
      const submitRes = await fetch("/api/register/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signedXdr, username, walletAddress }),
      })

      const submitData = await submitRes.json()
      if (!submitRes.ok) {
        setError(submitData.error || "Transaction failed.")
        setLoading(false)
        return
      }

      setStep("success")
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const steps: { key: Step; label: string }[] = [
    { key: "username", label: "Username" },
    { key: "wallet", label: "Wallet" },
    { key: "register", label: "Register" },
    { key: "success", label: "Done" },
  ]

  const currentIndex = steps.findIndex((s) => s.key === step)

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background p-4">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/3 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-md space-y-8">
        {/* Header */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
            <GitFork className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{step === "success" ? "You're all set!" : "Set up your account"}</h1>
          {step !== "success" && <p className="text-sm text-muted-foreground">Choose a username and connect your wallet to get started.</p>}
        </div>

        {/* Progress steps */}
        {step !== "success" && (
          <div className="flex items-center justify-center gap-1">
            {steps.map((s, i) => (
              <div key={s.key} className="flex items-center gap-1">
                <div
                  className={`flex h-7 items-center gap-1.5 rounded-full px-3 text-xs font-medium transition-all ${
                    i < currentIndex
                      ? "bg-primary/15 text-primary"
                      : i === currentIndex
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary/50 text-muted-foreground"
                  }`}
                >
                  {i < currentIndex ? <CheckCircle2 className="h-3 w-3" /> : null}
                  {s.label}
                </div>
                {i < steps.length - 1 && <div className="mx-0.5 h-px w-4 bg-border" />}
              </div>
            ))}
          </div>
        )}

        {/* Card */}
        <div className="rounded-xl border border-border bg-card p-6">
          {/* Step: Username */}
          {step === "username" && (
            <div className="space-y-4">
              <div>
                <Label className="mb-1.5 text-xs text-muted-foreground">Username</Label>
                <div className="relative">
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase())}
                    placeholder="alice"
                    className="h-10 border-border bg-secondary/50 text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-primary"
                    autoFocus
                  />
                  {checkingUsername && <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />}
                  {!checkingUsername && usernameAvailable === true && (
                    <CheckCircle2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--success))]" />
                  )}
                </div>
                {username && !usernameError && (
                  <p className="mt-1.5 font-mono text-xs text-muted-foreground">
                    trytippa.com/d/<span className="text-foreground">{username}</span>
                  </p>
                )}
                {usernameError && <p className="mt-1.5 text-xs text-destructive">{usernameError}</p>}
                {!usernameError && usernameAvailable === true && <p className="mt-1.5 text-xs text-[hsl(var(--success))]">Username is available!</p>}
                <p className="mt-2 text-xs text-muted-foreground">This will be your on-chain project ID. It can't be changed later.</p>
              </div>

              <Button
                onClick={handleContinueToWallet}
                disabled={!username || !usernameAvailable}
                className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Continue
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Step: Wallet */}
          {step === "wallet" && (
            <div className="space-y-4">
              <div className="flex flex-col items-center gap-3 py-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary">
                  <Wallet className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-center text-sm text-muted-foreground">
                  Connect your Stellar wallet to register <span className="font-medium text-foreground">{username}</span> on-chain.
                </p>
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  {error}
                </div>
              )}

              <Button onClick={handleConnectWallet} className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                <Wallet className="h-4 w-4" />
                Connect Wallet
              </Button>

              <button onClick={() => setStep("username")} className="w-full text-center text-xs text-muted-foreground hover:text-foreground">
                Back
              </button>
            </div>
          )}

          {/* Step: Register */}
          {step === "register" && (
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Username</span>
                  </div>
                  <span className="font-mono text-sm text-foreground">{username}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <Wallet className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Wallet</span>
                  </div>
                  <span className="font-mono text-sm text-foreground">
                    {walletAddress ? walletAddress.slice(0, 4) + "..." + walletAddress.slice(-4) : "—"}
                  </span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                You'll be asked to sign a transaction to register your username on the Stellar network. This is a one-time setup.
              </p>

              {error && (
                <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  {error}
                </div>
              )}

              <Button onClick={handleRegister} disabled={loading} className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <GitFork className="h-4 w-4" />}
                {loading ? "Registering..." : "Register on Stellar"}
              </Button>

              <button
                onClick={() => setStep("wallet")}
                disabled={loading}
                className="w-full text-center text-xs text-muted-foreground hover:text-foreground disabled:opacity-50"
              >
                Back
              </button>
            </div>
          )}

          {/* Step: Success */}
          {step === "success" && (
            <div className="space-y-4">
              <div className="flex flex-col items-center gap-3 py-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[hsl(var(--success))]/10">
                  <CheckCircle2 className="h-7 w-7 text-[hsl(var(--success))]" />
                </div>
                <p className="text-center text-sm text-foreground">
                  <span className="font-medium">{username}</span> is registered on Stellar.
                </p>
                <p className="text-center text-xs text-muted-foreground">
                  Your account is ready. You can now set up cascade rules and start receiving payments.
                </p>
              </div>

              <Button
                onClick={() => {
                  router.push("/dashboard")
                  router.refresh()
                }}
                className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Go to Dashboard
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
