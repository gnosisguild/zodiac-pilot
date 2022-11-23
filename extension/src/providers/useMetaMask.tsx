import { Web3Provider } from '@ethersproject/providers'
import React, {
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  ChainId,
  EXPLORER_URL,
  NETWORK_CURRENCY,
  NETWORK_NAME,
  RPC,
} from '../networks'
import { Eip1193Provider } from '../types'

interface MetaMaskContextT {
  provider: Eip1193Provider | undefined
  connect: () => Promise<{ chainId: number; accounts: string[] }>
  switchChain: (chainId: ChainId) => Promise<void>
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

    let canceled = false
    const ifNotCanceled =
      <Args extends any[]>(callback: (...operationParameters: Args) => void) =>
      (...args: Args) => {
        if (!canceled) {
          callback(...args)
        }
      }

    const handleAccountsChanged = ifNotCanceled((accounts: string[]) => {
      console.log(`MetaMask accounts changed to ${accounts}`)
      setAccounts(accounts)
    })

    const handleChainChanged = ifNotCanceled((chainIdHex: string) => {
      const chainId = parseInt(chainIdHex.slice(2), 16)
      console.log(`MetaMask network changed to ${chainId}`)
      setChainId(chainId)
    })

    const handleDisconnect = ifNotCanceled((error: Error) => {
      console.warn(error)
      setChainId(null)
      setAccounts([])
    })

    window.ethereum.on('accountsChanged', handleAccountsChanged)
    window.ethereum.on('chainChanged', handleChainChanged)
    window.ethereum.on('disconnect', handleDisconnect)

    return () => {
      if (!window.ethereum) return
      canceled = true
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
      window.ethereum.removeListener('chainChanged', handleChainChanged)
      window.ethereum.removeListener('disconnect', handleDisconnect)
    }
  }, [])

  const connect = useCallback(async () => {
    if (!window.ethereum) throw new Error('MetaMask not found')

    const web3Provider = new Web3Provider(window.ethereum)
    const [accounts, chainId] = await Promise.all([
      web3Provider
        .send('eth_requestAccounts', [])
        .then((accounts: string[]) => {
          return accounts
        }),
      web3Provider.getNetwork().then((network) => network.chainId),
    ])

    setAccounts(accounts)
    setChainId(chainId)

    return { accounts, chainId }
  }, [])

  const switchChain = useCallback(async (chainId: ChainId) => {
    if (!window.ethereum) throw new Error('MetaMask not found')

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      })
    } catch (err) {
      if ((err as MetaMaskError).code === 4902) {
        // the requested chain has not been added by MetaMask
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: `0x${chainId.toString(16)}`,
              chainName: NETWORK_NAME[chainId],
              nativeCurrency: {
                name: NETWORK_CURRENCY[chainId],
                symbol: NETWORK_CURRENCY[chainId],
                decimals: 18,
              },
              rpcUrls: [RPC[chainId]],
              blockExplorerUrls: [EXPLORER_URL[chainId]],
            },
          ],
        })
      } else {
        throw err
      }
    }
  }, [])

  const packed = useMemo(
    () => ({
      provider: window.ethereum,
      connect,
      switchChain,
      accounts,
      chainId,
    }),
    [accounts, connect, chainId, switchChain]
  )

  return (
    <MetaMaskContext.Provider value={packed}>
      {children}
    </MetaMaskContext.Provider>
  )
}

const useMetaMask = () => {
  const context = useContext(MetaMaskContext)
  if (!context) {
    throw new Error(
      'useMetaMaskProvider must be used within a <ProvideMetaMask>'
    )
  }
  return context
}

export default useMetaMask

interface MetaMaskError extends Error {
  code: number
}
