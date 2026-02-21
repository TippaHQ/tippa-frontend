"use client"

import { WalletProvider } from "@/providers/wallet-provider"

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return <WalletProvider>{children}</WalletProvider>
}
