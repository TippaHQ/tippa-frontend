import Link from "next/link"
import { AppLogo } from "@/components/shared/app-logo"

export default function DonateNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <AppLogo hideTitle />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">User not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">This Tippa profile doesn&apos;t exist or hasn&apos;t been set up yet.</p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Go to Tippa
        </Link>
      </div>
    </div>
  )
}
