import { useEffect, useState } from 'react'

import { ChainId } from '../chains'
import { useConnection } from '../settings'
import { validateAddress } from '../utils'

import { initSafeApiKit } from './kits'

export const useSafeDelegates = (
  safeAddress: string,
  connectionId?: string
) => {
  const { provider, connected, chainId } = useConnection(connectionId)

  const [loading, setLoading] = useState(false)
  const [delegates, setDelegates] = useState<string[]>([])

  const checksumSafeAddress = validateAddress(safeAddress)

  useEffect(() => {
    if (!connected || !chainId || !checksumSafeAddress) return

    const safeApiKit = initSafeApiKit(provider, chainId as ChainId)

    setLoading(true)
    let canceled = false

    safeApiKit
      .getSafeDelegates({ safeAddress: checksumSafeAddress })
      .then((res) => {
        if (!canceled) {
          setDelegates(res.results.map((delegate) => delegate.delegate))
        }
      })
      .catch((e) => {
        console.error(`Error fetching delegates for ${checksumSafeAddress}`, e)
      })
      .finally(() => {
        setLoading(false)
      })

    return () => {
      setLoading(false)
      setDelegates([])
      canceled = true
    }
  }, [provider, checksumSafeAddress, connected, chainId])

  return { loading, delegates }
}
