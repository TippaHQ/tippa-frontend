import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

interface Dependency {
  label: string
  recipient_username: string
  percentage: number
}

/**
 * Generate a rich SVG card showing the user's cascade distribution rules.
 * Inspired by Kivach's cascading donations badge.
 */
function generateRichBadge(
  displayName: string,
  username: string,
  dependencies: Dependency[],
): string {
  const safeName = escapeXml(displayName)
  const safeUsername = escapeXml(username)

  const cardWidth = 400
  const headerHeight = 72
  const depRowHeight = 26
  const depStartY = headerHeight + 20
  const keepPercentage = Math.max(0, 100 - dependencies.reduce((s, d) => s + d.percentage, 0))

  const depCount = dependencies.length + 1 // +1 for the user's own share
  const cardHeight = depStartY + depCount * depRowHeight + 24

  // Build dependency rows SVG
  let depRows = ""

  // User's own share first
  const selfY = depStartY
  const selfBarWidth = Math.max(8, (keepPercentage / 100) * 180)
  depRows += `
    <rect x="24" y="${selfY}" width="${selfBarWidth}" height="16" rx="3" fill="#2dd4a8" opacity="0.7"/>
    <text x="${selfBarWidth + 32}" y="${selfY + 12}" font-size="12" fill="#e5e5e5" font-family="system-ui,sans-serif">${safeName} — ${keepPercentage}%</text>`

  // Dependencies
  dependencies.forEach((dep, i) => {
    const y = depStartY + (i + 1) * depRowHeight
    const barWidth = Math.max(8, (dep.percentage / 100) * 180)
    const indent = 16
    const safeLabel = escapeXml(dep.label || dep.recipient_username)

    // Connector line
    depRows += `
    <line x1="${24 + indent - 4}" y1="${y - 4}" x2="${24 + indent - 4}" y2="${y + 8}" stroke="#2dd4a8" stroke-width="1.5" opacity="0.3"/>
    <line x1="${24 + indent - 4}" y1="${y + 8}" x2="${24 + indent + 4}" y2="${y + 8}" stroke="#2dd4a8" stroke-width="1.5" opacity="0.3"/>
    <rect x="${24 + indent}" y="${y}" width="${barWidth}" height="16" rx="3" fill="#2dd4a8" opacity="${0.5 - i * 0.08}"/>
    <text x="${24 + indent + barWidth + 8}" y="${y + 12}" font-size="11" fill="#a1a1aa" font-family="system-ui,sans-serif">${safeLabel} — ${dep.percentage}%</text>`
  })

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${cardWidth}" height="${cardHeight}" viewBox="0 0 ${cardWidth} ${cardHeight}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1a1a2e"/>
      <stop offset="100%" stop-color="#0f0f1a"/>
    </linearGradient>
  </defs>
  <rect width="${cardWidth}" height="${cardHeight}" rx="12" fill="url(#bg)" stroke="#2dd4a8" stroke-width="1" stroke-opacity="0.2"/>

  <!-- Header -->
  <g transform="translate(24, 20)">
    <!-- Tippa icon -->
    <rect width="36" height="36" rx="8" fill="#14b8a6"/>
    <g transform="translate(6, 6) scale(1)" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none">
      <circle cx="12" cy="18" r="3"/>
      <circle cx="6" cy="6" r="3"/>
      <circle cx="18" cy="6" r="3"/>
      <path d="M18 9v2c0 .6-.4 1-1 1H7c-.6 0-1-.4-1-1V9"/>
      <path d="M12 12v3"/>
    </g>

    <!-- Title -->
    <text x="46" y="16" font-size="16" font-weight="700" fill="#fafafa" font-family="system-ui,sans-serif">${safeName}</text>
    <text x="46" y="32" font-size="11" fill="#71717a" font-family="system-ui,sans-serif">@${safeUsername} · Cascading donations</text>
  </g>

  <!-- Divider -->
  <line x1="24" y1="${headerHeight}" x2="${cardWidth - 24}" y2="${headerHeight}" stroke="#2dd4a8" stroke-width="0.5" stroke-opacity="0.15"/>

  <!-- Distribution tree -->
  ${depRows}

  <!-- Footer -->
  <text x="${cardWidth - 24}" y="${cardHeight - 10}" font-size="9" fill="#52525b" font-family="system-ui,sans-serif" text-anchor="end">trytippa.com/d/${safeUsername}</text>
</svg>`
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> },
) {
  const { username } = await params

  if (!username || username.length > 100) {
    return new NextResponse("Invalid username", { status: 400 })
  }

  const supabase = await createClient()

  // Fetch profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, display_name, username")
    .eq("username", username)
    .single()

  if (!profile) {
    return new NextResponse("User not found", { status: 404 })
  }

  // Fetch cascade dependencies
  const { data: deps } = await supabase
    .from("cascade_dependencies")
    .select("label, recipient_username, percentage")
    .eq("user_id", profile.id)
    .order("sort_order", { ascending: true })

  const displayName = profile.display_name || profile.username || username
  const dependencies: Dependency[] = (deps ?? []).map((d) => ({
    label: d.label,
    recipient_username: d.recipient_username,
    percentage: d.percentage,
  }))

  const svg = generateRichBadge(displayName, username, dependencies)

  return new NextResponse(svg, {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=3600",
    },
  })
}
