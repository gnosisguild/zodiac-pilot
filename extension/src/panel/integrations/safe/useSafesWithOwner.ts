import { validateAddress } from '@/utils'
import { useZodiacRoute } from '@/zodiac-routes'
import { useEffect, useState } from 'react'
import { ChainId } from 'ser-kit'
import { initSafeApiKit } from './kits'

export const useSafesWithOwner = (
  ownerAddress: string,
  connectionId?: string
) => {
  const { chainId } = useZodiacRoute(connectionId)

  const [loading, setLoading] = useState(false)
  const [safes, setSafes] = useState<string[]>([])

  const checksumOwnerAddress = validateAddress(ownerAddress)

  useEffect(() => {
    if (!chainId || !checksumOwnerAddress) return

    const safeService = initSafeApiKit(chainId as ChainId)

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
  }, [checksumOwnerAddress, chainId])

  return { loading, safes }
}
