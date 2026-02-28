import Link from "next/link"
import { IS_SIGNUP_ENABLED } from "@/lib/constants/flags"
import { useUserStore } from "@/lib/store/user-store"

import { ThemeToggle } from "@/components/theme-toggle"
import { AppLogo } from "@/components/shared/app-logo"
import { Button } from "@/components/ui/button"

export function MainHeader() {
  const isAuthenticated = useUserStore((state) => state.isAuthenticated)

  return (
    <header className="flex items-center justify-between p-4">
      <Link href="/">
        <AppLogo />
      </Link>
      <nav className="hidden items-center gap-6 md:flex">
        <a href="/#features" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
          Features
        </a>
        <a href="/#how-it-works" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
          How it works
        </a>
        <a
          href="https://stellar.org"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          Stellar Network
        </a>
      </nav>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        {isAuthenticated ? (
          <Link href="/dashboard">
            <Button size="sm">Dashboard</Button>
          </Link>
        ) : (
          <>
            <Link href="/auth/login">
              <Button size="sm" variant="outline">
                Login
              </Button>
            </Link>
            {IS_SIGNUP_ENABLED && (
              <Link href="/auth/sign-up">
                <Button size="sm">Sign Up</Button>
              </Link>
            )}
          </>
        )}
      </div>
    </header>
  )
}
