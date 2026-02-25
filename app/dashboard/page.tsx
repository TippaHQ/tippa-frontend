import { StatCards } from "@/components/dashboard/stat-cards"
import { FlowChart } from "@/components/dashboard/flow-chart"
import { RecentTransactions } from "@/components/dashboard/recent-transactions"
import { CascadePreview } from "@/components/dashboard/cascade-preview"
import { getDashboardStats, getMonthlyFlowStats, getTransactions, getCascadeDependencies, getProfile } from "@/lib/actions"

export default async function DashboardPage() {
  const [stats, monthlyStats, txResult, deps, profile] = await Promise.all([
    getDashboardStats(),
    getMonthlyFlowStats(),
    getTransactions({ limit: 5 }),
    getCascadeDependencies(),
    getProfile(),
  ])

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Overview of your cascading payment activity</p>
      </div>

      <StatCards activeCascades={stats.activeCascades} depCount={stats.depCount} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <FlowChart data={monthlyStats} />
        </div>
        <CascadePreview dependencies={deps} username={profile?.username ?? profile?.display_name ?? "you"} />
      </div>

      <RecentTransactions transactions={txResult.data} currentUsername={profile?.username ?? null} />
    </div>
  )
}
