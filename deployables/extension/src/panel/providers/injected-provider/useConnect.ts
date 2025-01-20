import { sentry } from '@/sentry'
import type { Eip1193Provider } from '@/types'
import { invariant } from '@epic-web/invariant'
import { infoToast } from '@zodiac/ui'
import { BrowserProvider } from 'ethers'
import { useCallback, useEffect, useRef } from 'react'
import type { ChainId } from 'ser-kit'
import type { ConnectResult } from '../connectTypes'
import type { InjectedWalletError } from './InjectedWalletError'
import { memoWhilePending } from './memoWhilePending'

type ConnectOptions = {
  onBeforeConnect?: () => void
  onConnect?: (chainId: ChainId, accounts: string[]) => void
  onError?: () => void
}

export const useConnect = (
  provider: Eip1193Provider | null,
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
      invariant(
        provider != null,
        'Cannot connect because the provider has not been set up, yet.',
      )

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
  async (provider: Eip1193Provider): Promise<ConnectResult> => {
    const browserProvider = new BrowserProvider(provider)

    const accountsPromise = browserProvider
      .send('eth_requestAccounts', [])
      .catch((err: any) => {
        if ((err as InjectedWalletError).code === -32002) {
          return new Promise((resolve: (value: string[]) => void) => {
            const { dismiss } = infoToast({
              title: 'Connection',
              message: 'Check your wallet to confirm connection',
            })

            const handleAccountsChanged = (accounts: string[]) => {
              resolve(accounts)
              dismiss()
              provider.removeListener('accountsChanged', handleAccountsChanged)
            }

            provider.on('accountsChanged', handleAccountsChanged)
          })
        }

        sentry.captureException(err)

        throw err
      })

    const [accounts, chainIdBigInt] = await Promise.all([
      accountsPromise,
      browserProvider.getNetwork().then((network) => network.chainId),
    ])

    return { accounts, chainId: Number(chainIdBigInt) as unknown as ChainId }
  },
)
