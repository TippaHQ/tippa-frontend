"use client"

import { useState, useTransition } from "react"
import { Camera, Github, Globe, Twitter, Loader2 } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { updateProfile } from "@/lib/actions"
import { useRouter } from "next/navigation"
import type { Profile } from "@/lib/types"

interface ProfileCardProps {
  profile: Profile | null
}

export function ProfileCard({ profile }: ProfileCardProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const [displayName, setDisplayName] = useState(profile?.display_name ?? "")
  const [bio, setBio] = useState(profile?.bio ?? "")
  const [github, setGithub] = useState(profile?.github ?? "")
  const [twitter, setTwitter] = useState(profile?.twitter ?? "")
  const [website, setWebsite] = useState(profile?.website ?? "")

  const initials = displayName
    ? displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?"

  const handleSave = () => {
    setMessage(null)
    startTransition(async () => {
      const result = await updateProfile({
        display_name: displayName,
        bio,
        github,
        twitter,
        website,
      })
      if (result.error) {
        setMessage({ type: "error", text: result.error })
      } else {
        setMessage({ type: "success", text: "Profile saved!" })
        router.refresh()
      }
    })
  }

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="relative h-32 rounded-t-xl bg-gradient-to-r from-primary/20 via-[hsl(var(--chart-2))]/20 to-primary/10">
        <button
          className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-lg bg-background/80 px-3 py-1.5 text-xs text-foreground backdrop-blur-sm transition-colors hover:bg-background"
          aria-label="Change banner"
        >
          <Camera className="h-3.5 w-3.5" />
          Change
        </button>
      </div>

      <div className="relative px-5 pb-5">
        <div className="relative -mt-10 mb-5 flex items-end gap-4">
          <Avatar className="h-20 w-20 border-4 border-card">
            <AvatarFallback className="bg-primary/20 text-xl font-semibold text-primary">{initials}</AvatarFallback>
          </Avatar>
          <div className="mb-1">
            <h3 className="text-lg font-semibold text-foreground">{displayName || "Your Name"}</h3>
            <p className="font-mono text-xs text-muted-foreground">
              {profile?.wallet_address ? profile.wallet_address.slice(0, 4) + "..." + profile.wallet_address.slice(-4) : "No wallet connected"}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label className="mb-1.5 text-xs text-muted-foreground">Display Name</Label>
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="h-9 border-border bg-secondary/50 text-sm text-foreground focus-visible:ring-primary"
              />
            </div>
            <div>
              <Label className="mb-1.5 text-xs text-muted-foreground">Username</Label>
              <Input
                value={profile?.username ?? ""}
                readOnly
                className="h-9 cursor-default border-border bg-secondary/30 text-sm text-muted-foreground focus-visible:ring-0"
              />
              {profile?.username && (
                <p className="mt-1.5 font-mono text-xs text-muted-foreground">
                  trytippa.com/d/<span className="text-foreground">{profile.username}</span>
                </p>
              )}
            </div>
          </div>

          <div>
            <Label className="mb-1.5 text-xs text-muted-foreground">Bio</Label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell others about yourself..."
              className="min-h-[80px] resize-none border-border bg-secondary/50 text-sm text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-primary"
            />
          </div>

          <div>
            <Label className="mb-1.5 text-xs text-muted-foreground">Social Links</Label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="relative">
                <Github className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                  placeholder="GitHub"
                  className="h-9 border-border bg-secondary/50 pl-9 text-sm text-foreground focus-visible:ring-primary"
                />
              </div>
              <div className="relative">
                <Twitter className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={twitter}
                  onChange={(e) => setTwitter(e.target.value)}
                  placeholder="Twitter"
                  className="h-9 border-border bg-secondary/50 pl-9 text-sm text-foreground focus-visible:ring-primary"
                />
              </div>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="Website"
                  className="h-9 border-border bg-secondary/50 pl-9 text-sm text-foreground focus-visible:ring-primary"
                />
              </div>
            </div>
          </div>

          {message && (
            <div
              className={
                message.type === "error"
                  ? "rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive"
                  : "rounded-lg bg-[hsl(var(--success))]/10 px-3 py-2 text-xs text-[hsl(var(--success))]"
              }
            >
              {message.text}
            </div>
          )}

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isPending} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Save Profile
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
