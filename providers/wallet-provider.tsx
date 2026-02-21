"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
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

const STORAGE_ADDRESS_KEY = "stellar_wallet_address"
const STORAGE_NAME_KEY = "stellar_wallet_name"

export function WalletProvider({ children }: { children: ReactNode }) {
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [walletName, setWalletName] = useState<string | null>(null)

  const isConnected = Boolean(walletAddress)

  // Restore persisted session on mount
  useEffect(() => {
    const savedAddress = localStorage.getItem(STORAGE_ADDRESS_KEY)
    const savedName = localStorage.getItem(STORAGE_NAME_KEY)
    if (savedAddress && savedName) {
      setWalletAddress(savedAddress)
      setWalletName(savedName)
    }
  }, [])

  const connectWallet = useCallback(async () => {
    const kit = getKit()
    await kit.openModal({
      onWalletSelected: async (option) => {
        kit.setWallet(option.id)
        const { address } = await kit.getAddress()

        setWalletAddress(address)
        setWalletName(option.name)

        localStorage.setItem(STORAGE_ADDRESS_KEY, address)
        localStorage.setItem(STORAGE_NAME_KEY, option.name)
      },
    })
  }, [])

  const disconnectWallet = useCallback(() => {
    setWalletAddress(null)
    setWalletName(null)
    localStorage.removeItem(STORAGE_ADDRESS_KEY)
    localStorage.removeItem(STORAGE_NAME_KEY)
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
