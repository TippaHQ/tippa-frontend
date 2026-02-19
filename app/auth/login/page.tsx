"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { GitFork, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push("/dashboard")
      router.refresh()
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
            <GitFork className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Welcome back
          </h1>
          <p className="text-sm text-muted-foreground">Sign in to your Tippa account</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
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
            <Label className="mb-1.5 text-xs text-muted-foreground">Password</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              required
              className="h-10 border-border bg-secondary/50 text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-primary"
            />
          </div>

          {error && (
            <div className="rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Sign In
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          {"Don't have an account? "}
          <Link
            href="/auth/sign-up"
            className="font-medium text-primary hover:text-primary/80"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
