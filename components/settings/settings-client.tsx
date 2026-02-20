"use client"

import { Shield, Bell, Globe, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { updateProfile, updateNotificationPreferences } from "@/lib/actions"
import { useRouter } from "next/navigation"
import type { Profile, NotificationPreferences } from "@/lib/types"

interface SettingsClientProps {
  profile: Profile | null
  notifPrefs: NotificationPreferences | null
}

export function SettingsClient({ profile, notifPrefs }: SettingsClientProps) {
  const router = useRouter()

  const handleNotifToggle = async (field: string, checked: boolean) => {
    await updateNotificationPreferences({ [field]: checked })
    router.refresh()
  }

  const handleAssetChange = async (value: string) => {
    await updateProfile({ default_asset: value })
    router.refresh()
  }

  const handleNetworkChange = async (value: string) => {
    const horizon = value === "mainnet" ? "https://horizon.stellar.org" : "https://horizon-testnet.stellar.org"
    await updateProfile({ stellar_network: value, horizon_url: horizon })
    router.refresh()
  }

  const handleFederatedSave = async (value: string) => {
    await updateProfile({ federated_address: value })
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
          <Button variant="outline" size="sm" className="border-border text-xs text-foreground hover:bg-secondary">
            Disconnect
          </Button>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div>
            <Label className="mb-1.5 text-xs text-muted-foreground">Federated Address</Label>
            <div className="relative">
              <Input
                defaultValue={profile?.federated_address ?? ""}
                onBlur={(e) => handleFederatedSave(e.target.value)}
                className="h-9 border-border bg-secondary/50 pr-24 text-sm text-foreground focus-visible:ring-primary"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">*tippa.io</span>
            </div>
          </div>
          <div>
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
              desc: "When a payment is successfully split to all dependencies",
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

      {/* Network */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <Globe className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Network</h3>
            <p className="text-xs text-muted-foreground">Stellar network settings</p>
          </div>
        </div>
        <div className="space-y-3">
          <div>
            <Label className="mb-1.5 text-xs text-muted-foreground">Network</Label>
            <Select defaultValue={profile?.stellar_network ?? "mainnet"} onValueChange={handleNetworkChange}>
              <SelectTrigger className="h-9 border-border bg-secondary/50 text-sm text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-border bg-popover">
                <SelectItem value="mainnet">Stellar Mainnet</SelectItem>
                <SelectItem value="testnet">Stellar Testnet</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-1.5 text-xs text-muted-foreground">Horizon URL</Label>
            <Input
              value={profile?.horizon_url ?? "https://horizon.stellar.org"}
              className="h-9 border-border bg-secondary/50 font-mono text-sm text-foreground focus-visible:ring-primary"
              readOnly
            />
          </div>
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
