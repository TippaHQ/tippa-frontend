"use client"

import { WalletProvider } from "@/providers/wallet-provider"

export default function DonateLayout({ children }: { children: React.ReactNode }) {
  return <WalletProvider>{children}</WalletProvider>
}
