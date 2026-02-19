"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  GitFork,
  ArrowLeftRight,
  User,
  Wallet,
  ExternalLink,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import type { Profile } from "@/lib/types"

const mainNav = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
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
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)

  useEffect(() => {
    const supabase = createClient()
    const fetchProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single()
        setProfile(data)
      }
    }
    fetchProfile()
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/connect")
    router.refresh()
  }

  const walletShort = profile?.wallet_address
    ? profile.wallet_address.slice(0, 4) + "..." + profile.wallet_address.slice(-4)
    : "No wallet"

  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r border-border bg-sidebar transition-all duration-300",
        collapsed ? "w-[72px]" : "w-64"
      )}
    >
      {/* Logo */}
      <Link
        href="/connect"
        className="flex h-16 items-center gap-3 border-b border-border px-4 transition-opacity hover:opacity-80"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary">
          <GitFork className="h-5 w-5 text-primary-foreground" />
        </div>
        {!collapsed && (
          <span className="text-lg font-semibold tracking-tight text-foreground">
            Tippa
          </span>
        )}
      </Link>

      {/* Wallet Status */}
      {!collapsed && (
        <div className="mx-3 mt-4 rounded-lg border border-border bg-secondary/50 p-3">
          <div className="flex items-center gap-2">
            <div className={cn("h-2 w-2 rounded-full", profile ? "bg-primary" : "bg-muted-foreground")} />
            <span className="text-xs font-medium text-muted-foreground">
              {profile ? "Connected" : "Not connected"}
            </span>
          </div>
          <p className="mt-1.5 truncate font-mono text-xs text-foreground">
            {walletShort}
          </p>
          {profile?.display_name && (
            <p className="mt-1 truncate text-xs text-muted-foreground">
              {profile.display_name}
            </p>
          )}
        </div>
      )}
      {collapsed && (
        <div className="mx-auto mt-4 flex h-9 w-9 items-center justify-center">
          <Wallet className="h-5 w-5 text-primary" />
        </div>
      )}

      {/* Main Navigation */}
      <nav className="mt-6 flex flex-1 flex-col gap-1 px-3">
        <span
          className={cn(
            "mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground",
            collapsed && "sr-only"
          )}
        >
          Menu
        </span>
        {mainNav.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                collapsed && "justify-center px-0"
              )}
            >
              <item.icon className={cn("h-[18px] w-[18px] shrink-0", isActive && "text-primary")} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
        })}

        <div className="my-4 h-px bg-border" />

        <span
          className={cn(
            "mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground",
            collapsed && "sr-only"
          )}
        >
          Support
        </span>
        {secondaryNav.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                collapsed && "justify-center px-0"
              )}
            >
              <item.icon className="h-[18px] w-[18px] shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
        })}

        <div className="flex-1" />

        {/* Tippa Link */}
        {!collapsed && profile?.username && (
          <div className="mb-2 rounded-lg border border-dashed border-primary/30 bg-primary/5 p-3">
            <div className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium text-foreground">Your Tippa Link</span>
            </div>
            <p className="mt-1 truncate font-mono text-xs text-primary">
              tippa.io/{profile.username}
            </p>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className={cn(
            "flex items-center gap-2 rounded-lg py-2.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
            collapsed ? "justify-center px-0" : "px-3"
          )}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span>Sign out</span>}
        </button>

        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="mb-4 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </nav>
    </aside>
  )
}
