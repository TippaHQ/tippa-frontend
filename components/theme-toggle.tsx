"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Sun, Moon, Monitor } from "lucide-react"
import { Button } from "@/components/ui/button"

const modes = ["light", "dark", "system"] as const

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground">
        <Moon className="h-[18px] w-[18px]" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    )
  }

  const cycle = () => {
    const idx = modes.indexOf(theme as (typeof modes)[number])
    setTheme(modes[(idx + 1) % modes.length])
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={cycle}
      className="h-9 w-9 text-muted-foreground hover:text-foreground"
    >
      {theme === "light" && <Sun className="h-[18px] w-[18px]" />}
      {theme === "dark" && <Moon className="h-[18px] w-[18px]" />}
      {theme === "system" && <Monitor className="h-[18px] w-[18px]" />}
      <span className="sr-only">Toggle theme ({theme})</span>
    </Button>
  )
}
