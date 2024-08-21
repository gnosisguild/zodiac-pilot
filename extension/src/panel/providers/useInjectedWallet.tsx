import React, {
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { toast } from 'react-toastify'
import { ChainId } from 'ser-kit'

import { EXPLORER_URL, CHAIN_CURRENCY, CHAIN_NAME, RPC } from '../../chains'
import { Eip1193Provider } from '../../types'
import { BrowserProvider } from 'ethers'

export interface InjectedWalletContextT {
  provider: Eip1193Provider | undefined
  connect: () => Promise<{ chainId: number; accounts: string[] }>
  switchChain: (chainId: ChainId) => Promise<void>
  accounts: string[]
  chainId: number | null
}
const InjectedWalletContext =
  React.createContext<InjectedWalletContextT | null>(null)

declare global {
  interface Window {
    ethereum?: Eip1193Provider
  }
}

export const ProvideInjectedWallet: React.FC<{
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
      console.log(`InjectedWallet accounts changed to ${accounts}`)
      setAccounts(accounts)
    })

    const handleChainChanged = ifNotCanceled((chainIdHex: string) => {
      const chainId = parseInt(chainIdHex.slice(2), 16)
      console.log(`InjectedWallet network changed to ${chainId}`)
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
    const { accounts, chainId: chainIdBigInt } = await connectInjectedWallet()
    const chainId = Number(chainIdBigInt)
    setAccounts(accounts)
    setChainId(chainId)
    return { accounts, chainId }
  }, [])

  const packed = useMemo(
    () => ({
      provider: window.ethereum,
      connect,
      switchChain,
      accounts,
      chainId,
    }),
    [accounts, connect, chainId]
  )

  return (
    <InjectedWalletContext.Provider value={packed}>
      <iframe
        title="InjectedWallet"
        src="https://pilot.gnosisguild.org"
        hidden
      />
      {children}
    </InjectedWalletContext.Provider>
  )
}

const useInjectedWallet = () => {
  const context = useContext(InjectedWalletContext)
  if (!context) {
    throw new Error(
      'useInjectedWalletProvider must be used within a <ProvideInjectedWallet>'
    )
  }
  return context
}

export default useInjectedWallet

interface InjectedWalletError extends Error {
  code: number
}

let pendingPromise: Promise<any> | null = null
const memoWhilePending = <T extends (...args: any) => Promise<any>>(
  callback: T
): T =>
  ((...args) => {
    if (pendingPromise) return pendingPromise
    pendingPromise = callback(...args)
    pendingPromise.finally(() => {
      pendingPromise = null
    })
    return pendingPromise
  }) as T

const connectInjectedWallet = memoWhilePending(async () => {
  if (!window.ethereum) throw new Error('InjectedWallet not found')

  const browserProvider = new BrowserProvider(window.ethereum)

  const accountsPromise = browserProvider
    .send('eth_requestAccounts', [])
    .catch((err: any) => {
      if ((err as InjectedWalletError).code === -32002) {
        return new Promise((resolve: (value: string[]) => void) => {
          const toastId = toast.warn(
            <>Check your wallet to confirm connection</>,
            { autoClose: false }
          )
          const handleAccountsChanged = (accounts: string[]) => {
            resolve(accounts)
            toast.dismiss(toastId)
            window.ethereum?.removeListener(
              'accountsChanged',
              handleAccountsChanged
            )
          }
          window.ethereum?.on('accountsChanged', handleAccountsChanged)
        })
      }

      throw err
    })

  const [accounts, chainId] = await Promise.all([
    accountsPromise,
    browserProvider.getNetwork().then((network) => network.chainId),
  ])

  return { accounts, chainId }
})

const switchChain = async (chainId: ChainId) => {
  if (!window.ethereum) throw new Error('InjectedWallet not found')

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${chainId.toString(16)}` }],
    })
  } catch (err) {
    if ((err as InjectedWalletError).code === -32002) {
      // another wallet_switchEthereumChain request is already pending
      await new Promise((resolve: (value: void) => void) => {
        const toastId = toast.warn(
          <>Check your wallet to confirm switching the network</>,
          { autoClose: false }
        )
        const handleChainChanged = () => {
          resolve()
          toast.dismiss(toastId)
          window.ethereum?.removeListener('chainChanged', handleChainChanged)
        }
        window.ethereum?.on('chainChanged', handleChainChanged)
      })
      return
    }

    if ((err as InjectedWalletError).code === 4902) {
      // the requested chain has not been added by InjectedWallet
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: `0x${chainId.toString(16)}`,
            chainName: CHAIN_NAME[chainId],
            nativeCurrency: {
              name: CHAIN_CURRENCY[chainId],
              symbol: CHAIN_CURRENCY[chainId],
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

  // wait for chain change event (InjectedWallet will emit this event only after some delay, so our state that reacts to this event would be out of sync if we don't wait here)
  await new Promise((resolve: (value: void) => void) => {
    const handleChainChanged = () => {
      resolve()
      window.ethereum?.removeListener('chainChanged', handleChainChanged)
    }
    window.ethereum?.on('chainChanged', handleChainChanged)
  })
}
