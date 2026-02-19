"use client"

import { useState } from "react"
import { Copy, Check, ExternalLink, QrCode, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ProfileLinkProps {
  username: string | null
}

export function ProfileLink({ username }: ProfileLinkProps) {
  const [copied, setCopied] = useState(false)
  const link = `tippa.io/${username ?? "me"}`

  const handleCopy = () => {
    navigator.clipboard.writeText(`https://${link}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Discovery Link</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Share this link to receive payments through your cascade
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10">
          <ExternalLink className="h-4 w-4 text-primary" />
        </div>
        <span className="flex-1 truncate font-mono text-sm font-medium text-primary">
          {link}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-8 gap-1.5 text-xs text-primary hover:bg-primary/10 hover:text-primary"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              Copy
            </>
          )}
        </Button>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <button className="flex flex-col items-center gap-2 rounded-lg border border-border bg-secondary/30 py-3 text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary">
          <QrCode className="h-5 w-5" />
          <span className="text-xs font-medium">QR Code</span>
        </button>
        <button className="flex flex-col items-center gap-2 rounded-lg border border-border bg-secondary/30 py-3 text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary">
          <Share2 className="h-5 w-5" />
          <span className="text-xs font-medium">Share</span>
        </button>
        <button className="flex flex-col items-center gap-2 rounded-lg border border-border bg-secondary/30 py-3 text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary">
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
          <span className="text-xs font-medium">GitHub Badge</span>
        </button>
      </div>

      <div className="mt-4">
        <p className="mb-1.5 text-xs text-muted-foreground">Embed Badge</p>
        <div className="rounded-lg border border-border bg-secondary/30 p-3">
          <code className="break-all font-mono text-xs text-muted-foreground">
            {`<a href="https://tippa.io/${username ?? "me"}"><img src="https://tippa.io/badge/${username ?? "me"}.svg" alt="Tip ${username ?? "me"} on Tippa" /></a>`}
          </code>
        </div>
      </div>
    </div>
  )
}
