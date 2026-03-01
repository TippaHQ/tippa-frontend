import { ThemeToggle } from "@/components/theme-toggle"
import { AppLogo } from "@/components/shared/app-logo"

export default function DonationLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[1200px] w-[1200px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#15C19F]/10 blur-[100px]" />
        <div className="absolute left-0 bottom-0 h-[600px] w-[600px] -translate-x-1/2 translate-y-1/2 rounded-full bg-[#15C19F]/10 blur-[100px]" />
        <div className="absolute right-0 bottom-0 h-[600px] w-[600px] translate-x-1/2 translate-y-1/2 rounded-full bg-[#15C19F]/10 blur-[100px]" />
      </div>

      <header className="relative flex items-center justify-between p-4">
        <a href="/" className="flex items-center gap-2.5">
          <AppLogo />
        </a>
        <ThemeToggle />
      </header>

      <main className="relative mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:py-16">{children}</main>
    </div>
  )
}
