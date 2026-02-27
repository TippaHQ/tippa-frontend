"use client"

import { PanelLeft, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSidebar } from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { WalletConnectButton } from "@/components/shared/wallet-button"

export function TopBar() {
  const { toggleSidebar } = useSidebar()

  return (
    <header className="flex h-16 shrink-0 items-center justify-between px-4">
      <Button variant="ghost" size="icon" className="group relative h-9 w-9 hover:bg-primary/10 dark:hover:bg-primary/30" onClick={toggleSidebar}>
        <PanelLeft className="group-hover:text-primary transition-colors" />
        <span className="sr-only">Toggle sidebar</span>
      </Button>

      <div className="flex items-center gap-3">
        <ThemeToggle />
        <NotificationButton />
        <WalletConnectButton />
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
