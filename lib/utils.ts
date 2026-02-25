import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { PartialTransaction, AggregatedData } from "@/lib/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
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
