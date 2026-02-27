"use client"

import { ChevronsUpDown, LogOut } from "lucide-react"
import { getInitials } from "@/lib/utils"
import { useUserStore } from "@/lib/store/user-store"

import { Skeleton } from "@/components/ui/skeleton"
import { ProfileAvatar } from "@/components/shared/user-profile"
import { SidebarMenuButton, useSidebar } from "@/components/ui/sidebar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function UserProfileButton() {
  const { isMobile } = useSidebar()
  const profile = useUserStore((state) => state.profile)
  const signOut = useUserStore((state) => state.signOut)
  const initials = getInitials(profile?.display_name || "User")

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 w-full" asChild>
        <SidebarMenuButton size="lg" tooltip={profile?.username ?? "Profile"}>
          <div className="grow flex items-center gap-2">
            <ProfileAvatar variant="small" initials={initials} avatarUrl={profile?.avatar_url} />
            <div className="flex flex-col items-start min-w-0">
              {profile ? (
                <>
                  <span className="truncate text-sm font-medium leading-none">{profile?.display_name}</span>
                  <span className="ml-0.5 truncate text-xs text-muted-foreground">{profile?.username}</span>
                </>
              ) : (
                <>
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="mt-1 h-2 w-16" />
                </>
              )}
            </div>
          </div>
          <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground" />
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent side={isMobile ? "bottom" : "right"} align="end" className="flex flex-col gap-2">
        <DropdownMenuItem variant="destructive" onClick={signOut} aria-label="Sign out">
          <LogOut />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
