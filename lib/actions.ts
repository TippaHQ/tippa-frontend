"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import type {
  Profile,
  CascadeDependency,
  CascadeRules,
  Transaction,
  PartialTransaction,
  NotificationPreferences,
  ProfileAnalytics,
} from "@/lib/types"
import { parseTransactions } from "@/lib/utils"

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
  const { data } = await supabase.from("cascade_dependencies").select("*").eq("user_id", userId).order("sort_order", { ascending: true })
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
  type?: "donate" | "distribute"
  search?: string
  limit?: number
  offset?: number
}): Promise<{ data: Transaction[]; count: number }> {
  const profile = await getProfile()
  if (!profile?.username) return { data: [], count: 0 }
  const supabase = await createClient()

  let query = supabase
    .from("transactions")
    .select("*", { count: "exact" })
    .or(`from_username.eq.${profile.username},to_username.eq.${profile.username}`)
    .order("created_at", { ascending: false })

  if (opts?.type) {
    query = query.eq("type", opts.type)
  }
  if (opts?.search) {
    // Sanitize search input to prevent PostgREST filter injection
    const q = opts.search.replace(/[,.()"\\]/g, "")
    if (q) {
      query = query.or(`from_username.ilike.%${q}%,to_username.ilike.%${q}%,from_address.ilike.%${q}%,stellar_tx_hash.ilike.%${q}%`)
    }
  }
  if (opts?.limit) {
    const offset = opts.offset ?? 0
    query = query.range(offset, offset + opts.limit - 1)
  }

  const { data, count } = await query
  return { data: data ?? [], count: count ?? 0 }
}

// ────────────────────────────────────────────────────────────
// Payment Flow Stats (dashboard chart)
// ────────────────────────────────────────────────────────────

export interface PaymentFlowStats {
  date: string
  asset: string
  received: number
  forwarded: number
}

export async function getPaymentFlowStats(): Promise<PaymentFlowStats[]> {
  const profile = await getProfile()
  if (!profile?.username) return []

  const supabase = await createClient()
  const { data } = await supabase
    .from("transactions")
    .select("amount, asset, type, created_at, from_username, to_username")
    .eq("status", "completed")
    .or(`from_username.eq.${profile.username},to_username.eq.${profile.username}`)
    .order("created_at", { ascending: true })

  if (!data) return []
  return parseTransactions(data as PartialTransaction[], profile.username)
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

// ────────────────────────────────────────────────────────────
// Upload image (with sharp optimisation)
// ────────────────────────────────────────────────────────────

/** Image-type presets used by sharp before uploading to Supabase storage. */
const IMAGE_PRESETS = {
  avatar: { width: 300, height: 300 },
  banner: { width: 1000, height: 300 },
} as const

const IMAGE_BUCKETS = {
  avatar: "profile-avatars",
  banner: "profile-banners",
} as const

export type ImageType = keyof typeof IMAGE_PRESETS

export async function uploadImage(file: File, imageType: ImageType, imageName: string) {
  // Dynamically import sharp so it is only loaded on the server at runtime
  const sharp = (await import("sharp")).default

  const { width, height } = IMAGE_PRESETS[imageType]
  const bucket = IMAGE_BUCKETS[imageType]

  // Convert the Web API File to a Node.js Buffer
  const arrayBuffer = await file.arrayBuffer()
  const inputBuffer = Buffer.from(arrayBuffer)

  // Optimise: resize with cover crop → convert to WebP
  const optimisedBuffer = await sharp(inputBuffer).resize(width, height).webp({ quality: 85 }).toBuffer()

  // Keep a stable, collision-free filename
  const ext = ".webp"
  const fileName = `${imageName}${ext}`

  const supabase = await createClient()
  const { data, error } = await supabase.storage.from(bucket).upload(fileName, optimisedBuffer, {
    contentType: "image/webp",
    upsert: true,
  })

  if (error) return { error }
  return { url: data?.path }
}

// ────────────────────────────────────────────────────────────
// Update avatar and banner images
// ────────────────────────────────────────────────────────────

export type UpdateImageResponse = { error: string | null }

export async function updateAvatar(file: File, username: string): Promise<UpdateImageResponse> {
  const user = await getCurrentUser()
  if (!user) return { error: "Not authenticated" }

  const profile = await getProfile()
  if (profile?.username !== username) return { error: "Not authorized" }

  const imageName = `${username}-profile-avatar`
  const { url, error } = await uploadImage(file, "avatar", imageName)
  if (error) return { error: error.message }

  const { error: updateError } = await updateProfile({ avatar_url: url })
  if (updateError) return { error: updateError }
  return { error: null }
}

// ────────────────────────────────────────────────────────────
// Waitlist
// ────────────────────────────────────────────────────────────

export type WaitlistEntry = {
  id: string
  email: string
  name: string
  role: string | null
  status: string
  created_at: string
}

export type WaitlistPosition = {
  position: number
  total: number
}

export type WaitlistStatus = "EXISTING" | "ERROR" | "SUCCESS"

export async function joinWaitlist(email: string, name: string, role?: string): Promise<{ status: WaitlistStatus; error: string | null }> {
  const supabase = await createClient()

  const { data: existing } = await supabase.from("waitlist").select("id, status").eq("email", email.toLowerCase()).single()
  if (existing) {
    if (existing.status === "approved") {
      return { status: "EXISTING", error: "You already have access! Please sign up." }
    }
    return { status: "EXISTING", error: "You're already on the waitlist. We'll notify you when spots open up." }
  }

  const { error } = await supabase.from("waitlist").insert({
    email: email.toLowerCase(),
    name,
    role: role || null,
    status: "pending",
  })

  if (error) {
    if (error.code === "23505") {
      return { status: "EXISTING", error: "You're already on the waitlist!" }
    }
    return { status: "ERROR", error: error.message }
  }

  return { status: "SUCCESS", error: null }
}

export async function getWaitlistPosition(email: string): Promise<WaitlistPosition | null> {
  const supabase = await createClient()

  const { data: entry } = await supabase.from("waitlist").select("created_at").eq("email", email.toLowerCase()).single()

  if (!entry) return null

  const { count } = await supabase
    .from("waitlist")
    .select("*", { count: "exact", head: true })
    .lt("created_at", entry.created_at)
    .eq("status", "pending")

  const { count: total } = await supabase.from("waitlist").select("*", { count: "exact", head: true }).eq("status", "pending")

  return {
    position: (count ?? 0) + 1,
    total: total ?? 0,
  }
}

export async function getWaitlistCount(): Promise<number> {
  const supabase = await createClient()
  const { count } = await supabase.from("waitlist").select("*", { count: "exact", head: true }).eq("status", "pending")
  return count ?? 0
}
