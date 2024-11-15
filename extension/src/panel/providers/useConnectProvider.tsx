import { CHAIN_CURRENCY, CHAIN_NAME, EXPLORER_URL, RPC } from '@/chains'
import { BrowserProvider } from 'ethers'
import { MutableRefObject, useCallback, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { ChainId } from 'ser-kit'
import { ConnectProvider } from '../../connect/ConnectProvider'
import { memoWhilePending } from './memoWhilePending'

// Wallet extensions won't inject connectProvider to the extension panel, so we've built ConnectProvider.
// connectProvider can be used just like window.ethereum

const providerRef: MutableRefObject<ConnectProvider | null> = { current: null }
const getProvider = () => {
  if (providerRef.current == null) {
    providerRef.current = new ConnectProvider()
  }

  return providerRef.current
}

export const useConnectProvider = () => {
  const provider = getProvider()
  const [accounts, setAccounts] = useState<string[]>([])
  const [chainId, setChainId] = useState<number | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let canceled = false
    const ifNotCanceled =
      <Args extends any[]>(callback: (...operationParameters: Args) => void) =>
      (...args: Args) => {
        if (!canceled) {
          callback(...args)
        }
      }

    const handleAccountsChanged = ifNotCanceled((accounts: string[]) => {
      setAccounts(accounts)
    })

    const handleChainChanged = ifNotCanceled((chainIdHex: string) => {
      const chainId = parseInt(chainIdHex.slice(2), 16)

      setChainId(chainId)
    })

    const handleDisconnect = ifNotCanceled((error: Error) => {
      console.warn(error)
      setChainId(null)
      setAccounts([])
    })

    provider.on('accountsChanged', handleAccountsChanged)
    provider.on('chainChanged', handleChainChanged)
    provider.on('disconnect', handleDisconnect)
    provider.on('readyChanged', ifNotCanceled(setReady))

    return () => {
      if (!provider) {
        return
      }

      canceled = true

      provider.removeListener('accountsChanged', handleAccountsChanged)
      provider.removeListener('chainChanged', handleChainChanged)
      provider.removeListener('disconnect', handleDisconnect)
      provider.removeListener('readyChanged', setReady)
    }
  }, [provider])

  const connect = useCallback(
    async ({ force }: { force?: boolean } = {}) => {
      const { accounts, chainId: chainIdBigInt } = await connectInjectedWallet(
        { force },
        provider
      )
      const chainId = Number(chainIdBigInt)
      setAccounts(accounts)
      setChainId(chainId)
      return { accounts, chainId }
    },
    [provider]
  )

  return {
    provider,
    ready,
    connect,
    switchChain,
    accounts,
    chainId,
  }
}

interface InjectedWalletError extends Error {
  code: number
}

const connectInjectedWallet = memoWhilePending(
  async (provider: ConnectProvider) => {
    const browserProvider = new BrowserProvider(provider)

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
              provider.removeListener('accountsChanged', handleAccountsChanged)
            }

            provider.on('accountsChanged', handleAccountsChanged)
          })
        }

        throw err
      })

    const [accounts, chainId] = await Promise.all([
      accountsPromise,
      browserProvider.getNetwork().then((network) => network.chainId),
    ])

    return { accounts, chainId }
  }
)

const switchChain = async (chainId: ChainId) => {
  const provider = getProvider()

  try {
    await provider.request({
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
          provider.removeListener('chainChanged', handleChainChanged)
        }
        provider.on('chainChanged', handleChainChanged)
      })
      return
    }

    if ((err as InjectedWalletError).code === 4902) {
      // the requested chain has not been added by InjectedWallet
      await provider.request({
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
      provider.removeListener('chainChanged', handleChainChanged)
    }

    provider.on('chainChanged', handleChainChanged)
  })
}
