import { Web3Provider } from '@ethersproject/providers'
import React, {
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

import { Eip1193Provider } from '../types'

interface MetaMaskContextT {
  provider: Eip1193Provider | undefined
  accounts: string[]
  chainId: number | null
}
const MetaMaskContext = React.createContext<MetaMaskContextT | null>(null)

declare global {
  interface Window {
    ethereum?: Eip1193Provider
  }
}

export const ProvideMetaMask: React.FC<{
  children: ReactNode
}> = ({ children }) => {
  const [accounts, setAccounts] = useState<string[]>([])
  const [chainId, setChainId] = useState<number | null>(null)

  useEffect(() => {
    if (!window.ethereum) return

    let canceled = true
    const ifNotCanceled =
      (callback: (...args: any[]) => void) =>
      (...args: any[]) => {
        if (!canceled) {
          callback(...args)
        }
      }

    const handleAccountsChanged = ifNotCanceled((accounts: string[]) => {
      console.log(`MetaMask accounts changed to ${accounts}`)
      setAccounts(accounts)
    })

    const handleNetworkChanged = ifNotCanceled((chainId: number) => {
      console.log(`MetaMask network changed to ${chainId}`)
      setChainId(chainId)
    })

    const handleDisconnect = ifNotCanceled((error: Error) => {
      console.warn(error)
      setChainId(null)
      setAccounts([])
    })

    window.ethereum.on('accountsChanged', handleAccountsChanged)
    window.ethereum.on('networkChanged', handleNetworkChanged)
    window.ethereum.on('disconnect', handleDisconnect)

    const web3Provider = new Web3Provider(window.ethereum)
    web3Provider
      .send('eth_requestAccounts', [])
      .then((accounts: string[]) => setAccounts(accounts))
    web3Provider
      .getNetwork()
      .then(ifNotCanceled((network) => setChainId(network.chainId)))

    return () => {
      if (!window.ethereum) return
      canceled = true
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
      window.ethereum.removeListener('networkChanged', handleNetworkChanged)
      window.ethereum.removeListener('disconnect', handleDisconnect)
    }
  }, [])

  const packed = useMemo(
    () => ({
      provider: window.ethereum,
      accounts,
      chainId,
    }),
    [accounts, chainId]
  )

  return (
    <MetaMaskContext.Provider value={packed}>
      {children}
    </MetaMaskContext.Provider>
  )
}

const useMetaMaskProvider = () => {
  const context = useContext(MetaMaskContext)
  if (!context) {
    throw new Error(
      'useMetaMaskProvider must be used within a <ProvideMetaMask>'
    )
  }
  return context
}

export default useMetaMaskProvider
