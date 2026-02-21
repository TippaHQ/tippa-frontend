"use client"

import { useState, useEffect } from "react"
import { Bell, Search, ChevronDown, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { createClient } from "@/lib/supabase/client"
import type { Profile } from "@/lib/types"

export function TopBar() {
  const [profile, setProfile] = useState<Profile | null>(null)

  useEffect(() => {
    const supabase = createClient()
    const fetchProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single()
        setProfile(data)
      }
    }
    fetchProfile()
  }, [])

  const displayName = profile?.display_name || "User"
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  const walletShort = profile?.wallet_address ? profile.wallet_address.slice(0, 4) + "..." + profile.wallet_address.slice(-4) : null

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
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/20 text-xs font-semibold text-primary">{initials}</AvatarFallback>
          </Avatar>
          <div className="hidden text-left md:block">
            <p className="text-sm font-medium text-foreground">{displayName}</p>
          </div>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </div>
    </header>
  )
}
