"use client"

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import type { MonthlyFlowStat } from "@/lib/types"

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

function formatMonthLabel(monthStr: string) {
  const d = new Date(monthStr)
  return MONTH_NAMES[d.getMonth()] ?? monthStr
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ value: number; dataKey: string; color: string }>
  label?: string
}) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-border bg-popover p-3 shadow-lg">
        <p className="mb-2 text-xs font-medium text-muted-foreground">{label}</p>
        {payload.map((p) => (
          <div key={p.dataKey} className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="text-xs capitalize text-muted-foreground">{p.dataKey}:</span>
            <span className="text-xs font-medium text-foreground">${Number(p.value).toLocaleString()}</span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

interface FlowChartProps {
  data: MonthlyFlowStat[]
}

export function FlowChart({ data }: FlowChartProps) {
  const chartData = data.map((d) => ({
    date: formatMonthLabel(d.month),
    received: Number(d.total_received),
    forwarded: Number(d.total_forwarded),
  }))

  const isEmpty = chartData.length === 0

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Payment Flow</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {isEmpty ? "No flow data yet -- stats will appear as transactions come in" : "Received vs forwarded over time"}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-primary" />
            <span className="text-xs text-muted-foreground">Received</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-[hsl(var(--chart-2))]" />
            <span className="text-xs text-muted-foreground">Forwarded</span>
          </div>
        </div>
      </div>
      <div className="h-[280px]">
        {isEmpty ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No payment flow data to display yet.</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="receivedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(168, 80%, 50%)" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="hsl(168, 80%, 50%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="forwardedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(200, 70%, 50%)" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="hsl(200, 70%, 50%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(230, 12%, 18%)" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: "hsl(215, 15%, 55%)", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "hsl(215, 15%, 55%)", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="received" stroke="hsl(168, 80%, 50%)" strokeWidth={2} fill="url(#receivedGrad)" />
              <Area type="monotone" dataKey="forwarded" stroke="hsl(200, 70%, 50%)" strokeWidth={2} fill="url(#forwardedGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
