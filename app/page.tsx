"use client"

import Link from "next/link"
import { GitFork, Wallet, Shield, Zap, ArrowRight, Globe, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { MainHeader } from "@/components/main-header"
import { MainFooter } from "@/components/main-footer"

const features = [
  {
    icon: GitFork,
    title: "Cascading Payments",
    description: "Automatically split incoming payments across your configured recipients.",
  },
  {
    icon: Shield,
    title: "Atomic & Secure",
    description: "All-or-nothing execution. Everyone gets paid or no one does. Keys never leave your wallet.",
  },
  {
    icon: Zap,
    title: "Instant Settlement",
    description: "Built on Stellar. Transactions settle in under 5 seconds with near-zero fees.",
  },
  {
    icon: Globe,
    title: "Full Transparency",
    description: "Every hop in the cascade is verifiable on-chain via StellarExpert.",
  },
]

const steps = [
  {
    step: "01",
    title: "Connect Wallet",
    description: "Sign in with your Stellar wallet",
  },
  {
    step: "02",
    title: "Add Recipients",
    description: "Configure up to 10 payment splits",
  },
  {
    step: "03",
    title: "Share Your Link",
    description: "Get your trytippa.com/d/username URL",
  },
]

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <MainHeader />

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
        <div className="mx-auto max-w-2xl text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span className="text-xs font-medium text-muted-foreground">Built on Stellar Network</span>
          </div>

          <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            When the Root gets paid,
            <br />
            <span className="text-primary">the Foundation gets funded.</span>
          </h1>

          <p className="mx-auto mt-5 max-w-lg text-pretty text-base leading-relaxed text-muted-foreground">
            Tippa automates the trickle-down of value on the Stellar network. Set up cascading payment splits so every contributor in your ecosystem
            gets their share -- instantly and transparently.
          </p>

          {/* Connect CTA */}
          <div className="mt-10 flex flex-col items-center gap-4">
            <Link href="/waitlist">
              <Button size="lg" className="gap-2 bg-primary px-8 text-primary-foreground hover:bg-primary/90">
                <Wallet className="h-5 w-5" />
                Join the Waitlist
              </Button>
            </Link>
            <a
              href="#how-it-works"
              className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              See how it works
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          {/* Trust indicators */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-primary" />
              Non-custodial
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-primary" />
              {"< 5s settlement"}
            </div>
            <div className="flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-primary" />
              On-chain verifiable
            </div>
          </div>
        </div>

        {/* Features */}
        <section id="features" className="mx-auto mt-24 w-full max-w-4xl">
          <h2 className="mb-8 text-center text-xl font-semibold text-foreground">Why Tippa?</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {features.map((f) => (
              <div key={f.title} className="group rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/30">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How it Works */}
        <section id="how-it-works" className="mx-auto mt-24 w-full max-w-3xl">
          <h2 className="mb-8 text-center text-xl font-semibold text-foreground">How it works</h2>
          <div className="flex flex-col gap-4 sm:flex-row">
            {steps.map((s, idx) => (
              <div key={s.step} className="flex flex-1 items-start gap-3 rounded-xl border border-border bg-card p-5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 font-mono text-xs font-bold text-primary">
                  {s.step}
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{s.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{s.description}</p>
                </div>
                {idx < steps.length - 1 && <ChevronRight className="mt-1.5 hidden h-4 w-4 shrink-0 text-muted-foreground sm:block" />}
              </div>
            ))}
          </div>

          {/* Example flow */}
          <div className="mt-8 rounded-xl border border-dashed border-primary/30 bg-primary/5 p-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">Example Flow</p>
            <div className="space-y-2 text-sm leading-relaxed text-muted-foreground">
              <p>
                Bob sends <span className="font-mono font-semibold text-foreground">100 USDC</span> to{" "}
                <span className="font-mono text-primary">trytippa.com/d/alice</span>
              </p>
              <div className="flex flex-col gap-1 pl-4 text-xs">
                <span>
                  Tippa fee: <span className="font-mono text-foreground">0.50 USDC</span>
                </span>
                <span>
                  Alice receives: <span className="font-mono text-foreground">93.50 USDC</span>
                </span>
                <span>
                  Recipient A, B, C each receive: <span className="font-mono text-primary">2.00 USDC</span>
                </span>
              </div>
              <p className="text-xs text-muted-foreground">All executed atomically in a single Stellar multi-op transaction.</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <MainFooter />
    </div>
  )
}
