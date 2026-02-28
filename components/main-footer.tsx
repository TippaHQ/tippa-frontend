import Link from "next/link"
import { AppLogo } from "@/components/shared/app-logo"

export function MainFooter() {
  return (
    <footer className="border-t border-border bg-card px-6 py-12">
      <div className="mx-auto flex max-w-2xl flex-col items-center justify-between gap-6 sm:flex-row">
        <div className="flex items-center gap-2">
          <AppLogo hideTitle />
          <span className="text-sm font-medium text-foreground">Tippa</span>
        </div>
        <div className="flex gap-6 text-sm text-muted-foreground">
          <Link href="/about" className="hover:text-foreground">
            About
          </Link>
          <Link href="/contact" className="hover:text-foreground">
            Contact
          </Link>
          <Link href="/privacy" className="hover:text-foreground">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-foreground">
            Terms of Service
          </Link>
        </div>
      </div>
      <div className="mx-auto mt-8 max-w-4xl text-center text-xs text-muted-foreground">
        Tippa is a non-custodial interface. All signing happens client-side via your Stellar wallet.
        <br />
        &copy; {new Date().getFullYear()} Tippa. All rights reserved.
      </div>
    </footer>
  )
}
