import { getProfile, getNotificationPreferences } from "@/lib/actions"
import { SettingsClient } from "@/components/settings/settings-client"

export default async function SettingsPage() {
  const [profile, notifPrefs] = await Promise.all([getProfile(), getNotificationPreferences()])

  return <SettingsClient profile={profile} notifPrefs={notifPrefs} />
}
