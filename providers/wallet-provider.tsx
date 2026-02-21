"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import { WalletNetwork } from "@creit.tech/stellar-wallets-kit"
import { getKit } from "@/lib/stellar-kit"

type WalletContextType = {
  walletAddress: string | null
  walletName: string | null
  isConnected: boolean
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
  signTransaction: (xdr: string) => Promise<string>
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: ReactNode }) {
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [walletName, setWalletName] = useState<string | null>(null)

  const isConnected = Boolean(walletAddress)

  const connectWallet = useCallback(async () => {
    const kit = getKit()
    await kit.openModal({
      onWalletSelected: async (option) => {
        kit.setWallet(option.id)
        const { address } = await kit.getAddress()

        setWalletAddress(address)
        setWalletName(option.name)
      },
    })
  }, [])

  const disconnectWallet = useCallback(() => {
    setWalletAddress(null)
    setWalletName(null)
  }, [])

  const signTransaction = useCallback(async (xdr: string): Promise<string> => {
    const kit = getKit()
    const { signedTxXdr } = await kit.signTransaction(xdr, {
      networkPassphrase: WalletNetwork.TESTNET,
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
