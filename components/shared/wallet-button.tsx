"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Wallet, Copy, LogOut } from "lucide-react"
import { useWallet } from "@/providers/wallet-provider"
import { useIsMobile } from "@/hooks/use-mobile"
import { getWalletShort } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function WalletConnectButton() {
  const [mounted, setMounted] = useState(false)
  const isMobile = useIsMobile()
  const { walletAddress, connectWallet, disconnectWallet } = useWallet()

  useEffect(() => {
    setMounted(true)
  }, [])

  function handleCopyAddress() {
    if (!walletAddress) return
    navigator.clipboard.writeText(walletAddress)
    toast.success("Address copied to clipboard", {
      position: "top-center",
    })
  }

  if (!mounted) {
    return (
      <Button size="sm" variant="outline" className="opacity-0" aria-hidden="true">
        Connect
      </Button>
    )
  }

  if (!walletAddress) {
    return (
      <Button size="sm" onClick={connectWallet} aria-label="Connect Wallet">
        Connect
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" aria-label="Wallet Address" className="group hover:bg-primary/10 dark:hover:bg-primary/30">
          <Wallet className="group-hover:text-primary transition-colors" />
          {!isMobile && <span className="group-hover:text-primary transition-colors">{getWalletShort(walletAddress)}</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuGroup>
          <DropdownMenuLabel>Wallet Options</DropdownMenuLabel>
          <DropdownMenuItem onClick={handleCopyAddress} aria-label="Copy Wallet Address">
            <Copy />
            Copy address
          </DropdownMenuItem>
          <DropdownMenuItem onClick={disconnectWallet} aria-label="Disconnect Wallet" variant="destructive">
            <LogOut />
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
