import { validateAddress } from '@/utils'
import { useEffect, useState } from 'react'
import { ChainId } from 'ser-kit'
import { useRoute } from '../../routes'
import { initSafeApiKit } from './kits'

export const useSafeDelegates = (
  safeAddress: string,
  connectionId?: string
) => {
  const { provider, chainId } = useRoute(connectionId)

  const [loading, setLoading] = useState(false)
  const [delegates, setDelegates] = useState<string[]>([])

  const checksumSafeAddress = validateAddress(safeAddress)

  useEffect(() => {
    if (!chainId || !checksumSafeAddress) return

    const safeApiKit = initSafeApiKit(chainId as ChainId)

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
  }, [provider, checksumSafeAddress, chainId])

  return { loading, delegates }
}
