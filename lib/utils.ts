import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { PartialTransaction, AggregatedData } from "@/lib/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Returns initials from a name.
 * @param name - The name to get initials from
 * @returns The initials of the name
 */
export function getInitials(name?: string | null) {
  if (!name) return ""
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

/**
 * Returns a short version of a wallet address.
 * @param wallet_address - The wallet address to shorten
 * @returns The shortened wallet address
 */
export function getWalletShort(wallet_address?: string) {
  if (!wallet_address) return ""
  return wallet_address.slice(0, 6) + "..." + wallet_address.slice(-6)
}

/**
 * Parses transactions and aggregates them by month and asset.
 * @param data - Array of partial transactions
 * @param username - Username of the current user
 * @returns Array of aggregated data
 */
export function parseTransactions(data: PartialTransaction[], username: string): AggregatedData[] {
  const grouped = data.reduce<Record<string, AggregatedData>>((acc, tx) => {
    const date = tx.created_at.slice(0, 7) // "YYYY-MM"
    const key = `${date}-${tx.asset}`

    if (!acc[key]) {
      acc[key] = { date, asset: tx.asset, received: 0, forwarded: 0 }
    }

    if (tx.to_username === username) acc[key].received += tx.amount
    if (tx.from_username === username) acc[key].forwarded += tx.amount

    return acc
  }, {})

  return Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date))
}
