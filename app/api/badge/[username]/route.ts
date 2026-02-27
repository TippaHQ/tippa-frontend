import { NextRequest, NextResponse } from "next/server"

type BadgeStyle = "flat" | "flat-square" | "for-the-badge" | "plastic"

const VALID_STYLES: BadgeStyle[] = ["flat", "flat-square", "for-the-badge", "plastic"]

/**
 * Escape XML special characters to prevent SVG injection.
 */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

/**
 * Estimate the rendered width of a string in Verdana 11px.
 * ~6.5px per character + 10px padding on each side.
 */
function estimateWidth(text: string, charWidth: number): number {
  return Math.round(text.length * charWidth + 20)
}

/**
 * Validate a hex color string (without the # prefix).
 * Returns the validated hex or the default.
 */
function sanitizeHex(hex: string, fallback: string): string {
  const cleaned = hex.replace(/^#/, "")
  return /^[0-9a-fA-F]{3,8}$/.test(cleaned) ? cleaned : fallback
}

function generateFlatBadge(
  label: string,
  message: string,
  color: string,
  rx: string,
): string {
  const charWidth = 6.5
  const labelWidth = estimateWidth(label, charWidth)
  const messageWidth = estimateWidth(message, charWidth)
  const totalWidth = labelWidth + messageWidth
  const labelCenter = labelWidth / 2
  const messageCenter = labelWidth + messageWidth / 2

  const safeLabel = escapeXml(label)
  const safeMessage = escapeXml(message)

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="20">
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <clipPath id="r"><rect width="${totalWidth}" height="20" rx="${rx}"/></clipPath>
  <g clip-path="url(#r)">
    <rect width="${labelWidth}" height="20" fill="#555"/>
    <rect x="${labelWidth}" width="${messageWidth}" height="20" fill="#${color}"/>
    <rect width="${totalWidth}" height="20" fill="url(#s)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,sans-serif" font-size="11">
    <text x="${labelCenter}" y="15" fill="#010101" fill-opacity=".3">${safeLabel}</text>
    <text x="${labelCenter}" y="14">${safeLabel}</text>
    <text x="${messageCenter}" y="15" fill="#010101" fill-opacity=".3">${safeMessage}</text>
    <text x="${messageCenter}" y="14">${safeMessage}</text>
  </g>
</svg>`
}

function generatePlasticBadge(
  label: string,
  message: string,
  color: string,
): string {
  const charWidth = 6.5
  const labelWidth = estimateWidth(label, charWidth)
  const messageWidth = estimateWidth(message, charWidth)
  const totalWidth = labelWidth + messageWidth
  const labelCenter = labelWidth / 2
  const messageCenter = labelWidth + messageWidth / 2

  const safeLabel = escapeXml(label)
  const safeMessage = escapeXml(message)

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="20">
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <linearGradient id="gloss" x2="0" y2="100%">
    <stop offset="0" stop-color="#fff" stop-opacity=".15"/>
    <stop offset="1" stop-color="#fff" stop-opacity="0"/>
  </linearGradient>
  <clipPath id="r"><rect width="${totalWidth}" height="20" rx="3"/></clipPath>
  <g clip-path="url(#r)">
    <rect width="${labelWidth}" height="20" fill="#555"/>
    <rect x="${labelWidth}" width="${messageWidth}" height="20" fill="#${color}"/>
    <rect width="${totalWidth}" height="20" fill="url(#s)"/>
    <rect width="${totalWidth}" height="20" fill="url(#gloss)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,sans-serif" font-size="11">
    <text x="${labelCenter}" y="15" fill="#010101" fill-opacity=".3">${safeLabel}</text>
    <text x="${labelCenter}" y="14">${safeLabel}</text>
    <text x="${messageCenter}" y="15" fill="#010101" fill-opacity=".3">${safeMessage}</text>
    <text x="${messageCenter}" y="14">${safeMessage}</text>
  </g>
</svg>`
}

function generateForTheBadge(
  label: string,
  message: string,
  color: string,
): string {
  const charWidth = 7.5
  const upperLabel = label.toUpperCase()
  const upperMessage = message.toUpperCase()
  const labelWidth = estimateWidth(upperLabel, charWidth)
  const messageWidth = estimateWidth(upperMessage, charWidth)
  const totalWidth = labelWidth + messageWidth
  const labelCenter = labelWidth / 2
  const messageCenter = labelWidth + messageWidth / 2

  const safeLabel = escapeXml(upperLabel)
  const safeMessage = escapeXml(upperMessage)

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="28">
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <clipPath id="r"><rect width="${totalWidth}" height="28" rx="3"/></clipPath>
  <g clip-path="url(#r)">
    <rect width="${labelWidth}" height="28" fill="#555"/>
    <rect x="${labelWidth}" width="${messageWidth}" height="28" fill="#${color}"/>
    <rect width="${totalWidth}" height="28" fill="url(#s)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,sans-serif" font-size="10" letter-spacing="1">
    <text x="${labelCenter}" y="19" fill="#010101" fill-opacity=".3">${safeLabel}</text>
    <text x="${labelCenter}" y="18">${safeLabel}</text>
    <text x="${messageCenter}" y="19" fill="#010101" fill-opacity=".3">${safeMessage}</text>
    <text x="${messageCenter}" y="18">${safeMessage}</text>
  </g>
</svg>`
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> },
) {
  const { username } = await params
  const { searchParams } = new URL(request.url)

  const style = (searchParams.get("style") ?? "flat") as BadgeStyle
  const color = sanitizeHex(searchParams.get("color") ?? "2dd4a8", "2dd4a8")
  const label = searchParams.get("label") ?? "tippa"
  const message = searchParams.get("message") ?? "Tip me"

  // Validate style
  const validStyle = VALID_STYLES.includes(style) ? style : "flat"

  // Clamp label and message length to prevent abuse
  const clampedLabel = label.slice(0, 50)
  const clampedMessage = message.slice(0, 50)

  // Ensure username is non-empty (basic sanity check)
  if (!username || username.length > 100) {
    return new NextResponse("Invalid username", { status: 400 })
  }

  let svg: string

  switch (validStyle) {
    case "flat":
      svg = generateFlatBadge(clampedLabel, clampedMessage, color, "3")
      break
    case "flat-square":
      svg = generateFlatBadge(clampedLabel, clampedMessage, color, "0")
      break
    case "for-the-badge":
      svg = generateForTheBadge(clampedLabel, clampedMessage, color)
      break
    case "plastic":
      svg = generatePlasticBadge(clampedLabel, clampedMessage, color)
      break
    default:
      svg = generateFlatBadge(clampedLabel, clampedMessage, color, "3")
  }

  return new NextResponse(svg, {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=86400",
    },
  })
}
