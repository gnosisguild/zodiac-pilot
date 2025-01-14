import { validateAddress } from '@/utils'
import { invariantResponse } from '@epic-web/invariant'
import { verifyChainId } from '@zodiac/chains'
import { initSafeApiKit } from '@zodiac/safe'
import type { Route } from './+types/available-safes'

export const loader = async ({ params }: Route.LoaderArgs) => {
  const { chainId, account } = params

  const safeService = initSafeApiKit(verifyChainId(parseInt(chainId)))
  const validatedAddress = validateAddress(account)

  invariantResponse(validatedAddress != null, `Invalid address: ${account}`)

  try {
    const { safes } = await safeService.getSafesByOwner(validatedAddress)

    return safes
  } catch {
    return []
  }
}
