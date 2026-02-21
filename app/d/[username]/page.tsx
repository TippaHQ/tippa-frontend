import { notFound } from "next/navigation"
import { getProfileByUsername, getPublicCascadeDependencies } from "@/lib/actions"
import { DonateForm } from "@/components/donate/donate-form"
import type { Metadata } from "next"

type Props = {
  params: Promise<{ username: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params
  const profile = await getProfileByUsername(username)

  if (!profile) {
    return { title: "User not found — Tippa" }
  }

  const name = profile.display_name || username
  return {
    title: `Donate to ${name} — Tippa`,
    description: profile.bio || `Send a donation to ${name} on the Stellar network via Tippa.`,
  }
}

export default async function DonatePage({ params }: Props) {
  const { username } = await params
  const profile = await getProfileByUsername(username)

  if (!profile) {
    notFound()
  }

  const dependencies = await getPublicCascadeDependencies(profile.id)

  return <DonateForm profile={profile} dependencies={dependencies} />
}
