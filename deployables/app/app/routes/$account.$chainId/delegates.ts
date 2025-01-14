import { validateAddress } from '@/utils'
import { invariantResponse } from '@epic-web/invariant'
import { verifyChainId } from '@zodiac/chains'
import { initSafeApiKit } from '@zodiac/safe'
import type { Route } from './+types/delegates'

export const loader = async ({ params }: Route.LoaderArgs) => {
  const { chainId, account } = params

  const safeService = initSafeApiKit(verifyChainId(parseInt(chainId)))
  const validatedAddress = validateAddress(account)

  invariantResponse(validatedAddress != null, `Invalid address: ${account}`)

  try {
    const { results } = await safeService.getSafeDelegates({
      safeAddress: validatedAddress,
    })

    return results.map((delegate) => delegate.delegate)
  } catch {
    return []
  }
}
