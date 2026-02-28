"use client"

import Link from "next/link"
import { toast } from "sonner"
import { useState } from "react"
import { Loader2, CheckCircle2, Users, Hash } from "lucide-react"
import { joinWaitlist, getWaitlistPosition } from "@/lib/actions"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { AppLogo } from "@/components/shared/app-logo"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const roles = [
  { value: "founder", label: "Founder" },
  { value: "maintainer", label: "Maintainer" },
  { value: "developer", label: "Developer" },
  { value: "creator", label: "Creator" },
  { value: "other", label: "Other" },
]

export default function WaitlistPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [role, setRole] = useState("")
  const [loading, setLoading] = useState(false)
  const [joined, setJoined] = useState(false)
  const [position, setPosition] = useState<{ position: number; total: number } | null>(null)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const { status, error } = await joinWaitlist(email, name, role || undefined)

    if (status === "ERROR" && error) {
      setError(error)
      setLoading(false)
      return
    }

    if (status === "EXISTING") {
      toast.info(error, { position: "top-center" })
      setLoading(false)
      return
    }

    const pos = await getWaitlistPosition(email)
    setPosition(pos)
    setJoined(true)
    setLoading(false)
    toast.success("You're on the list!", { position: "top-center" })
  }

  if (joined && position) {
    return (
      <div className="w-full max-w-sm text-center -mt-16">
        <div className="flex items-center justify-center mb-6 mx-auto h-16 w-16 rounded-full bg-primary/10">
          <CheckCircle2 className="h-8 w-8 text-primary" />
        </div>

        <h1 className="text-2xl font-semibold tracking-tight text-foreground">You're on the waitlist!</h1>

        <p className="mt-3 text-sm text-muted-foreground">
          We'll notify you at <strong className="text-foreground">{email}</strong> when spots open up.
        </p>

        <div className="mt-8 flex items-center justify-center gap-6">
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2 text-2xl font-bold text-primary">
              <Hash className="h-5 w-5" />
              {position.position}
            </div>
            <span className="text-xs text-muted-foreground">Your position</span>
          </div>
          <div className="h-10 w-px bg-border" />
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2 text-2xl font-bold text-foreground">
              <Users className="h-5 w-5" />
              {position.total}
            </div>
            <span className="text-xs text-muted-foreground">Already on the list</span>
          </div>
        </div>

        <div className="mt-10 rounded-xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">
            In the meantime, follow us on{" "}
            <a href="https://x.com/trytippa" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              X
            </a>{" "}
            for updates.
          </p>
        </div>

        <Link href="/" className="mt-8 inline-block">
          <Button variant="outline" className="border-border">
            Back to Home
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm space-y-6 -mt-16">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-3 py-1">
          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
          <span className="text-xs font-medium text-muted-foreground">Limited Access</span>
        </div>
        <AppLogo hideTitle size="lg" />
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Join the Waitlist</h1>
        <p className="text-sm text-muted-foreground">
          Sign-ups are currently limited. <br />
          Get early access when spots open up.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label className="mb-1.5 text-xs text-muted-foreground">Name</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            required
            className="h-10 border-border bg-secondary/50 text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-primary"
          />
        </div>

        <div>
          <Label className="mb-1.5 text-xs text-muted-foreground">Email</Label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="h-10 border-border bg-secondary/50 text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-primary"
          />
        </div>

        <div>
          <Label className="mb-1.5 text-xs text-muted-foreground">Role (optional)</Label>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger className="h-10 border-border bg-secondary/50 text-foreground focus-visible:ring-primary">
              <SelectValue placeholder="Select your role" />
            </SelectTrigger>
            <SelectContent>
              {roles.map((r) => (
                <SelectItem key={r.value} value={r.value}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {error && <div className="rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">{error}</div>}

        <Button type="submit" disabled={loading} className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Join the Waitlist
        </Button>
      </form>
    </div>
  )
}
