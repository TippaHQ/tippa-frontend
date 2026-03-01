import { getUserDonations } from "@/lib/actions"
import { DonationsClient } from "@/components/donations/donations-client"

export default async function DonationsPage() {
  const { data, count } = await getUserDonations()

  return <DonationsClient initialDonations={data} initialCount={count} />
}
