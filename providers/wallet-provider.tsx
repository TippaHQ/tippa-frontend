"use client"

import { createContext, useContext, useCallback, useEffect, type ReactNode } from "react"
import { WalletNetwork } from "@creit.tech/stellar-wallets-kit"
import { useLocalStorage } from "@/hooks/use-storage"
import { getKit } from "@/lib/stellar-kit"

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
  const [walletAddress, setWalletAddress] = useLocalStorage<string | null>("tippaWalletAddress", null)
  const [walletName, setWalletName] = useLocalStorage<string | null>("tippaWalletName", null)
  const [hasAutoConnect, setHasAutoConnect] = useLocalStorage<boolean>("tippaHasAutoConnectWallet", false)
  const isConnected = Boolean(walletAddress)

  const autoConnect = useCallback(async () => {
    try {
      const kit = getKit()
      if (walletName) kit.setWallet(walletName)
      else return

      if (!walletAddress) {
        const { address } = await kit.getAddress()
        setWalletAddress(address)
      }
    } catch (error) {
      console.warn("Auto-connect failed:", error)
      setHasAutoConnect(false)
    }
  }, [])

  useEffect(() => {
    if (hasAutoConnect) autoConnect()
  }, [])

  const connectWallet = useCallback(async () => {
    const kit = getKit()
    await kit.openModal({
      onWalletSelected: async (option) => {
        kit.setWallet(option.id)
        const { address } = await kit.getAddress()

        setWalletAddress(address)
        setWalletName(option.id)
        setHasAutoConnect(true)
      },
    })
  }, [])

  const disconnectWallet = useCallback(() => {
    setWalletAddress(null)
    setWalletName(null)
    setHasAutoConnect(false)
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
