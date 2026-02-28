"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"

const iconStyles = "group-hover:text-primary transition-colors"

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="group h-9 w-9 hover:bg-primary/10 dark:hover:bg-primary/30">
        <Moon className={iconStyles} />
        <span className="sr-only">Toggle theme</span>
      </Button>
    )
  }

  function toggleTheme() {
    const isAppearanceTransition =
      // @ts-expect-error - document.startViewTransition is not yet in the official TS types
      document.startViewTransition !== undefined && !window.matchMedia("(prefers-reduced-motion: reduce)").matches

    if (!isAppearanceTransition) {
      setTheme(resolvedTheme === "dark" ? "light" : "dark")
      return
    }

    // @ts-expect-error - document.startViewTransition is not yet in the official TS types
    document.startViewTransition(async () => {
      setTheme(resolvedTheme === "dark" ? "light" : "dark")
    })
  }

  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme} className="group h-9 w-9 hover:bg-primary/10 dark:hover:bg-primary/30">
      {resolvedTheme === "dark" ? <Moon className={iconStyles} /> : <Sun className={iconStyles} />}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
