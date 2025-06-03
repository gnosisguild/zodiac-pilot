import { sentry } from '@/sentry'
import type { Hex } from '@zodiac/schema'
import { getAddress } from 'ethers'
import type { ChainId } from 'ser-kit'
import type { ContractInfo } from './state'

export const fetchContractInfo = async (
  address: Hex,
  chainId: ChainId,
): Promise<ContractInfo> => {
  const url = `https://api.abi.pub/v1/chains/${chainId}/accounts/${address.toLowerCase()}`
  const result = (await memoizedFetchJson(url)) || {
    address: getAddress(address),
    verified: false,
  }

  return 'proxy' in result
    ? {
        address: result.address,
        proxyTo: result.proxy.target,
        name: result.implementation.name,
        verified: result.implementation.verified,
        abi: result.implementation.abi,
      }
    : {
        address: result.address,
        name: result.name,
        verified: result.verified,
        abi: result.abi,
      }
}

const fetchCache = new Map<string, any>()
const memoizedFetchJson = async (url: string) => {
  if (fetchCache.has(url)) {
    return fetchCache.get(url)
  }

  try {
    const res = await fetch(url)

    if (!res.ok) {
      console.error('Failed to fetch contract info', url, res.status)
      fetchCache.set(url, null)
      return null
    }

    const json = await res.json()
    fetchCache.set(url, json)
    return json
  } catch (error) {
    sentry.captureException(error)

    return null
  }
}
