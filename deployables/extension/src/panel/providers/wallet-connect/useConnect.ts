import { invariant } from '@epic-web/invariant'
import { useCallback, useEffect, useRef } from 'react'
import type { ChainId } from 'ser-kit'
import { WalletConnectEthereumMultiProvider } from './WalletConnectEthereumMultiProvider'

type UseConnectOptions = {
  onBeforeConnect?: () => void
  onConnect?: (chainId: ChainId, accounts: string[]) => void
  onError?: () => void
}

export const useConnect = (
  provider: WalletConnectEthereumMultiProvider | null,
  { onBeforeConnect, onConnect, onError }: UseConnectOptions,
) => {
  const onBeforeConnectRef = useRef(onBeforeConnect)
  const onConnectRef = useRef(onConnect)
  const onErrorRef = useRef(onError)

  useEffect(() => {
    onBeforeConnectRef.current = onBeforeConnect
  }, [onBeforeConnect])

  useEffect(() => {
    onConnectRef.current = onConnect
  }, [onConnect])

  useEffect(() => {
    onErrorRef.current = onError
  }, [onError])

  return useCallback(async () => {
    invariant(provider != null, 'provider not initialized')

    if (onBeforeConnectRef.current) {
      onBeforeConnectRef.current()
    }

    console.debug('Connecting WalletConnect...')

    const { promise, resolve } = Promise.withResolvers()

    provider.once('chainChanged', resolve)

    await provider.disconnect()

    try {
      await provider.connect()

      const chainId = provider.chainId as unknown as ChainId
      const accounts = provider.accounts

      if (onConnectRef.current) {
        onConnectRef.current(chainId, accounts)
      }

      // at this point provider.chainId is generally 1.
      // we gotta wait for the chainChanged event which
      // will be emitted even if the final chainId continues to be 1
      await promise

      console.debug('WalletConnect connected!')

      return { chainId, accounts }
    } catch {
      if (onErrorRef.current) {
        onErrorRef.current()
      }
    }
  }, [provider])
}
