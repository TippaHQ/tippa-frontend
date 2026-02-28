export function LegalLayout({ title, lastUpdated, children }: { title: string; lastUpdated?: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-12 md:py-20 text-foreground">
      <h1 className="text-3xl font-bold tracking-tight md:text-5xl">{title}</h1>
      {lastUpdated && <p className="mt-4 text-sm text-muted-foreground">Last updated: {lastUpdated}</p>}

      <div className="mt-10 space-y-6 text-sm leading-relaxed text-muted-foreground sm:text-base">{children}</div>
    </div>
  )
}
