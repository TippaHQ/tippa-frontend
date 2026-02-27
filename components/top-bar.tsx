"use client"

import { toast } from "sonner"
import { Bell, Search, ChevronDown, Wallet, Copy, LogOut } from "lucide-react"

import { getInitials, getWalletShort } from "@/lib/utils"
import { useWallet } from "@/providers/wallet-provider"
import { useUserStore } from "@/lib/store/user-store"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { ProfileAvatar } from "@/components/shared/user-profile"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

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

      <div className="flex items-center gap-3">
        <ThemeToggle />
        <NotificationButton />
        <WalletButton />
        <UserButton />
      </div>
    </header>
  )
}

function NotificationButton() {
  const notifications = []

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="group relative h-9 w-9 hover:bg-primary/10 dark:hover:bg-primary/30">
          <Bell className="group-hover:text-primary transition-colors" />
          {notifications.length > 0 && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />}
          <span className="sr-only">Notifications</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="flex flex-col gap-2 min-h-[100px]">
        {notifications.length === 0 ? <p className="my-auto text-center text-muted-foreground">No notifications</p> : <></>}
      </PopoverContent>
    </Popover>
  )
}

function WalletButton() {
  const { walletAddress, connectWallet, disconnectWallet } = useWallet()

  function handleCopyAddress() {
    if (!walletAddress) return
    navigator.clipboard.writeText(walletAddress)
    toast.success("Address copied to clipboard", {
      position: "top-center",
    })
  }

  if (!walletAddress) {
    return (
      <Button size="sm" onClick={connectWallet} aria-label="Connect Wallet">
        Connect
      </Button>
    )
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" aria-label="Wallet Address" className="group hover:bg-primary/10 dark:hover:bg-primary/30">
          <Wallet className="group-hover:text-primary transition-colors" />
          <span className="group-hover:text-primary transition-colors">{getWalletShort(walletAddress)}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="flex flex-col gap-2">
        <Button variant="outline" size="sm" onClick={handleCopyAddress} aria-label="Copy Wallet Address">
          <Copy />
          Copy address
        </Button>
        <Button variant="outline" size="sm" onClick={disconnectWallet} aria-label="Disconnect Wallet">
          <LogOut />
          Disconnect
        </Button>
      </PopoverContent>
    </Popover>
  )
}

function UserButton() {
  const profile = useUserStore((state) => state.profile)
  const initials = getInitials(profile?.display_name || "User")

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="group flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-primary/10 dark:hover:bg-primary/30">
          <ProfileAvatar variant="small" initials={initials} avatarUrl={profile?.avatar_url} />
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="flex flex-col gap-2"></PopoverContent>
    </Popover>
  )
}
