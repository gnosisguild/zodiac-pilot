import { infoToast } from '@/components'
import { BrowserProvider } from 'ethers'
import { useCallback, useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import type { ChainId } from 'ser-kit'
import type { ConnectResult } from '../connectTypes'
import { ConnectProvider } from './ConnectProvider'
import type { InjectedWalletError } from './InjectedWalletError'
import { memoWhilePending } from './memoWhilePending'

type ConnectOptions = {
  onBeforeConnect?: () => void
  onConnect?: (chainId: ChainId, accounts: string[]) => void
  onError?: () => void
}

export const useConnect = (
  provider: ConnectProvider,
  { onBeforeConnect, onConnect, onError }: ConnectOptions,
) => {
  const onConnectRef = useRef(onConnect)
  const onErrorRef = useRef(onError)
  const onBeforeConnectRef = useRef(onBeforeConnect)

  useEffect(() => {
    onBeforeConnectRef.current = onBeforeConnect
  }, [onBeforeConnect])

  useEffect(() => {
    onErrorRef.current = onError
  }, [onError])

  useEffect(() => {
    onConnectRef.current = onConnect
  }, [onConnect])

  const connect = useCallback(
    async ({ force }: { force?: boolean } = {}): Promise<
      ConnectResult | undefined
    > => {
      if (onBeforeConnectRef.current) {
        onBeforeConnectRef.current()
      }

      try {
        const { accounts, chainId } = await connectInjectedWallet(
          { force },
          provider,
        )

        if (onConnectRef.current) {
          onConnectRef.current(chainId, accounts)
        }

        return { accounts, chainId }
      } catch {
        if (onErrorRef.current) {
          onErrorRef.current()
        }
      }
    },
    [provider],
  )

  return connect
}

const connectInjectedWallet = memoWhilePending(
  async (provider: ConnectProvider): Promise<ConnectResult> => {
    const browserProvider = new BrowserProvider(provider)

    const accountsPromise = browserProvider
      .send('eth_requestAccounts', [])
      .catch((err: any) => {
        if ((err as InjectedWalletError).code === -32002) {
          return new Promise((resolve: (value: string[]) => void) => {
            const toastId = infoToast({
              title: 'Connection',
              message: 'Check your wallet to confirm connection',
            })

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

    const [accounts, chainIdBigInt] = await Promise.all([
      accountsPromise,
      browserProvider.getNetwork().then((network) => network.chainId),
    ])

    return { accounts, chainId: Number(chainIdBigInt) as unknown as ChainId }
  },
)
