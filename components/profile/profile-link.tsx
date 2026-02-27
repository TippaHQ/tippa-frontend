"use client"

import { useState } from "react"
import { Copy, Check, ExternalLink, QrCode, Share2, Code2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ProfileLinkProps {
  username: string | null
}

export function ProfileLink({ username }: ProfileLinkProps) {
  const [copied, setCopied] = useState(false)
  const link = `trytippa.com/d/${username ?? "me"}`

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
          <p className="mt-0.5 text-xs text-muted-foreground">Share this link to receive payments through your cascade</p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10">
          <ExternalLink className="h-4 w-4 text-primary" />
        </div>
        <span className="flex-1 truncate font-mono text-sm font-medium text-primary">{link}</span>
        <Button variant="ghost" size="sm" onClick={handleCopy} className="h-8 gap-1.5 text-xs text-primary hover:bg-primary/10 hover:text-primary">
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
          <Code2 className="h-5 w-5" />
          <span className="text-xs font-medium">Embed</span>
        </button>
      </div>
    </div>
  )
}
