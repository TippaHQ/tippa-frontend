"use client"

import Link from "next/link"
import { AppLogo } from "@/components/shared/app-logo"
import { ThemeToggle } from "@/components/theme-toggle"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-background p-4">
      <header className="flex items-center justify-between">
        <Link href="/">
          <AppLogo />
        </Link>
        <ThemeToggle />
      </header>
      <main className="grow flex flex-col items-center justify-center bg-background">{children}</main>
    </div>
  )
}
