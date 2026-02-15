"use client"

import { Camera, Github, Globe, Twitter } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export function ProfileCard() {
  return (
    <div className="rounded-xl border border-border bg-card">
      {/* Banner */}
      <div className="relative h-32 rounded-t-xl bg-gradient-to-r from-primary/20 via-[hsl(var(--chart-2))]/20 to-primary/10">
        <button
          className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-lg bg-background/80 px-3 py-1.5 text-xs text-foreground backdrop-blur-sm transition-colors hover:bg-background"
          aria-label="Change banner"
        >
          <Camera className="h-3.5 w-3.5" />
          Change
        </button>
      </div>

      {/* Avatar + Form */}
      <div className="relative px-5 pb-5">
        <div className="relative -mt-10 mb-5 flex items-end gap-4">
          <Avatar className="h-20 w-20 border-4 border-card">
            <AvatarFallback className="bg-primary/20 text-xl font-semibold text-primary">
              AL
            </AvatarFallback>
          </Avatar>
          <div className="mb-1">
            <h3 className="text-lg font-semibold text-foreground">Alice</h3>
            <p className="font-mono text-xs text-muted-foreground">GBXK...7HQF</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label className="mb-1.5 text-xs text-muted-foreground">Display Name</Label>
              <Input
                defaultValue="Alice"
                className="h-9 border-border bg-secondary/50 text-sm text-foreground focus-visible:ring-primary"
              />
            </div>
            <div>
              <Label className="mb-1.5 text-xs text-muted-foreground">Username</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  tippa.io/
                </span>
                <Input
                  defaultValue="alice"
                  className="h-9 border-border bg-secondary/50 pl-16 text-sm text-foreground focus-visible:ring-primary"
                />
              </div>
            </div>
          </div>

          <div>
            <Label className="mb-1.5 text-xs text-muted-foreground">Bio</Label>
            <Textarea
              defaultValue="Open-source maintainer building tools for the Stellar ecosystem. Every contribution matters."
              className="min-h-[80px] resize-none border-border bg-secondary/50 text-sm text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-primary"
            />
          </div>

          <div>
            <Label className="mb-1.5 text-xs text-muted-foreground">Social Links</Label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="relative">
                <Github className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  defaultValue="alice-dev"
                  placeholder="GitHub"
                  className="h-9 border-border bg-secondary/50 pl-9 text-sm text-foreground focus-visible:ring-primary"
                />
              </div>
              <div className="relative">
                <Twitter className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  defaultValue="@alice_stellar"
                  placeholder="Twitter"
                  className="h-9 border-border bg-secondary/50 pl-9 text-sm text-foreground focus-visible:ring-primary"
                />
              </div>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  defaultValue="alice.dev"
                  placeholder="Website"
                  className="h-9 border-border bg-secondary/50 pl-9 text-sm text-foreground focus-visible:ring-primary"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
              Save Profile
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
