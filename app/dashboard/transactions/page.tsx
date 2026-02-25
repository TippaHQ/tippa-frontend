import { getTransactions, getProfile } from "@/lib/actions"
import { TransactionsClient } from "@/components/transactions/transactions-client"

export default async function TransactionsPage() {
  const [{ data, count }, profile] = await Promise.all([
    getTransactions({ limit: 20 }),
    getProfile(),
  ])

  return (
    <TransactionsClient
      initialTransactions={data}
      initialCount={count}
      currentUsername={profile?.username ?? null}
    />
  )
}
