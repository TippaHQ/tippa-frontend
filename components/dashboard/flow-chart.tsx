"use client"

import { useState, useMemo } from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart"

import type { PaymentFlowStats } from "@/lib/actions"
import { TESTNET_ASSETS, DEFAULT_ASSET_ID } from "@/lib/constants/assets"
import { cn } from "@/lib/utils"

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
const config: ChartConfig = {
  date: { label: "Transactions by Month" },
  received: {
    label: "Received",
    color: "hsl(var(--chart-1))",
  },
  forwarded: {
    label: "Forwarded",
    color: "hsl(var(--chart-2))",
  },
}

// Format month label for chart
function formatMonthLabel(monthStr: string) {
  const monthRegex = /-(\d{2})$/ // Match the month number in YYYY-MM format
  const monthNumber = monthRegex.exec(monthStr)?.[1]
  return MONTH_NAMES[Number(monthNumber) - 1] ?? monthStr
}

// Filter graph data by asset
function filterByAsset(data: PaymentFlowStats[], asset: string) {
  return data.filter((tx) => tx.asset === asset)
}

interface FlowChartProps {
  data: PaymentFlowStats[]
  className?: string
}

export function FlowChart({ data, className }: FlowChartProps) {
  const [asset, setAsset] = useState(DEFAULT_ASSET_ID)

  const chartData = useMemo(() => filterByAsset(data, asset), [data, asset])
  const isEmpty = chartData.length === 0

  return (
    <div className={cn("rounded-xl border border-border bg-card p-5", className)}>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Payment Flow</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">Received vs forwarded by month</p>
        </div>
        <Select value={asset} onValueChange={(value) => setAsset(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select asset" />
          </SelectTrigger>
          <SelectContent>
            {TESTNET_ASSETS.map((asset) => (
              <SelectItem key={asset.id} value={asset.id}>
                {asset.symbol}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        {isEmpty ? (
          <p className="flex h-full items-center justify-center text-sm text-muted-foreground">No payment flow data to display yet.</p>
        ) : (
          <ChartContainer config={config} className="min-h-[100px] w-full">
            <BarChart accessibilityLayer data={chartData}>
              <CartesianGrid vertical={false} strokeDasharray="5 5" />
              <XAxis dataKey="date" tickLine={false} tickMargin={10} axisLine={false} tickFormatter={formatMonthLabel} />
              <YAxis tickLine={false} axisLine={false} tickMargin={10} tickFormatter={(value) => `$${value.toLocaleString()}`} />
              <ChartTooltip content={<ChartTooltipContent labelKey="date" />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="received" fill="hsl(var(--chart-1))" radius={4} />
              <Bar dataKey="forwarded" fill="hsl(var(--chart-2))" radius={4} />
            </BarChart>
          </ChartContainer>
        )}
      </div>
    </div>
  )
}
