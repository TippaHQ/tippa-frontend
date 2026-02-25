export interface Profile {
  id: string
  display_name: string | null
  username: string | null
  bio: string | null
  avatar_url: string | null
  banner_url: string | null
  wallet_address: string
  federated_address: string | null
  default_asset: string
  stellar_network: string
  horizon_url: string
  github: string | null
  twitter: string | null
  website: string | null
  created_at: string
  updated_at: string
}

export interface CascadeDependency {
  id: string
  user_id: string
  label: string
  recipient_username: string
  percentage: number
  sort_order: number
  created_at: string
  updated_at: string
}

export interface CascadeRules {
  id: string
  user_id: string
  atomic_execution: boolean
  min_hop_enabled: boolean
  min_hop_amount: number
  auto_cascade: boolean
  created_at: string
  updated_at: string
}

export type TransactionType = "donate" | "distribute"
export type TransactionStatus = "completed" | "pending" | "failed"

export interface Transaction {
  id: string
  type: TransactionType
  from_address: string
  from_username: string | null
  to_address: string
  to_username: string
  amount: number
  asset: string
  status: TransactionStatus
  stellar_tx_hash: string | null
  created_at: string
}

export interface MonthlyFlowStat {
  id: string
  user_id: string
  month: string
  total_received: number
  total_forwarded: number
}

export interface NotificationPreferences {
  id: string
  user_id: string
  payment_received: boolean
  cascade_completed: boolean
  failed_transactions: boolean
  profile_views_digest: boolean
}

export interface ProfileAnalytics {
  id: string
  user_id: string
  profile_views: number
  unique_supporters: number
  total_payments_received: number
}

export type PartialTransaction = Pick<Transaction, "amount" | "asset" | "type" | "created_at" | "from_username" | "to_username">

export interface AggregatedData {
  date: string
  asset: string
  received: number
  forwarded: number
}
