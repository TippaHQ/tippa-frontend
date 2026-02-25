"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import { WalletNetwork } from "@creit.tech/stellar-wallets-kit"
import { getKit } from "@/lib/stellar-kit"
import { useUserStore } from "@/lib/store/user-store"

type WalletContextType = {
  walletAddress: string | null
  walletName: string | null
  isConnected: boolean
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
  signTransaction: (xdr: string, address?: string) => Promise<string>
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: ReactNode }) {
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [walletName, setWalletName] = useState<string | null>(null)
  const [autoConnected, setAutoConnected] = useState(false)

  const profile = useUserStore((state) => state.profile)
  const isLoading = useUserStore((state) => state.isLoading)

  const isConnected = Boolean(walletAddress)

  const autoConnect = useCallback(async (address: string) => {
    try {
      const kit = getKit()
      const allWallets = await kit.getSupportedWallets()

      for (const wallet of allWallets) {
        try {
          kit.setWallet(wallet.id)
          const walletAddress = await kit.getAddress()
          if (walletAddress.address === address) {
            setWalletAddress(walletAddress.address)
            setWalletName(wallet.name)
            setAutoConnected(true)
            return true
          }
        } catch {
          continue
        }
      }
    } catch (error) {
      console.warn("Auto-connect failed:", error)
    }
    return false
  }, [])

  useEffect(() => {
    if (!isLoading && profile?.wallet_address && !autoConnected && !walletAddress) {
      autoConnect(profile.wallet_address)
    }
  }, [isLoading, profile?.wallet_address, autoConnected, walletAddress, autoConnect])

  const connectWallet = useCallback(async () => {
    const kit = getKit()
    await kit.openModal({
      onWalletSelected: async (option) => {
        kit.setWallet(option.id)
        const { address } = await kit.getAddress()

        setWalletAddress(address)
        setWalletName(option.name)
        setAutoConnected(true)
      },
    })
  }, [])

  const disconnectWallet = useCallback(() => {
    setWalletAddress(null)
    setWalletName(null)
    setAutoConnected(false)
  }, [])

  const signTransaction = useCallback(async (xdr: string, address?: string): Promise<string> => {
    const kit = getKit()
    const { signedTxXdr } = await kit.signTransaction(xdr, {
      networkPassphrase: WalletNetwork.TESTNET,
      address,
    })
    return signedTxXdr
  }, [])

  return (
    <WalletContext.Provider
      value={{
        walletAddress,
        walletName,
        isConnected,
        connectWallet,
        disconnectWallet,
        signTransaction,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider")
  }
  return context
}
