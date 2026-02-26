"use client"

import { Bell, Search, ChevronDown, Wallet } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { ProfileAvatar } from "@/components/shared/user-profile"
import { getInitials, getWalletShort } from "@/lib/utils"
import { useUserStore } from "@/lib/store/user-store"

export function TopBar() {
  const profile = useUserStore((state) => state.profile)
  const displayName = profile?.display_name || "User"
  const initials = getInitials(displayName)
  const walletShort = getWalletShort(profile?.wallet_address)

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-background px-6">
      {/* Search */}
      <div className="relative w-full max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search transactions, addresses..."
          className="h-9 border-border bg-secondary/50 pl-9 text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
        />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Wallet indicator */}
        {walletShort ? (
          <div className="flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-3 py-1.5">
            <Wallet className="h-3.5 w-3.5 text-primary" />
            <span className="font-mono text-xs font-medium text-foreground">{walletShort}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-3 py-1.5">
            <div className="h-2 w-2 rounded-full bg-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">No wallet</span>
          </div>
        )}

        {/* Theme toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative h-9 w-9 text-muted-foreground hover:text-foreground">
          <Bell className="h-[18px] w-[18px]" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
          <span className="sr-only">Notifications</span>
        </Button>

        {/* User */}
        <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-secondary">
          <ProfileAvatar variant="small" initials={initials} avatarUrl={profile?.avatar_url ?? ""} />
          <div className="hidden text-left md:block">
            <p className="text-sm font-medium text-foreground">{displayName}</p>
          </div>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </div>
    </header>
  )
}
