import { notFound } from "next/navigation"
import { getProfileByUsername } from "@/lib/actions"
import { EmbedDonateWidget } from "@/components/donate/embed-donate-widget"

type Props = { params: Promise<{ username: string }> }

export default async function EmbedPage({ params }: Props) {
  const { username } = await params
  const profile = await getProfileByUsername(username)
  if (!profile) notFound()
  return <EmbedDonateWidget profile={profile} />
}
