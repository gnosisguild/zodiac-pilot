import type { ChainId } from '@zodiac/chains'
import { initSafeApiKit } from '@zodiac/safe'
import type { HexAddress } from '@zodiac/schema'

export const isSafeAccount = async (
  chainId: ChainId,
  safeAddress: HexAddress,
) => {
  const safeService = initSafeApiKit(chainId)

  try {
    await safeService.getSafeInfo(safeAddress)
    return true
  } catch {
    return false
  }
}
