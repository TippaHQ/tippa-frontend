import { GitFork } from "lucide-react"
import { cn } from "@/lib/utils"

const logoSizes = {
  sm: "size-6",
  md: "size-8",
  lg: "size-11",
}

export function AppLogo({ hideTitle = false, className, size = "sm" }: { hideTitle?: boolean; className?: string; size?: keyof typeof logoSizes }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative p-1.5 bg-primary rounded-sm group-data-[collapsible=icon]:p-1.5 transition-all">
        <GitFork className={`group-data-[collapsible=icon]:size-5 ${logoSizes[size]} shrink-0 text-primary-foreground transition-all`} />
      </div>
      {!hideTitle && <span className="text-xl font-semibold tracking-tight">Tippa</span>}
    </div>
  )
}
