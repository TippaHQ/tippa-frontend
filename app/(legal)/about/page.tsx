import { LegalLayout } from "@/components/shared/legal-layout"
import { Shield, GitFork, Heart } from "lucide-react"

export const metadata = {
  title: "About Tippa | Cascading Payments on Stellar",
  description: "Learn more about Tippa's mission to automatically route value to creators and maintainers on the Stellar network.",
}

export default function AboutPage() {
  return (
    <LegalLayout title="About Tippa">
      <p className="text-lg font-medium text-foreground">When the root gets paid, the foundation gets funded.</p>

      <div className="my-10 grid gap-6 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <GitFork className="h-5 w-5 text-primary" />
          </div>
          <h3 className="mb-2 font-semibold text-foreground">Cascading Value</h3>
          <p className="text-sm">
            We believe value should flow effortlessly to those who create it. Set up splits and let the protocol handle the rest.
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <h3 className="mb-2 font-semibold text-foreground">Non-Custodial</h3>
          <p className="text-sm">We never hold your funds. Everything settles directly to your wallet in seconds on the Stellar network.</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Heart className="h-5 w-5 text-primary" />
          </div>
          <h3 className="mb-2 font-semibold text-foreground">Open Ecosystem</h3>
          <p className="text-sm">Built to fund open source, empower creators, and enable composable monetization across the web.</p>
        </div>
      </div>

      <h2 className="mt-8 text-xl font-semibold text-foreground">Our Mission</h2>
      <p>
        Tippa was built to solve a simple problem: the people who create the foundational tools and content we all rely on are often the last to be
        compensated.
      </p>
      <p>
        By enabling seamless, transparent, and atomic cascading payments, Tippa ensures that every time value enters the system, it trickles down
        appropriately to the dependencies, maintainers, and creators who made it possible.
      </p>

      <h2 className="mt-8 text-xl font-semibold text-foreground">Powered by Stellar</h2>
      <p>
        We chose the Stellar network and Soroban smart contracts because they offer the speed (sub-5 second finality), low fees (fractions of a cent),
        and security needed to make cascading micro-payments viable at scale.
      </p>
    </LegalLayout>
  )
}
