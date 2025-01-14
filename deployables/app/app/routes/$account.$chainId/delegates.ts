import { validateAddress } from '@/utils'
import { verifyChainId } from '@zodiac/chains'
import { initSafeApiKit } from '@zodiac/safe'
import type { Route } from './+types/delegates'

export const loader = async ({ params }: Route.LoaderArgs) => {
  const { chainId, account } = params

  const safeService = initSafeApiKit(verifyChainId(parseInt(chainId)))

  try {
    const { results } = await safeService.getSafeDelegates({
      safeAddress: validateAddress(account),
    })

    return results.map((delegate) => delegate.delegate)
  } catch {
    return []
  }
}
