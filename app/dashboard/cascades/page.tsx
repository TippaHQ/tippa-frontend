import { CascadeEditor } from "@/components/cascades/cascade-editor"
import { CascadeSimulator } from "@/components/cascades/cascade-simulator"
import { CascadeRules } from "@/components/cascades/cascade-rules"

export default function CascadesPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Cascade Configuration
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Define how incoming payments split across your dependencies
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <div className="xl:col-span-3">
          <CascadeEditor />
        </div>
        <div className="space-y-6 xl:col-span-2">
          <CascadeSimulator />
          <CascadeRules />
        </div>
      </div>
    </div>
  )
}
