import { useEffect, useState } from 'react'

import { ChainId } from '../chains'
import { useConnection } from '../settings'
import { validateAddress } from '../utils'

import { initSafeApiKit } from './kits'

export const useSafesWithOwner = (
  ownerAddress: string,
  connectionId?: string
) => {
  const { provider, connected, chainId } = useConnection(connectionId)

  const [loading, setLoading] = useState(false)
  const [safes, setSafes] = useState<string[]>([])

  const checksumOwnerAddress = validateAddress(ownerAddress)

  useEffect(() => {
    if (!connected || !chainId || !checksumOwnerAddress) return

    const safeService = initSafeApiKit(provider, chainId as ChainId)

    setLoading(true)
    let canceled = false

    safeService
      .getSafesByOwner(checksumOwnerAddress)
      .then((res) => {
        if (!canceled) {
          setSafes(res.safes)
        }
      })
      .catch((e) => {
        console.error(`Error fetching safes for ${checksumOwnerAddress}`, e)
      })
      .finally(() => {
        setLoading(false)
      })

    return () => {
      setLoading(false)
      setSafes([])
      canceled = true
    }
  }, [provider, checksumOwnerAddress, connected, chainId])

  return { loading, safes }
}
