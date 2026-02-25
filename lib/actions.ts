"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { Profile, CascadeDependency, CascadeRules, Transaction, MonthlyFlowStat, NotificationPreferences, ProfileAnalytics } from "@/lib/types"

// ────────────────────────────────────────────────────────────
// Auth helpers
// ────────────────────────────────────────────────────────────

export async function getCurrentUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

// ────────────────────────────────────────────────────────────
// Profile
// ────────────────────────────────────────────────────────────

export async function getProfile(): Promise<Profile | null> {
  const user = await getCurrentUser()
  if (!user) return null
  const supabase = await createClient()
  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single()
  return data
}

export async function getProfileByUsername(username: string): Promise<Profile | null> {
  const supabase = await createClient()
  const { data } = await supabase.from("profiles").select("*").eq("username", username).single()
  return data
}

export async function updateProfile(
  fields: Partial<
    Pick<
      Profile,
      | "display_name"
      | "username"
      | "bio"
      | "avatar_url"
      | "banner_url"
      | "wallet_address"
      | "federated_address"
      | "default_asset"
      | "stellar_network"
      | "horizon_url"
      | "github"
      | "twitter"
      | "website"
    >
  >,
) {
  const user = await getCurrentUser()
  if (!user) return { error: "Not authenticated" }
  const supabase = await createClient()
  const { error } = await supabase.from("profiles").update(fields).eq("id", user.id)
  if (error) return { error: error.message }
  revalidatePath("/dashboard/profile")
  revalidatePath("/dashboard/settings")
  revalidatePath("/dashboard")
  return { error: null }
}

// ────────────────────────────────────────────────────────────
// Cascade Dependencies
// ────────────────────────────────────────────────────────────

export async function getCascadeDependencies(): Promise<CascadeDependency[]> {
  const user = await getCurrentUser()
  if (!user) return []
  const supabase = await createClient()
  const { data } = await supabase.from("cascade_dependencies").select("*").eq("user_id", user.id).order("sort_order", { ascending: true })
  return data ?? []
}

export async function getPublicCascadeDependencies(userId: string): Promise<CascadeDependency[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("cascade_dependencies")
    .select("*")
    .eq("user_id", userId)
    .order("sort_order", { ascending: true })
  return data ?? []
}

export async function saveCascadeDependencies(
  deps: Array<{
    id?: string
    label: string
    recipient_username: string
    percentage: number
    sort_order: number
  }>,
) {
  const user = await getCurrentUser()
  if (!user) return { error: "Not authenticated" }
  const supabase = await createClient()

  // Delete all existing then re-insert (simplest approach for up to 10 items)
  const { error: deleteError } = await supabase.from("cascade_dependencies").delete().eq("user_id", user.id)
  if (deleteError) return { error: deleteError.message }

  if (deps.length > 0) {
    const rows = deps.map((d, i) => ({
      user_id: user.id,
      label: d.label,
      recipient_username: d.recipient_username,
      percentage: d.percentage,
      sort_order: i,
    }))
    const { error: insertError } = await supabase.from("cascade_dependencies").insert(rows)
    if (insertError) return { error: insertError.message }
  }

  revalidatePath("/dashboard/cascades")
  revalidatePath("/dashboard")
  revalidatePath("/dashboard/profile")
  return { error: null }
}

export async function checkUsernameExists(username: string): Promise<boolean> {
  const supabase = await createClient()
  const { data } = await supabase.from("profiles").select("username").eq("username", username).single()
  return !!data
}

// ────────────────────────────────────────────────────────────
// Cascade Rules
// ────────────────────────────────────────────────────────────

export async function getCascadeRules(): Promise<CascadeRules | null> {
  const user = await getCurrentUser()
  if (!user) return null
  const supabase = await createClient()
  const { data } = await supabase.from("cascade_rules").select("*").eq("user_id", user.id).single()
  return data
}

export async function updateCascadeRules(
  fields: Partial<Pick<CascadeRules, "atomic_execution" | "min_hop_enabled" | "min_hop_amount" | "auto_cascade">>,
) {
  const user = await getCurrentUser()
  if (!user) return { error: "Not authenticated" }
  const supabase = await createClient()
  const { error } = await supabase.from("cascade_rules").update(fields).eq("user_id", user.id)
  if (error) return { error: error.message }
  revalidatePath("/dashboard/cascades")
  return { error: null }
}

// ────────────────────────────────────────────────────────────
// Transactions
// ────────────────────────────────────────────────────────────

export async function getTransactions(opts?: {
  type?: "received" | "forwarded"
  search?: string
  limit?: number
  offset?: number
}): Promise<{ data: Transaction[]; count: number }> {
  const user = await getCurrentUser()
  if (!user) return { data: [], count: 0 }
  const supabase = await createClient()

  let query = supabase.from("transactions").select("*", { count: "exact" }).eq("user_id", user.id).order("created_at", { ascending: false })

  if (opts?.type) {
    query = query.eq("type", opts.type)
  }
  if (opts?.search) {
    query = query.or(
      `from_name.ilike.%${opts.search}%,to_name.ilike.%${opts.search}%,from_address.ilike.%${opts.search}%,stellar_tx_hash.ilike.%${opts.search}%`,
    )
  }
  if (opts?.limit) {
    const offset = opts.offset ?? 0
    query = query.range(offset, offset + opts.limit - 1)
  }

  const { data, count } = await query
  return { data: data ?? [], count: count ?? 0 }
}

// ────────────────────────────────────────────────────────────
// Monthly Flow Stats (dashboard chart)
// ────────────────────────────────────────────────────────────

export async function getMonthlyFlowStats(): Promise<MonthlyFlowStat[]> {
  const user = await getCurrentUser()
  if (!user) return []
  const supabase = await createClient()
  const { data } = await supabase.from("monthly_flow_stats").select("*").eq("user_id", user.id).order("month", { ascending: true })
  return data ?? []
}

// ────────────────────────────────────────────────────────────
// Notification Preferences
// ────────────────────────────────────────────────────────────

export async function getNotificationPreferences(): Promise<NotificationPreferences | null> {
  const user = await getCurrentUser()
  if (!user) return null
  const supabase = await createClient()
  const { data } = await supabase.from("notification_preferences").select("*").eq("user_id", user.id).single()
  return data
}

export async function updateNotificationPreferences(
  fields: Partial<Pick<NotificationPreferences, "payment_received" | "cascade_completed" | "failed_transactions" | "profile_views_digest">>,
) {
  const user = await getCurrentUser()
  if (!user) return { error: "Not authenticated" }
  const supabase = await createClient()
  const { error } = await supabase.from("notification_preferences").update(fields).eq("user_id", user.id)
  if (error) return { error: error.message }
  revalidatePath("/dashboard/settings")
  return { error: null }
}

// ────────────────────────────────────────────────────────────
// Profile Analytics
// ────────────────────────────────────────────────────────────

export async function getProfileAnalytics(): Promise<ProfileAnalytics | null> {
  const user = await getCurrentUser()
  if (!user) return null
  const supabase = await createClient()
  const { data } = await supabase.from("profile_analytics").select("*").eq("user_id", user.id).single()
  return data
}

// ────────────────────────────────────────────────────────────
// Dashboard aggregated stats
// ────────────────────────────────────────────────────────────

export async function getDashboardStats() {
  const user = await getCurrentUser()
  if (!user)
    return {
      activeCascades: 0,
      depCount: 0,
    }
  const supabase = await createClient()

  // Active cascades count
  const { count: depCount } = await supabase.from("cascade_dependencies").select("*", { count: "exact", head: true }).eq("user_id", user.id)

  return {
    activeCascades: depCount ?? 0,
    depCount: depCount ?? 0,
  }
}
