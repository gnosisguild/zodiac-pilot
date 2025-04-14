import type { ChainId } from '@zodiac/chains'
import { initSafeApiKit } from '@zodiac/safe'

export const isSafeAccount = async (chainId: ChainId, safeAddress: string) => {
  const safeService = initSafeApiKit(chainId)

  try {
    await safeService.getSafeInfo(safeAddress)
    return true
  } catch {
    return false
  }
}
