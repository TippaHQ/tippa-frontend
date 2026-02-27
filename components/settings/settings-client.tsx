"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Shield, Bell, Trash2, Sun, Moon, Monitor } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { updateProfile, updateNotificationPreferences } from "@/lib/actions"
import type { Profile, NotificationPreferences } from "@/lib/types"

interface SettingsClientProps {
  profile: Profile | null
  notifPrefs: NotificationPreferences | null
}

export function SettingsClient({ profile, notifPrefs }: SettingsClientProps) {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  async function handleNotifToggle(field: string, checked: boolean) {
    await updateNotificationPreferences({ [field]: checked })
    router.refresh()
  }

  async function handleAssetChange(value: string) {
    await updateProfile({ default_asset: value })
    router.refresh()
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your account preferences and security</p>
      </div>

      {/* Wallet */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <Shield className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Wallet Connection</h3>
            <p className="text-xs text-muted-foreground">Your connected Stellar wallet</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-border bg-secondary/20 p-3">
          <div className="h-2.5 w-2.5 rounded-full bg-primary" />
          <span className="flex-1 truncate font-mono text-sm text-foreground">{profile?.wallet_address || "No wallet connected"}</span>
        </div>
        <div className="mt-3">
          <Label className="mb-1.5 text-xs text-muted-foreground">Default Asset</Label>
          <Select defaultValue={profile?.default_asset ?? "USDC"} onValueChange={handleAssetChange}>
            <SelectTrigger className="h-9 border-border bg-secondary/50 text-sm text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-border bg-popover">
              <SelectItem value="USDC">USDC</SelectItem>
              <SelectItem value="XLM">XLM</SelectItem>
              <SelectItem value="ARS">ARS</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Theme */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <Sun className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Appearance</h3>
            <p className="text-xs text-muted-foreground">Choose how Tippa looks for you</p>
          </div>
        </div>
        {mounted && (
          <div className="grid grid-cols-3 gap-3">
            {(
              [
                { value: "light", icon: Sun, label: "Light" },
                { value: "dark", icon: Moon, label: "Dark" },
                { value: "system", icon: Monitor, label: "System" },
              ] as const
            ).map((opt) => (
              <button
                key={opt.value}
                onClick={() => setTheme(opt.value)}
                className={`flex flex-col items-center gap-2 rounded-lg border p-4 transition-colors ${
                  theme === opt.value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-secondary/20 text-muted-foreground hover:border-primary/50 hover:text-foreground"
                }`}
              >
                <opt.icon className="h-5 w-5" />
                <span className="text-xs font-medium">{opt.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Notifications */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <Bell className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
            <p className="text-xs text-muted-foreground">Choose what alerts you receive</p>
          </div>
        </div>
        <div className="space-y-3">
          {[
            {
              field: "payment_received",
              label: "Payment Received",
              desc: "When someone sends a payment to your Tippa link",
              value: notifPrefs?.payment_received,
            },
            {
              field: "cascade_completed",
              label: "Cascade Completed",
              desc: "When a payment is successfully split to all recipients",
              value: notifPrefs?.cascade_completed,
            },
            {
              field: "failed_transactions",
              label: "Failed Transactions",
              desc: "When a cascade fails or hits the minimum threshold",
              value: notifPrefs?.failed_transactions,
            },
            {
              field: "profile_views_digest",
              label: "Profile Views",
              desc: "Weekly digest of profile view analytics",
              value: notifPrefs?.profile_views_digest,
            },
          ].map((n) => (
            <div key={n.field} className="flex items-center justify-between rounded-lg border border-border bg-secondary/20 p-3">
              <div>
                <p className="text-sm font-medium text-foreground">{n.label}</p>
                <p className="text-xs text-muted-foreground">{n.desc}</p>
              </div>
              <Switch
                defaultChecked={n.value ?? true}
                onCheckedChange={(checked) => handleNotifToggle(n.field, checked)}
                className="data-[state=checked]:bg-primary"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-destructive/10">
            <Trash2 className="h-4 w-4 text-destructive" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Danger Zone</h3>
            <p className="text-xs text-muted-foreground">Irreversible actions for your account</p>
          </div>
        </div>
        <div className="flex items-center justify-between rounded-lg border border-destructive/20 bg-background/50 p-3">
          <div>
            <p className="text-sm font-medium text-foreground">Delete Account</p>
            <p className="text-xs text-muted-foreground">Remove your Tippa profile and all cascade configurations</p>
          </div>
          <Button variant="outline" size="sm" className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive">
            Delete
          </Button>
        </div>
      </div>
    </div>
  )
}
