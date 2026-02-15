import { StatCards } from "@/components/dashboard/stat-cards"
import { FlowChart } from "@/components/dashboard/flow-chart"
import { RecentTransactions } from "@/components/dashboard/recent-transactions"
import { CascadePreview } from "@/components/dashboard/cascade-preview"

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Overview of your cascading payment activity
        </p>
      </div>

      {/* Stat Cards */}
      <StatCards />

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <FlowChart />
        </div>
        <CascadePreview />
      </div>

      {/* Recent Transactions */}
      <RecentTransactions />
    </div>
  )
}
