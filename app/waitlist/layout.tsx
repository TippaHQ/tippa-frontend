"use client"

import Link from "next/link"
import { AppLogo } from "@/components/shared/app-logo"
import { ThemeToggle } from "@/components/theme-toggle"

export default function WaitlistLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center justify-between p-4">
        <Link href="/">
          <AppLogo />
        </Link>
        <ThemeToggle />
      </header>
      <main className="flex flex-1 flex-col items-center justify-center px-6">{children}</main>
    </div>
  )
}
