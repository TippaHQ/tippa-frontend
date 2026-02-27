"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, GitFork, ArrowLeftRight, User, ExternalLink, Settings, HelpCircle, Wallet } from "lucide-react"
import { useUserStore } from "@/lib/store/user-store"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { UserProfileButton } from "@/components/shared/user-button"

const mainNav = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Funds", href: "/dashboard/funds", icon: Wallet },
  { label: "Cascades", href: "/dashboard/cascades", icon: GitFork },
  { label: "Transactions", href: "/dashboard/transactions", icon: ArrowLeftRight },
  { label: "Profile", href: "/dashboard/profile", icon: User },
]

const secondaryNav = [
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
  { label: "Help", href: "/dashboard/help", icon: HelpCircle },
]

export function AppSidebar() {
  const pathname = usePathname()
  const profile = useUserStore((state) => state.profile)

  return (
    <Sidebar collapsible="icon">
      {/* Logo / Brand */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild tooltip="Tippa">
              <Link href="/">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
                  <GitFork className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="text-base font-semibold tracking-tight">Tippa</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={pathname === item.href} tooltip={item.label}>
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Support navigation */}
        <SidebarGroup className="overflow-x-hidden">
          <SidebarGroupLabel>Support</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {secondaryNav.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={pathname === item.href} tooltip={item.label}>
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer — user info + logout */}
      <SidebarFooter>
        {profile?.username && (
          <SidebarMenu>
            <SidebarMenuItem>
              <Link
                href={`${process.env.NEXT_PUBLIC_APPLICATION_URL}/d/${profile.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-md border-2 border-dashed border-primary/30 bg-primary/5 p-3 text-xs transition-all hover:bg-primary/10 group-data-[collapsible=icon]:hidden"
              >
                <ExternalLink className="h-4 w-4 shrink-0 text-primary" />
                <div className="min-w-0">
                  <p className="truncate font-semibold text-foreground">Your Tippa Link</p>
                  <p className="truncate font-mono text-primary">trytippa.com/d/{profile.username}</p>
                </div>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
        <SidebarSeparator />
        <SidebarMenu>
          <SidebarMenuItem>
            <UserProfileButton />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
