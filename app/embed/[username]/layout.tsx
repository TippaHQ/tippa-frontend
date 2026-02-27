"use client"

import { WalletProvider } from "@/providers/wallet-provider"

export default function EmbedLayout({ children }: { children: React.ReactNode }) {
  return <WalletProvider>{children}</WalletProvider>
}
