import { SafeInfoResponse } from '@safe-global/safe-service-client'
import { useEffect, useState } from 'react'

import { ChainId } from '../networks'
import { useConnection } from '../settings'
import { validateAddress } from '../utils'

import { initSafeServiceClient } from './initSafeServiceClient'

export const useSafe = (address: string, connectionId?: string) => {
  const { provider, connected, chainId } = useConnection(connectionId)

  const [loading, setLoading] = useState(false)
  const [safe, setSafe] = useState<SafeInfoResponse | null>(null)

  const checksumAddress = validateAddress(address)

  useEffect(() => {
    if (!connected || !chainId || !checksumAddress) return

    const safeService = initSafeServiceClient(provider, chainId as ChainId)

    setLoading(true)
    let canceled = false

    safeService
      .getSafeInfo(checksumAddress)
      .then((res) => {
        if (!canceled) {
          setSafe(res)
        }
      })
      .catch((e) => {
        console.error(`Error fetching info for safe ${checksumAddress}`, e)
      })
      .finally(() => {
        setLoading(false)
      })

    return () => {
      setLoading(false)
      setSafe(null)
      canceled = true
    }
  }, [provider, checksumAddress, connected, chainId])

  return { loading, safe }
}
