"use client"

import { useState, useEffect } from "react"

/**
 * Hook to use localStorage with type safety.
 * SSR-safe: guards every `window` access so it works in Next.js.
 * @param key - The key to use for localStorage.
 * @param initialValue - The initial value to use for localStorage.
 * @returns A tuple containing the value and a function to set the value.
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue
    try {
      const item = window.localStorage.getItem(key)
      return item ? (JSON.parse(item) as T) : initialValue
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  function setValue(value: T | ((val: T) => T)) {
    if (typeof window === "undefined") return
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error)
    }
  }

  function removeValue() {
    if (typeof window === "undefined") return
    try {
      window.localStorage.removeItem(key)
      setStoredValue(initialValue)
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error)
    }
  }

  // Sync across tabs (useEffect only runs client-side, so no guard needed here)
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key) {
        try {
          setStoredValue(event.newValue ? (JSON.parse(event.newValue) as T) : initialValue)
        } catch (error) {
          console.error(`Error syncing localStorage key "${key}":`, error)
        }
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [key])

  return [storedValue, setValue, removeValue] as const
}
