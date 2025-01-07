import { CHAIN_CURRENCY, CHAIN_NAME, EXPLORER_URL, RPC } from '@/chains'
import { infoToast } from '@/components'
import type { Eip1193Provider } from '@/types'
import { invariant } from '@epic-web/invariant'
import { useEffect, useState } from 'react'
import type { ChainId } from 'ser-kit'
import type { ConnectionStatus } from '../connectTypes'
import {
  useConnectProviderInstance,
  useConnectProviderReady,
} from './ConnectProviderContext'
import type { InjectedWalletError } from './InjectedWalletError'
import { useConnect } from './useConnect'

// Wallet extensions won't inject connectProvider to the extension panel, so we've built ConnectProvider.
// connectProvider can be used just like window.ethereum

export const useConnectProvider = () => {
  const provider = useConnectProviderInstance()
  const ready = useConnectProviderReady()
  const [accounts, setAccounts] = useState<string[]>([])
  const [chainId, setChainId] = useState<ChainId | null>(null)

  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>('disconnected')

  useEffect(() => {
    if (provider == null) {
      return
    }

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

      setChainId(chainId as unknown as ChainId)
    })

    const handleDisconnect = ifNotCanceled((error: Error) => {
      console.warn(error)
      setChainId(null)
      setAccounts([])
    })

    provider.on('accountsChanged', handleAccountsChanged)
    provider.on('chainChanged', handleChainChanged)
    provider.on('disconnect', handleDisconnect)

    return () => {
      canceled = true

      provider.removeListener('accountsChanged', handleAccountsChanged)
      provider.removeListener('chainChanged', handleChainChanged)
      provider.removeListener('disconnect', handleDisconnect)
    }
  }, [provider])

  const connect = useConnect(provider, {
    onBeforeConnect() {
      setConnectionStatus('connecting')
    },
    onConnect(chainId, accounts) {
      setChainId(chainId)
      setAccounts(accounts)

      setConnectionStatus('connected')
    },
    onError() {
      setConnectionStatus('error')
    },
  })

  return {
    provider,
    ready,
    connect,
    connectionStatus,
    switchChain: (chainId: ChainId) => {
      invariant(
        provider != null,
        'Cannot switch chain because the provider has not been set up, yet.',
      )

      return switchChain(provider, chainId)
    },
    accounts,
    chainId,
  }
}

const switchChain = async (provider: Eip1193Provider, chainId: ChainId) => {
  try {
    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${chainId.toString(16)}` }],
    })
  } catch (err) {
    if ((err as InjectedWalletError).code === -32002) {
      // another wallet_switchEthereumChain request is already pending
      const { promise, resolve } = Promise.withResolvers<void>()

      const { dismiss } = infoToast({
        title: 'Chain',
        message: 'Check your wallet to confirm switching the network',
      })

      const handleChainChanged = (): void => {
        dismiss()
        provider.removeListener('chainChanged', handleChainChanged)

        resolve()
      }

      provider.on('chainChanged', handleChainChanged)

      return promise
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

  const { promise, resolve } = Promise.withResolvers<void>()

  const handleChainChanged = () => {
    provider.removeListener('chainChanged', handleChainChanged)

    resolve()
  }

  provider.on('chainChanged', handleChainChanged)

  // wait for chain change event (InjectedWallet will emit this event
  // only after some delay, so our state that reacts to this event
  // would be out of sync if we don't wait here)
  return promise
}
