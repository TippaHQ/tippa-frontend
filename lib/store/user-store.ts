import { create } from "zustand"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import type { Profile } from "@/lib/types"

interface UserState {
  user: User | null
  profile: Profile | null
  isLoading: boolean
  isAuthenticated: boolean
  initialize: () => Promise<void>
  fetchUser: () => Promise<void>
  fetchProfile: () => Promise<void>
  signOut: () => Promise<void>
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  profile: null,
  isLoading: true,
  isAuthenticated: false,

  initialize: async () => {
    set({ isLoading: true })
    await get().fetchUser()
    if (get().user) {
      await get().fetchProfile()
    }
    set({ isLoading: false })
  },

  fetchUser: async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    set({ user, isAuthenticated: !!user })
  },

  fetchProfile: async () => {
    const { user } = get()
    if (!user) return

    const supabase = createClient()
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single()
    set({ profile: data })
  },

  signOut: async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    set({ user: null, profile: null, isAuthenticated: false })
  },
}))
