import { validateAddress } from '@/utils'
import { verifyChainId } from '@zodiac/chains'
import { initSafeApiKit } from '@zodiac/safe'
import type { Route } from './+types/available-safes'

export const loader = async ({ params }: Route.LoaderArgs) => {
  const { chainId, account } = params

  const safeService = initSafeApiKit(verifyChainId(parseInt(chainId)))

  try {
    const { safes } = await safeService.getSafesByOwner(
      validateAddress(account),
    )

    return safes
  } catch {
    return []
  }
}
