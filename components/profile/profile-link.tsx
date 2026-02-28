"use client"

import { encodeQR } from "qr"
import { svgToPng } from "qr/dom.js"
import { toast } from "sonner"
import { useMemo, useState } from "react"
import { Copy, Check, ExternalLink, QrCode, Share2, Twitter, Facebook, Linkedin, Download } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

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
    toast.success("Link copied to clipboard")
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

      <div className="mt-4 grid grid-cols-2 gap-3">
        <QRCodeButton link={link} />
        <ShareButton link={link} />
      </div>
    </div>
  )
}

function QRCodeButton({ link }: { link: string }) {
  const qrCodeSvg = useMemo(() => encodeQR(link, "svg"), [link])

  async function handleDownload() {
    const pngImage = await svgToPng(qrCodeSvg, 512, 512) // Base64 encoded png
    const a = document.createElement("a")
    a.href = pngImage
    a.download = "tippa-user-link.png"
    a.click()
    a.remove()
    toast.success("QR code downloaded")
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="flex flex-col items-center gap-2 rounded-lg border border-border bg-secondary/30 py-3 text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary">
          <QrCode className="h-5 w-5" />
          <span className="text-xs font-medium">QR Code</span>
        </button>
      </PopoverTrigger>
      <PopoverContent sideOffset={5}>
        <div dangerouslySetInnerHTML={{ __html: qrCodeSvg }} />
        <button
          onClick={handleDownload}
          className="flex justify-center items-center gap-2 mt-2 w-full text-muted-foreground transition-colors hover:text-primary"
        >
          <Download className="h-5 w-5" />
          <span className="text-sm font-medium">Download</span>
        </button>
      </PopoverContent>
    </Popover>
  )
}

function ShareButton({ link }: { link: string }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="flex flex-col items-center gap-2 rounded-lg border border-border bg-secondary/30 py-3 text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary">
          <Share2 className="h-5 w-5" />
          <span className="text-xs font-medium">Share</span>
        </button>
      </PopoverTrigger>
      <PopoverContent sideOffset={5}>
        <div className="flex items-center justify-around">
          <a
            href={`https://twitter.com/intent/tweet?text=Check out my profile on TryTippa! ${link}`}
            target="_blank"
            className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary"
          >
            <Twitter className="h-5 w-5" />
            <span className="text-xs font-medium">Twitter</span>
          </a>
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${link}`}
            target="_blank"
            className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary"
          >
            <Facebook className="h-5 w-5" />
            <span className="text-xs font-medium">Facebook</span>
          </a>
          <a
            href={`https://www.linkedin.com/shareArticle?mini=true&url=${link}`}
            target="_blank"
            className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary"
          >
            <Linkedin className="h-5 w-5" />
            <span className="text-xs font-medium">LinkedIn</span>
          </a>
        </div>
      </PopoverContent>
    </Popover>
  )
}
