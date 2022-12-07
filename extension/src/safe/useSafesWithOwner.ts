import { providers } from 'ethers'
import { useEffect, useState } from 'react'

import { ChainId } from '../networks'
import { useConnection } from '../settings'
import { validateAddress } from '../utils'

import { initSafeServiceClient } from './initSafeServiceClient'

export const useSafesWithOwner = (ownerAddress: string) => {
  const { provider, connected, chainId } = useConnection()

  const [loading, setLoading] = useState(false)
  const [safes, setSafes] = useState<string[]>([])

  const checksumOwnerAddress = validateAddress(ownerAddress)

  useEffect(() => {
    if (!connected || !chainId || !checksumOwnerAddress) return

    const safeService = initSafeServiceClient(
      new providers.Web3Provider(provider),
      chainId as ChainId
    )

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
