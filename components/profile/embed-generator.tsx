"use client"

import { useState } from "react"
import { Code2, Globe, Github, Copy, Check } from "lucide-react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/* ------------------------------------------------------------------ */
/*  CodeBlock                                                          */
/* ------------------------------------------------------------------ */

interface CodeBlockProps {
  code: string
  language?: string
}

function CodeBlock({ code, language = "html" }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <div className="flex items-center justify-between bg-secondary/50 px-4 py-2">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {language}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
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
      <pre className="overflow-x-auto p-4">
        <code className="break-all font-mono text-xs text-muted-foreground">
          {code}
        </code>
      </pre>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  ButtonTab                                                          */
/* ------------------------------------------------------------------ */

type ButtonStyle = "pill" | "rectangle" | "minimal"
type ButtonTheme = "dark" | "light" | "teal"
type ButtonSize = "small" | "medium" | "large"

const THEMES: Record<ButtonTheme, { label: string; bg: string; text: string; border?: string; swatch: string }> = {
  dark:  { label: "Dark",  bg: "#0a0a0a", text: "#fafafa", swatch: "#0a0a0a" },
  light: { label: "Light", bg: "#fafafa", text: "#0a0a0a", border: "#e5e5e5", swatch: "#fafafa" },
  teal:  { label: "Teal",  bg: "#2dd4a8", text: "#042f2e", swatch: "#2dd4a8" },
}

const SIZES: Record<ButtonSize, { label: string; fontSize: number; py: number; px: number }> = {
  small:  { label: "S", fontSize: 12, py: 8,  px: 16 },
  medium: { label: "M", fontSize: 14, py: 10, px: 20 },
  large:  { label: "L", fontSize: 16, py: 12, px: 24 },
}

const ICON_SVG = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="18 13 12 19 6 13"/><line x1="6" y1="5" x2="18" y2="5"/></svg>`

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

function generateHtml(
  username: string,
  style: ButtonStyle,
  theme: ButtonTheme,
  label: string,
  size: ButtonSize,
): string {
  const { bg, text, border } = THEMES[theme]
  const { fontSize, py, px } = SIZES[size]
  const href = `https://trytippa.com/d/${username}`
  const safeLabel = escapeHtml(label)

  if (style === "minimal") {
    return `<a href="${href}" target="_blank" rel="noopener noreferrer" style="color:${text};font-family:system-ui,sans-serif;font-size:${fontSize}px;font-weight:500;text-decoration:underline;text-underline-offset:3px">${safeLabel}</a>`
  }

  const radius = style === "pill" ? "9999px" : "8px"
  const borderStyle = theme === "light" ? `border:1px solid ${border};` : ""

  return `<a href="${href}" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:8px;background:${bg};color:${text};font-family:system-ui,sans-serif;font-size:${fontSize}px;font-weight:600;padding:${py}px ${px}px;border-radius:${radius};text-decoration:none;${borderStyle}">\n  ${ICON_SVG}\n  ${safeLabel}\n</a>`
}

interface ButtonTabProps {
  username: string
}

function ButtonTab({ username }: ButtonTabProps) {
  const [style, setStyle] = useState<ButtonStyle>("pill")
  const [theme, setTheme] = useState<ButtonTheme>("teal")
  const [label, setLabel] = useState("Tip me on Tippa")
  const [size, setSize] = useState<ButtonSize>("medium")

  const generatedHtml = generateHtml(username, style, theme, label, size)

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="space-y-4">
        {/* Style */}
        <div>
          <label className="mb-2 block text-xs font-medium text-muted-foreground">Style</label>
          <div className="grid grid-cols-3 gap-3">
            {(["pill", "rectangle", "minimal"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStyle(s)}
                className={cn(
                  "rounded-lg border px-3 py-2.5 text-xs font-medium capitalize transition-colors",
                  style === s
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-secondary/30 text-muted-foreground hover:border-primary/30 hover:text-foreground"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Theme */}
        <div>
          <label className="mb-2 block text-xs font-medium text-muted-foreground">Theme</label>
          <div className="flex gap-3">
            {(Object.entries(THEMES) as [ButtonTheme, typeof THEMES[ButtonTheme]][]).map(([key, t]) => (
              <button
                key={key}
                onClick={() => setTheme(key)}
                className={cn(
                  "flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors",
                  theme === key
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-secondary/30 text-muted-foreground hover:border-primary/30 hover:text-foreground"
                )}
              >
                <span
                  className={cn(
                    "inline-block h-4 w-4 rounded-full border",
                    key === "light" ? "border-neutral-300" : "border-transparent"
                  )}
                  style={{ backgroundColor: t.swatch }}
                />
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Label */}
        <div>
          <label className="mb-2 block text-xs font-medium text-muted-foreground">Label</label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="h-9 w-full rounded-lg border border-border bg-secondary/30 px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Tip me on Tippa"
          />
        </div>

        {/* Size */}
        <div>
          <label className="mb-2 block text-xs font-medium text-muted-foreground">Size</label>
          <div className="flex gap-2">
            {(["small", "medium", "large"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSize(s)}
                className={cn(
                  "rounded-lg border px-4 py-2 text-xs font-medium transition-colors",
                  size === s
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-secondary/30 text-muted-foreground hover:border-primary/30 hover:text-foreground"
                )}
              >
                {SIZES[s].label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Preview */}
      <div>
        <label className="mb-2 block text-xs font-medium text-muted-foreground">Preview</label>
        <div className="flex min-h-[120px] items-center justify-center rounded-lg border border-dashed border-border bg-[repeating-conic-gradient(hsl(var(--muted))_0%_25%,transparent_0%_50%)] bg-[length:16px_16px]">
          <div dangerouslySetInnerHTML={{ __html: generatedHtml }} />
        </div>
      </div>

      {/* Generated Code */}
      <CodeBlock code={generatedHtml} language="html" />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  BadgeTab                                                            */
/* ------------------------------------------------------------------ */

type BadgeMode = "simple" | "rich"
type BadgeStyle = "flat" | "flat-square" | "for-the-badge" | "plastic"
type BadgeFormat = "markdown" | "html"

const BADGE_STYLES: { value: BadgeStyle; label: string }[] = [
  { value: "flat", label: "Flat" },
  { value: "flat-square", label: "Flat-square" },
  { value: "for-the-badge", label: "For-the-badge" },
  { value: "plastic", label: "Plastic" },
]

interface BadgeTabProps {
  username: string
}

function BadgeTab({ username }: BadgeTabProps) {
  const [mode, setMode] = useState<BadgeMode>("simple")
  const [style, setStyle] = useState<BadgeStyle>("for-the-badge")
  const [color, setColor] = useState("2dd4a8")
  const [label, setLabel] = useState("tippa")
  const [message, setMessage] = useState("Tip me")
  const [format, setFormat] = useState<BadgeFormat>("markdown")

  const profileUrl = `https://trytippa.com/d/${username}`

  // Simple badge uses shields.io
  const shieldsUrl = `https://img.shields.io/badge/${encodeURIComponent(label)}-${encodeURIComponent(message)}-${encodeURIComponent(color)}?style=${style}`

  // Rich badge uses our API
  const richPreviewUrl = `/api/badge/${username}`
  const richProdUrl = `https://trytippa.com/api/badge/${username}`

  const safeMessage = escapeHtml(message)

  const previewUrl = mode === "simple" ? shieldsUrl : richPreviewUrl
  const badgeUrl = mode === "simple" ? shieldsUrl : richProdUrl
  const previewKey = mode === "simple" ? `${mode}-${style}-${color}-${label}-${message}` : `${mode}-${username}`

  const generatedCode =
    format === "markdown"
      ? `[![${mode === "simple" ? message : `Donate to ${username}`}](${badgeUrl})](${profileUrl})`
      : `<a href="${profileUrl}"><img src="${badgeUrl}" alt="${mode === "simple" ? safeMessage : escapeHtml(`Donate to ${username}`)}" /></a>`

  return (
    <div className="space-y-6">
      {/* Mode toggle */}
      <div>
        <label className="mb-2 block text-xs font-medium text-muted-foreground">Badge Type</label>
        <div className="flex gap-2">
          <button
            onClick={() => setMode("simple")}
            className={cn(
              "flex-1 rounded-lg border px-3 py-2.5 text-xs font-medium transition-colors",
              mode === "simple"
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-secondary/30 text-muted-foreground hover:border-primary/30 hover:text-foreground"
            )}
          >
            <span className="block font-semibold">Simple</span>
            <span className="mt-0.5 block text-[10px] font-normal opacity-70">Shields.io badge for READMEs</span>
          </button>
          <button
            onClick={() => setMode("rich")}
            className={cn(
              "flex-1 rounded-lg border px-3 py-2.5 text-xs font-medium transition-colors",
              mode === "rich"
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-secondary/30 text-muted-foreground hover:border-primary/30 hover:text-foreground"
            )}
          >
            <span className="block font-semibold">Rich Card</span>
            <span className="mt-0.5 block text-[10px] font-normal opacity-70">Shows cascade distribution</span>
          </button>
        </div>
      </div>

      {/* Simple mode controls */}
      {mode === "simple" && (
        <div className="space-y-4">
          {/* Style */}
          <div>
            <label className="mb-2 block text-xs font-medium text-muted-foreground">Style</label>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {BADGE_STYLES.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setStyle(s.value)}
                  className={cn(
                    "rounded-lg border px-3 py-2.5 text-xs font-medium transition-colors",
                    style === s.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-secondary/30 text-muted-foreground hover:border-primary/30 hover:text-foreground"
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="mb-2 block text-xs font-medium text-muted-foreground">Color</label>
            <div className="flex items-center gap-3">
              <span
                className="inline-block h-8 w-8 shrink-0 rounded-full border border-border"
                style={{ backgroundColor: /^[0-9a-fA-F]{3,8}$/.test(color) ? `#${color}` : "#2dd4a8" }}
              />
              <div className="relative flex-1">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  #
                </span>
                <input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value.replace(/^#/, "").slice(0, 8))}
                  className="h-9 w-full rounded-lg border border-border bg-secondary/30 pl-7 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="2dd4a8"
                  maxLength={8}
                />
              </div>
            </div>
          </div>

          {/* Label */}
          <div>
            <label className="mb-2 block text-xs font-medium text-muted-foreground">Label</label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="h-9 w-full rounded-lg border border-border bg-secondary/30 px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="tippa"
            />
          </div>

          {/* Message */}
          <div>
            <label className="mb-2 block text-xs font-medium text-muted-foreground">Message</label>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="h-9 w-full rounded-lg border border-border bg-secondary/30 px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Tip me"
            />
          </div>
        </div>
      )}

      {/* Rich mode info */}
      {mode === "rich" && (
        <div className="rounded-lg border border-border bg-secondary/20 px-4 py-3">
          <p className="text-xs text-muted-foreground">
            This card automatically shows your current cascade distribution rules. It updates whenever you change your cascade configuration.
          </p>
        </div>
      )}

      {/* Format toggle (both modes) */}
      <div>
        <label className="mb-2 block text-xs font-medium text-muted-foreground">Format</label>
        <div className="flex gap-2">
          {(["markdown", "html"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFormat(f)}
              className={cn(
                "rounded-lg border px-4 py-2 text-xs font-medium capitalize transition-colors",
                format === f
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-secondary/30 text-muted-foreground hover:border-primary/30 hover:text-foreground"
              )}
            >
              {f === "markdown" ? "Markdown" : "HTML"}
            </button>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div>
        <label className="mb-2 block text-xs font-medium text-muted-foreground">Preview</label>
        <div className={cn(
          "flex items-center justify-center rounded-lg border border-dashed border-border",
          mode === "simple"
            ? "min-h-[80px] bg-[repeating-conic-gradient(hsl(var(--muted))_0%_25%,transparent_0%_50%)] bg-[length:16px_16px]"
            : "min-h-[120px] bg-secondary/20 p-4"
        )}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={previewKey}
            src={previewUrl}
            alt={mode === "simple" ? `${label} - ${message}` : `Cascade badge for ${username}`}
            className="max-w-full"
          />
        </div>
      </div>

      {/* Generated Code */}
      <CodeBlock code={generatedCode} language={format} />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  WidgetTab                                                           */
/* ------------------------------------------------------------------ */

type WidgetTheme = "dark" | "light"
type WidgetAsset = "USDC" | "XLM"

interface WidgetTabProps {
  username: string
}

function WidgetTab({ username }: WidgetTabProps) {
  const [theme, setTheme] = useState<WidgetTheme>("dark")
  const [asset, setAsset] = useState<WidgetAsset>("USDC")
  const [amount, setAmount] = useState("")
  const [width, setWidth] = useState(350)
  const [height, setHeight] = useState(400)

  const clampedWidth = Math.min(500, Math.max(300, width || 300))
  const clampedHeight = Math.min(600, Math.max(350, height || 350))

  const previewParams = new URLSearchParams({ theme, asset })
  if (amount && !isNaN(parseFloat(amount)) && parseFloat(amount) > 0) {
    previewParams.set("amount", amount)
  }
  const previewUrl = `/embed/${username}?${previewParams.toString()}`

  const prodParams = new URLSearchParams({ theme, asset })
  if (amount && !isNaN(parseFloat(amount)) && parseFloat(amount) > 0) {
    prodParams.set("amount", amount)
  }
  const prodUrl = `https://trytippa.com/embed/${username}?${prodParams.toString()}`

  const iframeCode = `<iframe src="${prodUrl}" width="${clampedWidth}" height="${clampedHeight}" style="border:none;border-radius:12px" title="Donate to ${username} on Tippa" allow="clipboard-write"></iframe>`

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="space-y-4">
        {/* Theme */}
        <div>
          <label className="mb-2 block text-xs font-medium text-muted-foreground">Theme</label>
          <div className="flex gap-2">
            {(["dark", "light"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={cn(
                  "flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium capitalize transition-colors",
                  theme === t
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-secondary/30 text-muted-foreground hover:border-primary/30 hover:text-foreground"
                )}
              >
                <span
                  className={cn(
                    "inline-block h-4 w-4 rounded-full border",
                    t === "light" ? "border-neutral-300" : "border-transparent"
                  )}
                  style={{ backgroundColor: t === "dark" ? "#0a0a0a" : "#fafafa" }}
                />
                {t === "dark" ? "Dark" : "Light"}
              </button>
            ))}
          </div>
        </div>

        {/* Default asset */}
        <div>
          <label className="mb-2 block text-xs font-medium text-muted-foreground">Default asset</label>
          <div className="flex gap-2">
            {(["USDC", "XLM"] as const).map((a) => (
              <button
                key={a}
                onClick={() => setAsset(a)}
                className={cn(
                  "rounded-lg border px-4 py-2 text-xs font-medium transition-colors",
                  asset === a
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-secondary/30 text-muted-foreground hover:border-primary/30 hover:text-foreground"
                )}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        {/* Default amount */}
        <div>
          <label className="mb-2 block text-xs font-medium text-muted-foreground">Default amount</label>
          <input
            type="number"
            min="0"
            step="any"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="h-9 w-full rounded-lg border border-border bg-secondary/30 px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="No default"
          />
        </div>

        {/* Dimensions */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-2 block text-xs font-medium text-muted-foreground">Width (px)</label>
            <input
              type="number"
              min={300}
              max={500}
              value={width}
              onChange={(e) => setWidth(parseInt(e.target.value) || 300)}
              className="h-9 w-full rounded-lg border border-border bg-secondary/30 px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label className="mb-2 block text-xs font-medium text-muted-foreground">Height (px)</label>
            <input
              type="number"
              min={350}
              max={600}
              value={height}
              onChange={(e) => setHeight(parseInt(e.target.value) || 350)}
              className="h-9 w-full rounded-lg border border-border bg-secondary/30 px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* Live preview */}
      <div>
        <label className="mb-2 block text-xs font-medium text-muted-foreground">Preview</label>
        <div className="flex items-center justify-center overflow-hidden rounded-lg border border-dashed border-border bg-[repeating-conic-gradient(hsl(var(--muted))_0%_25%,transparent_0%_50%)] bg-[length:16px_16px] p-4">
          <iframe
            src={previewUrl}
            width={clampedWidth}
            height={clampedHeight}
            style={{ border: "none", borderRadius: 12 }}
            title={`Donate to ${username} on Tippa`}
            allow="clipboard-write"
          />
        </div>
      </div>

      {/* Generated Code */}
      <CodeBlock code={iframeCode} language="html" />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  EmbedGenerator                                                     */
/* ------------------------------------------------------------------ */

interface EmbedGeneratorProps {
  username: string
}

export function EmbedGenerator({ username }: EmbedGeneratorProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground">Embed on Your Site</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Add a donation button, widget, or badge to your website or README
        </p>
      </div>

      <Tabs defaultValue="button">
        <TabsList className="w-full">
          <TabsTrigger value="button" className="flex-1 gap-1.5">
            <Code2 className="h-3.5 w-3.5" />
            Button
          </TabsTrigger>
          <TabsTrigger value="widget" className="flex-1 gap-1.5">
            <Globe className="h-3.5 w-3.5" />
            Widget
          </TabsTrigger>
          <TabsTrigger value="badge" className="flex-1 gap-1.5">
            <Github className="h-3.5 w-3.5" />
            GitHub Badge
          </TabsTrigger>
        </TabsList>

        <TabsContent value="button" className="mt-4">
          <ButtonTab username={username} />
        </TabsContent>

        <TabsContent value="widget" className="mt-4">
          <WidgetTab username={username} />
        </TabsContent>

        <TabsContent value="badge" className="mt-4">
          <BadgeTab username={username} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
