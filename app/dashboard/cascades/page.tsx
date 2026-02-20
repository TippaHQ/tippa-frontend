import { CascadeEditor } from "@/components/cascades/cascade-editor"
import { CascadeSimulator } from "@/components/cascades/cascade-simulator"
import { CascadeRules } from "@/components/cascades/cascade-rules"
import { getCascadeDependencies, getCascadeRules } from "@/lib/actions"

export default async function CascadesPage() {
  const [deps, rules] = await Promise.all([getCascadeDependencies(), getCascadeRules()])

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Cascade Configuration</h1>
          <p className="mt-1 text-sm text-muted-foreground">Define how incoming payments split across your dependencies</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <div className="xl:col-span-3">
          <CascadeEditor initialDeps={deps} />
        </div>
        <div className="space-y-6 xl:col-span-2">
          <CascadeSimulator dependencies={deps} />
          <CascadeRules rules={rules} />
        </div>
      </div>
    </div>
  )
}
