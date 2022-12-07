import { useEffect, useState } from 'react'

import { ChainId } from '../networks'
import { useConnection } from '../settings'
import { validateAddress } from '../utils'

import { initSafeServiceClient } from './initSafeServiceClient'

export const useSafeDelegates = (safeAddress: string) => {
  const { provider, connected, chainId } = useConnection()

  const [loading, setLoading] = useState(false)
  const [delegates, setDelegates] = useState<string[]>([])

  const checksumSafeAddress = validateAddress(safeAddress)

  useEffect(() => {
    if (!connected || !chainId || !checksumSafeAddress) return

    const safeService = initSafeServiceClient(provider, chainId as ChainId)

    setLoading(true)
    let canceled = false

    safeService
      .getSafeDelegates(checksumSafeAddress)
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
