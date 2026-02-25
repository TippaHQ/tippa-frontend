"use client"

import { useEffect, type ReactNode } from "react"
import { useUserStore } from "@/lib/store/user-store"

export function UserProvider({ children }: { children: ReactNode }) {
  const initialize = useUserStore((state) => state.initialize)

  useEffect(() => {
    initialize()
  }, [initialize])

  return <>{children}</>
}
