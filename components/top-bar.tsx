"use client"

import { Bell, Search, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function TopBar() {
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
        {/* Network indicator */}
        <div className="flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-3 py-1.5">
          <div className="h-2 w-2 rounded-full bg-primary" />
          <span className="text-xs font-medium text-foreground">Stellar Mainnet</span>
        </div>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative h-9 w-9 text-muted-foreground hover:text-foreground">
          <Bell className="h-[18px] w-[18px]" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
          <span className="sr-only">Notifications</span>
        </Button>

        {/* User */}
        <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-secondary">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/20 text-xs font-semibold text-primary">AL</AvatarFallback>
          </Avatar>
          <div className="hidden text-left md:block">
            <p className="text-sm font-medium text-foreground">Alice</p>
          </div>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </div>
    </header>
  )
}
