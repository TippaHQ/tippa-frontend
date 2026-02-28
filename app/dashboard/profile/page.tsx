import { ProfileCard } from "@/components/profile/profile-card"
import { ProfileLink } from "@/components/profile/profile-link"
import { EmbedGenerator } from "@/components/profile/embed-generator"
import { ProfileStats } from "@/components/profile/profile-stats"
import { ProfileDependencies } from "@/components/profile/profile-dependencies"
import { getProfile, getProfileAnalytics, getCascadeDependencies } from "@/lib/actions"

export default async function ProfilePage() {
  const [profile, analytics, deps] = await Promise.all([getProfile(), getProfileAnalytics(), getCascadeDependencies()])

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your public Tippa profile and discovery link</p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <ProfileCard profile={profile} />
          <ProfileLink username={profile?.username ?? null} />
          {profile?.username && <EmbedGenerator username={profile.username} />}
        </div>
        <div className="space-y-6">
          <ProfileStats analytics={analytics} />
          <ProfileDependencies dependencies={deps} />
        </div>
      </div>
    </div>
  )
}
