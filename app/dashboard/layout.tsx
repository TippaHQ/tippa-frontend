"use client"

import { usePathname } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { TopBar } from "@/components/top-bar"
import { WalletProvider } from "@/providers/wallet-provider"
import { SidebarProvider } from "@/components/ui/sidebar"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  if (pathname.startsWith("/dashboard/onboarding")) {
    return <>{children}</>
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <WalletProvider>
        <SidebarProvider>
          <AppSidebar />
          <div className="flex flex-1 flex-col overflow-hidden">
            <TopBar />
            <main className="flex-1 overflow-y-auto p-6">{children}</main>
          </div>
        </SidebarProvider>
      </WalletProvider>
    </div>
  )
}
