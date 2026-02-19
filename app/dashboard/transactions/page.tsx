import { getTransactions } from "@/lib/actions"
import { TransactionsClient } from "@/components/transactions/transactions-client"

export default async function TransactionsPage() {
  const { data, count } = await getTransactions({ limit: 20 })

  return <TransactionsClient initialTransactions={data} initialCount={count} />
}
